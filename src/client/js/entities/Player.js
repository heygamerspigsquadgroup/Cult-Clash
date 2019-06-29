export default class Player {
  constructor (sprite) {
    this.sprite = sprite;
  }

  destructor () {
    this.sprite.destroy();
  }

  setX (x, prevX) {
      this.sprite.x = x;
      this.sprite.flipX = (x === prevX ? this.sprite.flipX : Math.floor(x) > Math.floor(prevX));
  }

  setY (y) {
    this.sprite.y = y;
  }
}
