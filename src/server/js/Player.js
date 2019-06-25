const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const type = schema.type;
const Entity = require('./Entity').Entity;

class Player extends Entity {
	constructor(x = 0, y = 0){
		super(x, y);

		// these may be remapped later
		this.key_up = 87; 		// W
		this.key_left = 65; 	// A
		this.key_down = 83; 	// S 
		this.key_right = 68;	// D
		this.key_action = 32;	// SPACE
	}

	printKeys(){
		console.log("up: " + this.key_up);
		console.log("left: " + this.key_left);
		console.log("down: " + this.key_down);
		console.log("right: " + this.key_right);

	}
}

type("uint8")(Entity.prototype, "key_up");
type("uint8")(Entity.prototype, "key_left");
type("uint8")(Entity.prototype, "key_down");
type("uint8")(Entity.prototype, "key_right");
type("uint8")(Entity.prototype, "key_action");

// other possible properties: weight, sprite, collision flag, etc

exports.Player = Player;