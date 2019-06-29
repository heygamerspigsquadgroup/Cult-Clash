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
    this.engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: 800, y: 600 } };
    
    this.ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true});
    Matter.World.add(this.engine.world, this.ground);

    this.playerGroup = Matter.Body.nextGroup(true);

/*    Matter.Events.on(this.engine, 'collisionStart', function(event) {
      console.log("COLLISION!!");
        let a = event.pairs.bodyA;
        let b = event.pairs.bodyB;

        console.log(a);
        console.log(b);


        // check bodies, do whatever...
    });*/

  /*Matter.Events.on(this.engine, 'collisionStart', (event) => {
      console.log("COLLISION!");
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
          var pair = pairs[i];
          console.log(pair.bodyA);
          console.log(pair.bodyB);
   
        Object.keys(this.state.players).forEach(key => {
          if (pair.bodyA === this.state.players[key].floorSensor){
            console.log("floor sensor was body A");
          }
          else if (pair.bodyB === this.state.players[key].floorSensor){
            console.log("floor sensor was body B");
          }
        });
      }
  })*/

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
            Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: -15});
            player.isJumping = true;
          }
        else{
                      //Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
          //cant control jump height, but doesnt have weird stopping thing
          //Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
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


/*
      if (player.keyRight.isHeld === player.keyLeft.isHeld){
        Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
      }
      else if(!player.keyRight.isHeld && player.keyLeft.isHeld){
        Matter.Body.setVelocity(player.body, {x: -1 * player.speed, y: player.body.velocity.y});
      }
      else if(player.keyRight.isHeld && !player.keyLeft.isHeld){
        Matter.Body.setVelocity(player.body, {x: player.speed, y: player.body.velocity.y});
      }
*/


/*
      if (keyMsg.keyCode === player.keyUp.keyCode) {
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: -10});
        }
        else{
          Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
        }
      } 

      else if (keyMsg.keyCode === player.keyLeft.keyCode) {
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: -5, y: player.body.velocity.y});
        }
        else if (!player.keyRight.pressed){
          Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
        }
      } 

      else if (keyMsg.keyCode === player.keyDown.keyCode) {
        if(keyMsg.pressed){
          //keydown
        }
        else{
          //keyup
        }      
      } 

      else if (keyMsg.keyCode === player.keyRight.keyCode) {
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: 5, y: player.body.velocity.y});
        }
        else if (!player.keyLeft.pressed){
          Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
        }      
      } 

      else if (keyMsg.keyCode === player.keyAction.keyCode) {
        if(keyMsg.pressed){
        }
        else{
        }      
      }
      */


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
