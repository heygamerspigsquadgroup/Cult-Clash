/* global Phaser */

export default class FadeableScene extends Phaser.Scene {
  constructor (name, fadeTime, nextScene) {
    super(name);
    this.sceneName = name;
    this.nextScene = nextScene;
    this.fadeTime = fadeTime;
    this.reset();
  }

  reset () {
    this.fadeStart = 0;
    this.fadePercent = 1;
    this.fadeStarters = [];
    this.fadeUpdaters = [];
    this.fadeEnders = [];
  }

  addFadeStarter (fadeable) {
    this.fadeStarters.push(fadeable);
  }

  addFadeUpdater (fadeable) {
    this.fadeUpdaters.push(fadeable);
  }

  addFadeEnder (fadeable) {
    this.fadeEnders.push(fadeable);
  }

  fading () {
    return this.fadeStart;
  }

  fade () {
    if (!this.fading()) {
      this.fadeStart = this.time.now;
      this.fadeStarters.forEach((fadeable) => {
        fadeable();
      });
    }
  }

  update (time, delta) {
    if (this.fadeStart) {
      this.fadePercent = ((this.fadeStart + this.fadeTime) - time) / this.fadeTime;
      this.fadeUpdaters.forEach((fadeable) => {
        fadeable(this.fadePercent);
      });

      if (this.fadePercent <= 0) {
        this.fadeEnders.forEach((fadeable) => {
          fadeable();
        });
        this.reset();
        this.scene.stop(this.sceneName);
        this.scene.start(this.nextScene);
      }
    }
  }
}
