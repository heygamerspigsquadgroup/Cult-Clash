const colyseus = require('colyseus');
const Matter = require('matter-js');
const State = require('./State').State;
const Player = require('./Player').Player;
const Entity = require('./Entity').Entity;
const ColorCode = require('./ColorCode').ColorCode;
const RuneBagConst = require('./RuneBag');

exports.MyRoom = class extends colyseus.Room {
  onInit (options) {
    this.maxClients = 4;
    this.fps = 30;

    console.log('\nCREATING NEW ROOM');
    this.printRoomId();
    this.setState(new State());
    this.unusedColors = [
      new ColorCode('purple', 2200, 1650),
      new ColorCode('blue', 800, 1650),
      new ColorCode('green', 800, 600),
      new ColorCode('orange', 2200, 600)
    ];
    let keys = this.getKeys();
    this.leftKeys = keys[0];
    this.rightKeys = keys[1];
    this.upKeys = keys[2];
    this.downKeys = keys[3];

    // add physics engine
    this.engine = Matter.Engine.create();
    this.engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: 3200, y: 2400 } };

    this.addPlatform(25, 575);
    this.addPlatform(75, 575);
    this.addPlatform(125, 575);
    this.addPlatform(175, 575);
    this.addPlatform(225, 575);
    this.addPlatform(275, 575);
    this.addPlatform(325, 575);
    this.addPlatform(375, 575);
    this.addPlatform(425, 575);
    this.addPlatform(475, 575);
    this.addPlatform(525, 575);
    this.addPlatform(575, 575);
    this.addPlatform(625, 575);
    this.addPlatform(675, 575);
    this.addPlatform(725, 575);
    this.addPlatform(775, 575);

    this.addPlatform(175, 475);
    this.addPlatform(225, 475);
    this.addPlatform(275, 475);

    this.addPlatform(525, 475);
    this.addPlatform(575, 475);
    this.addPlatform(625, 475);

    this.addPlatform(2100, 850);
    this.addPlatform(2150, 850);
    this.addPlatform(2200, 850);
    this.addPlatform(2250, 850);
    this.addPlatform(2300, 850);
    this.addPlatform(2350, 850);
    this.addPlatform(2400, 850);
    this.addPlatform(2450, 850);
    this.addPlatform(2500, 850);

    this.addPlatform(2100, 1800);
    this.addPlatform(2150, 1800);
    this.addPlatform(2200, 1800);
    this.addPlatform(2250, 1800);
    this.addPlatform(2300, 1800);
    this.addPlatform(2350, 1800);
    this.addPlatform(2400, 1800);
    this.addPlatform(2450, 1800);
    this.addPlatform(2500, 1800);

    this.addPlatform(700, 850);
    this.addPlatform(750, 850);
    this.addPlatform(800, 850);
    this.addPlatform(850, 850);
    this.addPlatform(900, 850);
    this.addPlatform(950, 850);
    this.addPlatform(1000, 850);
    this.addPlatform(1050, 850);
    this.addPlatform(1100, 850);

    this.addPlatform(700, 1800);
    this.addPlatform(750, 1800);
    this.addPlatform(800, 1800);
    this.addPlatform(850, 1800);
    this.addPlatform(900, 1800);
    this.addPlatform(950, 1800);
    this.addPlatform(1000, 1800);
    this.addPlatform(1050, 1800);
    this.addPlatform(1100, 1800);

    // so players dont collide w each other
    this.playerGroup = Matter.Body.nextGroup(true);

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      var pairs = event.pairs;

      // just detects if player body collided with SOMETHING. make sure its ground later
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];

        Object.keys(this.state.players).forEach(key => {
          var player = this.state.players[key];

          if (pair.bodyA.id === player.body.id || pair.bodyB.id === player.body.id) {
            player.isJumping = false;
          }
        });
      }
    });

    // setup update loop
    this.clock.setInterval(() => {
      Matter.Engine.update(this.engine, 1000 / this.fps);

      Object.keys(this.state.players).forEach(key => {
        // update pos_x, pos_y to new physics-calculated position
        this.state.players[key].pos_x = this.state.players[key].body.position.x;
        this.state.players[key].pos_y = this.state.players[key].body.position.y;
      });
    }, 1000 / this.fps);
  }

  onJoin (client, options) {
    console.log('\nCLIENT JOINED (' + this.clients.length + ' clients total)');
    this.printClientId(client);
    this.printSessionId(client);
    this.printRoomId();

    let colorIndex = Math.floor(Math.random() * this.unusedColors.length);
    let color = this.unusedColors[colorIndex];
    this.unusedColors = this.unusedColors.splice(colorIndex, 1);
    this.state.players[client.sessionId] = new Player(color);
    var playerBody = this.state.players[client.sessionId].body;
    playerBody.collisionFilter.group = this.playerGroup;
    // add player's body to world
    Matter.World.add(this.engine.world, playerBody);
  }

  onMessage (client, message) {
    if (message.key) {
      // a client pressed or released a key
      this.handleKeyEvent(client.sessionId, message.key);
    }
    // handle other message types...
  }

  onLeave (client, consented) {
    console.log('\nCLIENT LEFT ROOM (' + this.clients.length + ' clients remain)');
    this.printClientId(client);
    this.printSessionId(client);
    this.printRoomId();
    this.unusedColors.push(this.state.players[client.sessionId].colorCode);

    // remove player's body from world
    Matter.World.remove(this.engine.world, this.state.players[client.sessionId].body);
    delete this.state.players[client.sessionId];
  }

  onDispose () {
    console.log('\nDISPOSING ROOM (all clients disconnected)');
    this.printRoomId();
  }

  handleKeyEvent (sessionId, keyMsg) {
    // keyMsg should be {pressed: true/false, keyCode: ##}
    if (this.state.players[sessionId]) {
      var player = this.state.players[sessionId];

      // update held state
      if (keyMsg.keyCode === player.keyUp.keyCode) {
        player.keyUp.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyLeft.keyCode) {
        player.keyLeft.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyDown.keyCode) {
        player.keyDown.isHeld = keyMsg.keyDown;
      } else if (keyMsg.keyCode === player.keyRight.keyCode) {
        player.keyRight.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyAction.keyCode) {
        if (keyMsg.pressed && !player.keyAction.isHeld) {
          this.broadcast('doot');
        }
        player.keyAction.isHeld = keyMsg.pressed;
      }

      if (player.keyUp.isHeld) {
        if (!player.isJumping) {
          Matter.Body.setVelocity(player.body, { x: player.body.velocity.x, y: -18 });
          player.isJumping = true;
        } else {

          // Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
          // cant control jump height, but doesnt have weird stopping thing
        }
      }

      if (keyMsg.keyCode === player.keyLeft.keyCode) {
        if (keyMsg.pressed) {
          Matter.Body.setVelocity(player.body, { x: -1 * player.speed, y: player.body.velocity.y });
        } else {
          if (!player.keyRight.isHeld) {
            Matter.Body.setVelocity(player.body, { x: 0, y: player.body.velocity.y });
          } else {
            Matter.Body.setVelocity(player.body, { x: player.speed, y: player.body.velocity.y });
          }
        }
      } else if (keyMsg.keyCode === player.keyRight.keyCode) {
        if (keyMsg.pressed) {
          Matter.Body.setVelocity(player.body, { x: player.speed, y: player.body.velocity.y });
        } else {
          if (!player.keyLeft.isHeld) {
            Matter.Body.setVelocity(player.body, { x: 0, y: player.body.velocity.y });
          } else {
            Matter.Body.setVelocity(player.body, { x: -1 * player.speed, y: player.body.velocity.y });
          }
        }
      }
    }
  }

  // add a platform object to list
  addPlatform (x, y) {
    // fix platform gif size
    var platform = new Entity(Matter.Bodies.rectangle(x, y, 50, 50, { isStatic: true }));
    Matter.World.add(this.engine.world, platform.body);
    this.state.platforms.push(platform);
  }

  printRoomId () {
    console.log('\t(Room ID: ' + this.roomId + ')');
  }
  printSessionId (client) {
    console.log('\t(Session ID: ' + client.sessionId + ')');
  }
  printClientId (client) {
    console.log('\t(Client ID: ' + client.id + ')');
  }

  getKeys () {
    const SHUFFLE_COUNT = 8;
    let keys = [RuneBagConst.MOVEMENT_SET_1, RuneBagConst.MOVEMENT_SET_2, RuneBagConst.MOVEMENT_SET_3, RuneBagConst.MOVEMENT_SET_4];
    for (let i = 0; i < SHUFFLE_COUNT; i++) {
      let first = Math.floor(Math.random() * keys.length);
      let second = Math.floor(Math.random() * keys.length);
      [keys[first], keys[second]] = [keys[second], keys[first]];
    }
    return keys;
  }
};
