/* global Colyseus ReactDOM */

import Player from '../entities/Player.js';
import MatchSceneComponent from '../react/MatchSceneComponent.js';
import FadeableScene from './FadeableScene.js';
import { TITLE_SCENE_ID } from '../scenes/TitleScene.js';

export const MATCH_SCENE_ID = 'matchScene';
export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 2400;

export default class MatchScene extends FadeableScene {
  constructor () {
    super(MATCH_SCENE_ID, 5000, TITLE_SCENE_ID);
  }

  preload () {
    this.load.image('cultist_blue', './assets/images/cultist_blue.gif');
    this.load.image('background', './assets/images/background.gif');
    this.load.image('platform_mid', './assets/images/platform_fill.gif');
    this.load.audio('matchStart', './assets/sound/match_start.mp3');
    this.load.audio('matchLoop', './assets/sound/match_loop.mp3');
    const domContainer = document.querySelector('#ui_container');
    ReactDOM.render(<MatchSceneComponent />, domContainer);
    this.playerList = new Map();
  }

  create () {
    this.background = this.add.tileSprite(0, 0, 3200, 2400, 'background');
    this.background.setOrigin(0, 0);
    this.background.setAlpha(0.7);

    this.cameras.main.fadeIn(2000);
    const MINIMAP_OFFSET = 10;
    this.minimap = this.cameras.add(MINIMAP_OFFSET, MINIMAP_OFFSET,
      MINIMAP_OFFSET + this.game.config.width / 4, MINIMAP_OFFSET + this.game.config.height / 4)
      .setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT).setName('minimap')
      .setZoom(this.game.config.width / MAP_WIDTH / 4).centerOn(MAP_WIDTH / 2, MAP_HEIGHT / 2);
    this.musicStart = this.sound.add('matchStart', { loop: false });
    this.musicLoop = this.sound.add('matchLoop', { loop: true });
    this.musicStart.play();
    this.musicStart.once('complete', () => {
      this.musicLoop.play();
    });
    this.addFadeStarter(() => this.cameras.main.fadeOut(this.fadeTime));
    this.addFadeStarter(() => this.minimap.fadeOut(this.fadeTime));
    this.addFadeUpdater((fadePercent) => {
      this.musicStart.setVolume(fadePercent);
      this.musicLoop.setVolume(fadePercent);
    });
    this.addFadeEnder(() => {
      this.musicStart.stop();
      this.musicLoop.stop();
    });

    const websocketUrl = window.location.hostname === 'localhost'
      ? 'ws://localhost:2567'
      : 'wss://api' + window.location.hostname.substring(3) + ':443';

    var client = new Colyseus.Client(websocketUrl);
    var room = client.join('my_room');

    room.onJoin.add(() => {
      // populate platforms on screen
      room.state.platforms.onAdd = (platform, key) => {
        this.add.sprite(platform.pos_x, platform.pos_y, 'platform_mid');
      };

      room.state.players.onAdd = (player, key) => {
        this.playerList[key] = new Player(this.add.sprite(player.pos_x, player.pos_y, 'cultist_blue'));

        // add listener for this players position
         player.onChange = changes => {
          this.playerList[key].change(changes);
        };
      };

      room.state.players.onRemove = (player, key) => {
        this.playerList[key].destructor();
        delete this.playerList[key];
      };
    });

    // add handlers for key presses
    this.input.keyboard.on('keydown', event => {
      room.send({
        key: {
          pressed: true,
          keyCode: event.keyCode
        }
      });
    });

    this.input.keyboard.on('keyup', event => {
      room.send({
        key: {
          pressed: false,
          keyCode: event.keyCode
        }
      });
    });
  }

  update (time, delta) {
    super.update(time, delta);
  }
}
