const Matter = require('matter-js');
const Entity = require('./Entity').Entity;
const Key = require('./Key').Key;
const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const type = schema.type;

class Player extends Entity {
  constructor (colorCode) {
    var playerBody = Matter.Bodies.rectangle(colorCode.mapX, colorCode.mapY, 100, 150, { inertia: Infinity, inverseInertia: 0, friction: 0 });
    // var floorSensor = Matter.Bodies.circle(colorCode.mapX, colorCode.mapY + 10, 2,{density:0, friction:0, isSensor: true});

    // super(Matter.Body.create({parts: [playerBody, floorSensor], friction:0}));
    super(playerBody);
    this.speed = 8;
    // these may be remapped later
    this.color = colorCode.color;
    this.colorCode = colorCode;
    this.keyUp = new Key(87); // W
    this.keyLeft = new Key(65); // A
    this.keyDown = new Key(83); // S
    this.keyRight = new Key(68); // D
    this.keyAction = new Key(32); // SPACE

    this.isJumping = false;
  }
}
type('string')(Player.prototype, 'color');

// other possible properties: weight, sprite, collision flag, etc
exports.Player = Player;
