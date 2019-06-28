/* global Phaser Colyseus ReactDOM */

import Player from '../entities/Player.js';
import MatchSceneComponent from '../react/MatchSceneComponent.js';

export const MATCH_SCENE_ID = 'matchScene';

export default class MatchScene extends Phaser.Scene {
  constructor () {
    super(MATCH_SCENE_ID);
  }

  preload () {
    this.load.image('cultist', './assets/cultist.png');
    const domContainer = document.querySelector('#ui_container');
    ReactDOM.render(<MatchSceneComponent />, domContainer);

    this.playerList = new Map();
  }

  create () {
    const websocketUrl = window.location.hostname === 'localhost'
      ? 'ws://localhost:2567'
      : 'wss://api' + window.location.hostname.substring(3) + ':443';
    this.client = new Colyseus.Client(websocketUrl);
    this.room = this.client.join('my_room');

    this.room.onJoin.add(() => {
      this.room.state.players.onAdd = (player, key) => {
        this.playerList[key] = new Player(this.add.sprite(player.pos_x, -1 * player.pos_y, 'cultist'));

        // add listener for this players position
        player.onChange = (changes) => {
          changes.forEach(change => {
            if (change.field === 'pos_x') {
              this.playerList[key].setX(change.value);
            }
            if (change.field === 'pos_y') {
              this.playerList[key].setY(-1 * change.value);
            }
          });
        };
      };

      this.room.state.players.onRemove = (player, key) => {
        this.playerList[key].destructor();
        delete this.playerList[key];
      };
    });

    // add handlers for key presses
    this.input.keyboard.on('keydown', (event) => {
      this.room.send({ key: { pressed: true, keyCode: event.keyCode } });
    });

    this.input.keyboard.on('keyup', (event) => {
      this.room.send({ key: { pressed: false, keyCode: event.keyCode } });
    });
  }

  update () {

  }
}
