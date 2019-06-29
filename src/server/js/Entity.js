const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const type = schema.type;
const Matter = require('matter-js');

class Entity extends Schema {
  constructor (matterBody) {
    super();
    this.body = matterBody;
    this.pos_x = this.body.position.x;
    this.pos_y = this.body.position.y;
  }

  printEntity () {
    console.log('\tx: ' + this.pos_x + ' y: ' + this.pos_y);
  }
}
type('number')(Entity.prototype, 'pos_x');
type('number')(Entity.prototype, 'pos_y');
Entity.prototype.body; 


exports.Entity = Entity;
