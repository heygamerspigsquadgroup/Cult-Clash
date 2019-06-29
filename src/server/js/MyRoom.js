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

    this.groundCat = 0x0001;
    this.playerCat = 0x0002;

    // add physics engine
    this.engine = Matter.Engine.create();    // todo: make a platform class and add objects
    
    //this.ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true , collisionFilter: {mask: this.groundCat}});
    this.ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
    Matter.World.add(this.engine.world, this.ground);
    this.engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: 800, y: 600 } };


//collisionFilter: {mask: defaultCategory | redCategory};
    Matter.Events.on(this.engine, 'collisionStart', function(event) {
      console.log("COLLISION!!");
        let a = event.pairs.bodyA;
        let b = event.pairs.bodyB;

        console.log(event);
        console.log(a);
        console.log(b);


        // check bodies, do whatever...
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

    //var playerBody = Matter.Bodies.rectangle(400, 200, 157, 157, {collisionFilter: {mask: this.playerCat}});
        var playerBody = Matter.Bodies.rectangle(400, 200, 157, 157);
    this.state.players[client.sessionId] = new Player(playerBody);
    this.state.players[client.sessionId].body.inertia = Infinity;
    this.state.players[client.sessionId].body.inverseInertia = 0;
    this.state.players[client.sessionId].body.friction = 0;
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

      if (keyMsg.keyCode === player.keyUp.keyCode) {
        player.keyUp.isHeld = keyMsg.pressed;
        if(keyMsg.pressed){
          //keydown
          Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: -10});

        }
        else{
                    Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
        }

      } 

      else if (keyMsg.keyCode === player.keyLeft.keyCode) {
        player.keyLeft.isHeld = keyMsg.pressed;
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: -5, y: player.body.velocity.y});
        }
        else{
          Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
        }
      } 

      else if (keyMsg.keyCode === player.keyDown.keyCode) {
        player.keyLeft.isHeld = keyMsg.keyDown;
        if(keyMsg.pressed){
          //keydown
        }
        else{
          //keyup
        }      
      } 

      else if (keyMsg.keyCode === player.keyRight.keyCode) {
        player.keyRight.isHeld = keyMsg.pressed;
        if(keyMsg.pressed){
          Matter.Body.setVelocity(player.body, {x: 5, y: player.body.velocity.y});
        }
        else{
          Matter.Body.setVelocity(player.body, {x: 0, y: player.body.velocity.y});
        }      
      } 

      else if (keyMsg.keyCode === player.keyAction.keyCode) {
        if(keyMsg.pressed){
          //keydown
        }
        else{
          //keyup
        }      
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
