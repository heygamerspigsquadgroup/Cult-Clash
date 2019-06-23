const Phaser = require('phaser');
const Config = require('./Config').Config;
const SplashScene = require('./scenes/SplashScene').SplashScene;

class Game extends Phaser.Game {
  constructor () {
    super(new Config(SplashScene));
  }
}

exports.Game = Game;
