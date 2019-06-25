/* global Phaser */

export default class SplashScene extends Phaser.Scene {
  preload () {
  }

  create () {
    var client = new Colyseus.Client('ws://localhost:2567');
    var room = client.join("my_room");

    room.onJoin.add(() => {
      room.state.players.onAdd = (player, key) => {
        console.log(player, "has been added at", key);
        console.log(room.state.players[key]);
        //add player object here

        //add listener for this players position
        player.onChange = (changes) => {
          changes.forEach(change => {
            if(change.field = "pos_x"){
              console.log(key + " X: " + change.value);
              //update position here
            }
            else if(change.field = "pos_y"){
              console.log(key + " Y: " + change.value);
              //update position here
            }
            //console.log(change.previousValue);
          });
        };
      };

      room.state.players.onRemove = (player, key) => {
        console.log(player, "has been removed at", key);
        // remove player object
      };
    });

    // add handlers for key presses
    this.input.keyboard.on('keydown', (event) => {
      room.send({ key: { state: "down", keyCode: event.keyCode }});
    });

    this.input.keyboard.on('keyup', (event) => {
      room.send({ key: { state: "up", keyCode: event.keyCode }});
    });
  }

  update() {

  }
}

SplashScene.prototype.playerList = new Map();