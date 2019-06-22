const colyseus = require('colyseus');

exports.MyRoom = class extends colyseus.Room {

  onInit (options) {
        console.log("CREATING NEW ROOM");
        this.printRoomId();
        //this.MaxClients = 4;
  }
  onJoin (client, options) {
        console.log("CLIENT JOINED");
        this.printClientId(client);
        this.printSessionId(client);
        this.printRoomId();
  }
  onMessage (client, message) {

  }
  onLeave (client, consented) {
        console.log("CLIENT LEFT ROOM");
        this.printClientId(client);
        this.printSessionId(client);
        this.printRoomId();
  }
  onDispose() {
        console.log("DISPOSING ROOM (all clients disconnected)");
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
}
