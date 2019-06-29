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
    this.load.image('cultist_purple', './assets/images/cultist_purple.gif');
    this.load.image('cultist_green', './assets/images/cultist_green.gif');
    this.load.image('cultist_orange', './assets/images/cultist_orange.gif');
    this.load.image('background', './assets/images/background.gif');
    this.load.image('platform_mid', './assets/images/platform_fill.gif');
    this.load.audio('matchStart', './assets/sound/match_start.mp3');
    this.load.audio('matchLoop', './assets/sound/match_loop.mp3');
    this.load.audio('doot', './assets/sound/doot.mp3');
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
    this.dootSfx = this.sound.add('doot', { loop: false });
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

    this.client = new Colyseus.Client(websocketUrl);
    this.room = this.client.join('my_room');

    this.room.onJoin.add(() => {
      // populate platforms on screen
      this.room.state.platforms.onAdd = (platform, key) => {
        this.add.sprite(platform.pos_x, platform.pos_y, 'platform_mid');
      };

      this.room.state.players.onAdd = (player, key) => {
        let playerObj = new Player(this.add.sprite(player.pos_x, player.pos_y, 'cultist_' + player.color));

        if (key === this.room.sessionId) {
          this.player = playerObj;
          this.cameras.main.startFollow(this.player.sprite);
        }

        this.playerList[key] = playerObj;
        // add listener for this players position
        player.onChange = changes => {
          this.playerList[key].change(changes);
        };
      };

      this.room.state.players.onRemove = (player, key) => {
        this.playerList[key].destructor();
        delete this.playerList[key];
      };

      this.room.onMessage.add((message) => {
        if (message === 'doot') {
          this.dootSfx.play();
        }
      });
    });

    // add handlers for key presses
    this.input.keyboard.on('keydown', event => {
      this.room.send({
        key: {
          pressed: true,
          keyCode: event.keyCode
        }
      });
    });

    this.input.keyboard.on('keyup', event => {
      this.room.send({
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
