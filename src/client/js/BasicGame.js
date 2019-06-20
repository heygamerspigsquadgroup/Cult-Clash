const Phaser = require('phaser');
const Config = require('./Config.js').Config;
const SplashScene = require('./scenes/SplashScene.js').SplashScene;

class BasicGame extends Phaser.Game {
  constructor () {
    super(new Config(SplashScene));
  }
}

exports.BasicGame = BasicGame;
