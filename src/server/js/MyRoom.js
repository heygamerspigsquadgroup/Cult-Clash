const colyseus = require('colyseus');
//const State = require('./State').State;

exports.MyRoom = class extends colyseus.Room {


  onInit (options) {
        console.log("\nCREATING NEW ROOM");
        this.printRoomId();
        //this.setState(new State());
        //this.setState({});
        // I CANT GET SETSTATE TO WORK....

        this.MaxClients = 4;
        this.playerList = {players: []};
        // this is my own 'state' for now i guess
        this.badState = {roomId: this.roomId,
                            playerList: []};
  }
  onJoin (client, options) {
        console.log("\nCLIENT JOINED (" + this.clients.length + " clients total)");
        this.printClientId(client);
        this.printSessionId(client);
        this.printRoomId();

        this.badState.playerList = this.clients.map(c => c.sessionId);
        this.broadcast(this.badState);

        // no more clients can join this room.
        // a new room is made for further connections
        if (this.clients.length >= this.MaxClients){
          this.lock();
        }
  }
  
  onMessage (client, message) {
      console.log("Message from:", client.sessionId, ":", message);
  }

  onLeave (client, consented) {
        console.log("\nCLIENT LEFT ROOM (" + this.clients.length + " clients remain)");
        this.printClientId(client);
        this.printSessionId(client);
        this.printRoomId();

        this.badState.playerList = this.clients.map(c => c.sessionId);
        this.broadcast(this.badState);

        // allow clients to join this room again
        if (this.clients.length < this.MaxClients){
          this.unlock();
        }
  }

  onDispose() {
        console.log("\nDISPOSING ROOM (all clients disconnected)");
        this.printRoomId();
  }


  printRoomId(){
        console.log("\t(Room ID: " + this.roomId + ")");
  }
  printSessionId(client){
        console.log("\t(Session ID: " + client.sessionId + ")");
  }
  printClientId(client){
        console.log("\t(Client ID: " + client.id + ")");
  }
};