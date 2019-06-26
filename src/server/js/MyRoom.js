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
    // keyMsg should be {state: up/down, keyCode: #}
    if (this.state.players[sessionId]) {
      var player = this.state.players[sessionId];

      if (keyMsg.state === 'down') {
        if (keyMsg.keyCode === player.key_up) {
          console.log(sessionId + ' pressed up.');
          player.pos_y += 1;
        } else if (keyMsg.keyCode === player.key_left) {
          console.log(sessionId + ' pressed left.');
          player.pos_x -= 1;
        } else if (keyMsg.keyCode === player.key_down) {
          console.log(sessionId + ' pressed down.');
          player.pos_y -= 1;
        } else if (keyMsg.keyCode === player.key_right) {
          console.log(sessionId + ' pressed right.');
          player.pos_x += 1;
        } else if (keyMsg.keyCode === player.key_action) {
          console.log(sessionId + ' pressed ACTION.');
        }
        player.printEntity();
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
