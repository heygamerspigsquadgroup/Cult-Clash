export default class Player {
  constructor (sprite) {
    this.sprite = sprite;
    this.keyUp = 87;
    this.keyLeft = 65;
    this.keyDown = 83;
    this.keyRight = 68;
    this.keyAction = 32;
  }

  destructor () {
    this.sprite.destroy();
  }

  change (changes) {
    changes.forEach(change => {
      if (change.field === 'pos_x') {
        this.setX(change.value, change.previousValue);
      } else if (change.field === 'pos_y') {
        this.setY(change.value, change.previousValue);
      } else if (change.field === 'keyUp') {
        this.keyUp = change.value;
      } else if (change.field === 'keyLeft') {
        this.keyLeft = change.value;
      } else if (change.field === 'keyDown') {
        this.keyDown = change.value;
      } else if (change.field === 'keyRight') {
        this.keyRight = change.value;
      } else if (change.field === 'keyAction') {
        this.keyAction = change.value;
      }
    });
  }

  setKeyConfig (player) {
    this.keyUp = player.keyUp;
    this.keyLeft = player.keyLeft;
    this.keyDown = player.keyDown;
    this.keyRight = player.keyRight;
    this.keyAction = player.keyAction;
    console.log(this.keyUp);
  }

  setX (x, prevX) {
    this.sprite.x = x;
  }

  setY (y, prevY) {
    this.sprite.y = y;
  }
}
