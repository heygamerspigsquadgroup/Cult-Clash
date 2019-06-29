const colyseus = require('colyseus');
const Matter = require('matter-js');
const State = require('./State').State;
const Player = require('./Player').Player;
const Entity = require('./Entity').Entity;

exports.MyRoom = class extends colyseus.Room {
  onInit (options) {
    this.maxClients = 4;
    this.fps = 30;

    console.log('\nCREATING NEW ROOM');
    this.printRoomId();
    this.setState(new State());

    // add physics engine
    this.engine = Matter.Engine.create();
    this.engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: 800, y: 600 } };
    
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


    // so players dont collide w each other
    this.playerGroup = Matter.Body.nextGroup(true);

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
        var pairs = event.pairs;

        // just detects if player body collided with SOMETHING. make sure its ground later
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];

            Object.keys(this.state.players).forEach(key => {
              var player = this.state.players[key];

              if (pair.bodyA.id === player.body.id || pair.bodyB.id === player.body.id){
                console.log("player collided");
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

    this.state.players[client.sessionId] = new Player(400, 200);
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
      } 

      else if (keyMsg.keyCode === player.keyLeft.keyCode) {
        player.keyLeft.isHeld = keyMsg.pressed;
      } 

      else if (keyMsg.keyCode === player.keyDown.keyCode) {
        player.keyDown.isHeld = keyMsg.keyDown;
      } 

      else if (keyMsg.keyCode === player.keyRight.keyCode) {
        player.keyRight.isHeld = keyMsg.pressed;
      } 

      else if (keyMsg.keyCode === player.keyAction.keyCode) {
        player.keyAction.isHeld = keyMsg.pressed;    
      }


      if (player.keyUp.isHeld) {
          if(!player.isJumping){
            Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: -18});
            player.isJumping = true;
          }
        else{

          //Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
          //cant control jump height, but doesnt have weird stopping thing
        }
      } 

      if (keyMsg.keyCode === player.keyLeft.keyCode) {
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: -1 * player.speed, y: player.body.velocity.y});
        }
        else {
          if(!player.keyRight.isHeld){
            Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
          }
          else{
            Matter.Body.setVelocity(player.body, {x: player.speed, y: player.body.velocity.y});
          }
        }
      } 

      else if (keyMsg.keyCode === player.keyRight.keyCode) {
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: player.speed, y: player.body.velocity.y});
        }
        else{
          if (!player.keyLeft.isHeld){
            Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
          }
          else{
            Matter.Body.setVelocity(player.body, {x: -1 * player.speed, y: player.body.velocity.y});
          }
        }      
      }
    }
  }

  // add a platform object to list
  addPlatform(x, y) {
    // fix platform gif size
    var platform = new Entity(Matter.Bodies.rectangle(x, y, 50, 50, { isStatic: true}));
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
};
