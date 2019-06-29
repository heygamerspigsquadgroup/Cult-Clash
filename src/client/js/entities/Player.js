export default class Player {
  constructor (sprite) {
    this.sprite = sprite;
    this.prevX = sprite.x;
  }

  destructor () {
    this.sprite.destroy();
  }

  setX (x) {
    this.sprite.x = x;
    if (this.prevX > x) {
      // turn left
      this.sprite.flipX = false;
    } else if (this.prevX < x) {
      // turn right
      this.sprite.flipX = true;
    }
    this.prevX = x;
  }

  setY (y) {
    this.sprite.y = y;
  }
}
