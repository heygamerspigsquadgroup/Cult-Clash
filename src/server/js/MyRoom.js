const colyseus = require('colyseus');
const Matter = require('matter-js');
const State = require('./State').State;
const Player = require('./Player').Player;

exports.MyRoom = class extends colyseus.Room {
  onInit (options) {
    this.maxClients = 4;
    this.fps = 30;

    console.log('\nCREATING NEW ROOM');
    this.printRoomId();
    this.setState(new State());

    // add physics engine
    this.engine = Matter.Engine.create();
    // todo: make a platform class and add objects
    Matter.World.add(this.engine.world, Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true }));
    this.engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: 800, y: 600 } };

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

    var playerBody = Matter.Bodies.rectangle(400, 200, 40, 40);
    this.state.players[client.sessionId] = new Player(playerBody);
    this.state.players[client.sessionId].body.mass = 10;
    this.state.players[client.sessionId].body.inertia = Infinity;
    this.state.players[client.sessionId].body.slop = 0;
    console.log(this.state.players[client.sessionId].body);
    // add player's body to world
    Matter.World.add(this.engine.world, this.state.players[client.sessionId].body);
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

      // update keypress state
      if (keyMsg.keyCode === player.keyUp.keyCode) {
        player.keyUp.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyLeft.keyCode) {
        player.keyLeft.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyDown.keyCode) {
        player.keyDown.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyRight.keyCode) {
        player.keyRight.isHeld = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyAction.keyCode) {
        player.keyAction.isHeld = keyMsg.pressed;
      }

      var speed = 3;
      // update position
      if (player.keyUp.isHeld) {
        //player.pos_y -= speed;
      }
      if (player.keyLeft.isHeld) {
        //Matter.Body.applyForce( player.body, {x: player.body.position.x, y: player.body.position.y}, {x: -0.005, y: 0});
        Matter.Body.setVelocity(player.body, {x: -5, y: 0})
        //player.body.setVelocityX(-5);
        //player.pos_x -= speed;
      }
      if (player.keyDown.isHeld) {
        //player.pos_y += speed;
      }
      if (player.keyRight.isHeld) {
                Matter.Body.setVelocity(player.body, {x: 5, y: 0})
        //Matter.Body.applyForce( player.body, {x: player.body.position.x, y: player.body.position.y}, {x: 0.005, y: 0});
        //player.body.setVelocityX(-5);
        //player.pos_x += speed;
      }
    }
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
};
