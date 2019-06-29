/* global Phaser ReactDOM */

import TitleSceneComponent from '../react/TitleSceneComponent.js';

export const TITLE_SCENE_ID = 'titleScene';

export default class TitleScene extends Phaser.Scene {
  constructor () {
    super(TITLE_SCENE_ID);
  }

  preload () {
    this.load.image('cultist', './assets/cultist.png');
    const domContainer = document.querySelector('#ui_container');
    ReactDOM.render(<TitleSceneComponent />, domContainer);
  }

  create () {
  }

  update () {
  }
}
