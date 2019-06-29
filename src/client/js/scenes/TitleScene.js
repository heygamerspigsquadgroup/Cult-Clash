/* global Phaser ReactDOM */

import TitleSceneComponent from '../react/TitleSceneComponent.js';
import FadeableScene from './FadeableScene.js';
import { MATCH_SCENE_ID } from '../scenes/MatchScene.js';

const JOIN_TIMEOUT = 2000;

export const TITLE_SCENE_ID = 'titleScene';

export default class TitleScene extends FadeableScene {
  constructor () {
    super(TITLE_SCENE_ID, JOIN_TIMEOUT, MATCH_SCENE_ID);
  }

  preload () {
    this.load.audio('titleStart', './assets/sound/title_start.mp3');
    this.load.audio('titleLoop', './assets/sound/title_loop.mp3');
  }

  create () {
    this.musicStart = this.sound.add('titleStart', {loop: false});
    this.musicLoop = this.sound.add('titleLoop', {loop: true});
    this.musicStart.play();
    this.musicStart.once('complete', () => {
      this.musicLoop.play();
    });
    this.addFadeStarter(() => this.cameras.main.fadeOut(this.fadeTime));
    this.addFadeUpdater((fadePercent) => {
      this.musicStart.setVolume(fadePercent);
      this.musicLoop.setVolume(fadePercent);
    });
    this.addFadeEnder(() => {
      this.musicStart.stop();
      this.musicLoop.stop();
    });
  }

  update (time, delta) {
    const domContainer = document.querySelector('#ui_container');
    ReactDOM.render(<TitleSceneComponent />, domContainer);
    super.update(time, delta);
  }

  joinGame() {
    this.fade();
  }
}
