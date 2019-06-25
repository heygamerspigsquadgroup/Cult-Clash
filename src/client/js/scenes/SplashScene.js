/* global Phaser */
import Player from '../Player.js';

export default class SplashScene extends Phaser.Scene {
  preload () {
    // wtf i cant get this to load
    this.load.image('goku', './assets/goku.png');
  }

  create () {    
    var client = new Colyseus.Client('ws://localhost:2567');
    var room = client.join("my_room");

    room.onJoin.add(() => {
      room.state.players.onAdd = (player, key) => {
        console.log(player, "has been added at", key);
        console.log(room.state.players[key]);

        this.playerList[key] = new Player();
        this.playerList[key].sprite = this.add.sprite(player.pos_x, -1* player.pos_y, 'goku');
        //add player object here
        console.log(this.playerList);

        //add listener for this players position
        player.onChange = (changes) => {
          changes.forEach(change => {
            if(change.field === "pos_x"){
              console.log(key + " X: " + change.value);
              this.playerList[key].sprite.x = change.value;
            }
            if(change.field === "pos_y"){
              console.log(key + " Y: " + change.value);
              this.playerList[key].sprite.y = -1 * change.value;
            }
          });
        };
      };

      room.state.players.onRemove = (player, key) => {
        console.log(player, "has been removed at", key);
        this.playerList[key].sprite.destroy(); // probably make a destructor for players
        delete this.playerList[key];
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