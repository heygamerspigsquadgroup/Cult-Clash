const colyseus = require('colyseus');
const State = require('./State').State;
const Player = require('./Player').Player;

exports.MyRoom = class extends colyseus.Room {
  onInit (options) {
    this.maxClients = 4;

    console.log('\nCREATING NEW ROOM');
    this.printRoomId();
    this.setState(new State());
  }
  onJoin (client, options) {
    console.log('\nCLIENT JOINED (' + this.clients.length + ' clients total)');
    this.printClientId(client);
    this.printSessionId(client);
    this.printRoomId();

    this.state.players[client.sessionId] = new Player();
  }

  onMessage (client, message) {
    // console.log("Message from:", client.sessionId, ":", message);
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
        player.pos_y += speed;
      }
      if (player.keyLeft.isHeld) {
        player.pos_x -= speed;
      }
      if (player.keyDown.isHeld) {
        player.pos_y -= speed;
      }
      if (player.keyRight.isHeld) {
        player.pos_x += speed;
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
