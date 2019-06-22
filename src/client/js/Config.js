const Phaser = require('phaser');

class Config {
  constructor (scene) {
    this.type = Phaser.AUTO;
    this.parent = 'game_container';
    this.width = 800;
    this.height = 600;
    this.physics = {
      default: 'arcade',
      arcade: {
        gravity: { y: 200 }
      }
    };
    this.scene = scene;
  }
}

exports.Config = Config;
