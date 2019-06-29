/* global Phaser */
import TitleScene from './scenes/TitleScene.js';
import MatchScene from './scenes/MatchScene.js';

export default class Config {
  constructor (scene) {
    this.type = Phaser.WEBGL;
    this.parent = 'game_container';
    this.width = 800;
    this.height = 600;
    // this.physics = {
    //   default: 'arcade',
    //   arcade: {
    //     gravity: { y: 200 }
    //   }
    // };
    this.scene = [TitleScene, MatchScene];
  }
}
