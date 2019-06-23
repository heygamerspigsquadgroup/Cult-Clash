/* global Phaser */

import Config from './Config.js';
import SplashScene from './scenes/SplashScene.js';

export default class Game extends Phaser.Game {
  constructor () {
    super(new Config(SplashScene));
  }
}
