/* global Phaser ReactDOM */

import TitleSceneComponent from '../react/TitleSceneComponent.js';
import { MATCH_SCENE_ID } from '../scenes/MatchScene.js';

const JOIN_TIMEOUT = 2000;

export const TITLE_SCENE_ID = 'titleScene';

export default class TitleScene extends Phaser.Scene {
  constructor () {
    super(TITLE_SCENE_ID);
    this.joiningGame = 0;
    this.fadePercent = 1;
  }

  preload () {
    this.load.audio('titleStart', './assets/sound/title_start.mp3');
    this.load.audio('titleLoop', './assets/sound/title_loop.mp3');
    const domContainer = document.querySelector('#ui_container');
    ReactDOM.render(<TitleSceneComponent />, domContainer);
  }

  create () {
    this.musicStart = this.sound.add('titleStart', {loop: false});
    this.musicLoop = this.sound.add('titleLoop', {loop: true});
    this.musicStart.play();
    this.musicStart.once('complete', () => {
      this.musicLoop.play();
    });
  }

  update (time, delta) {
    if(this.joiningGame) {
      this.fadePercent = ((this.joiningGame + JOIN_TIMEOUT) - time) / JOIN_TIMEOUT;
      this.musicStart.setVolume(this.fadePercent);
      this.musicLoop.setVolume(this.fadePercent);
      if(this.fadePercent <= 0) {
        this.musicStart.stop();
        this.musicLoop.stop();
        this.joiningGame = 0;
        this.fadePercent = 1;
        this.scene.stop(TITLE_SCENE_ID);
        this.scene.start(MATCH_SCENE_ID);
      }
    }
  }

  joinGame() {
    if(!this.joiningGame) {
      this.joiningGame = this.time.now;
      this.cameras.main.fadeOut(JOIN_TIMEOUT);
    }
  }
}
