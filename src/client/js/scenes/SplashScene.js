/* global Phaser */
/* global Phaser Colyseus */

import Player from '../Player.js';

export default class SplashScene extends Phaser.Scene {
  preload () {
    this.add.image('goku', '/assets/goku.png');

    this.playerList = new Map();
  }

  create () {
    var client = new Colyseus.Client('ws://localhost:2567');
    var room = client.join('my_room');

    room.onJoin.add(() => {
      room.state.players.onAdd = (player, key) => {
        this.playerList[key] = new Player();
        this.playerList[key].sprite = this.add.sprite(player.pos_x, player.pos_y, 'goku');

        // add listener for this players position
        player.onChange = (changes) => {
          changes.forEach(change => {
            if (change.field === 'pos_x') {
              this.playerList[key].sprite.x = change.value;
            }
            if (change.field === 'pos_y') {
              this.playerList[key].sprite.y = change.value;
            }
          });
        };
      };

      room.state.players.onRemove = (player, key) => {
        this.playerList[key].sprite.destroy(); // probably make a destructor for players
        delete this.playerList[key];
      };
    });

    // add handlers for key presses
    this.input.keyboard.on('keydown', (event) => {
      room.send({ key: { pressed: true, keyCode: event.keyCode } });
    });

    this.input.keyboard.on('keyup', (event) => {
      room.send({ key: { pressed: false, keyCode: event.keyCode } });
    });
  }

  update () {

  }
}
