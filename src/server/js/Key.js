const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const type = schema.type;

class Key extends Schema {
  constructor (keyCode) {
    super();
    this.keyCode = keyCode;
    this.isHeld = false;
  }
}
type('uint8')(Key.prototype, 'keyCode');
type('boolean')(Key.prototype, 'isHeld');

exports.Key = Key;
