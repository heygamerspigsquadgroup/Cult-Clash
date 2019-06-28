/* global Phaser */

import Config from './Config.js';

export default class Game extends Phaser.Game {
  constructor () {
    super(new Config());
  }
}
