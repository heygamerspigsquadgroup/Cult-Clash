const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const type = schema.type;

class Entity extends Schema {
	constructor(x = 0, y = 0){
		super();
		this.pos_x = x;
		this.pos_y = y;
	}

	printEntity(){
		console.log('\tx: ' + this.pos_x + ' y: ' + this.pos_y);
	}
}
type("number")(Entity.prototype, "pos_x");
type("number")(Entity.prototype, "pos_y");
// other possible properties: weight, sprite, collision flag, etc

exports.Entity = Entity;