const Matter = require('matter-js');
const Entity = require('./Entity').Entity;
const Key = require('./Key').Key;

class Player extends Entity {
  constructor (x, y) {
    var playerBody = Matter.Bodies.rectangle(x, y, 100, 150, {inertia: Infinity, inverseInertia: 0, friction: 0});
    var floorSensor = Matter.Bodies.circle(x, y + 10, 2,{density:0, friction:0, isSensor: true});

    super(Matter.Body.create({parts: [playerBody, floorSensor], friction:0}));
    this.speed = 5;
    // these may be remapped later
    this.keyUp = new Key(87); // W
    this.keyLeft = new Key(65); // A
    this.keyDown = new Key(83); // S
    this.keyRight = new Key(68); // D
    this.keyAction = new Key(32); // SPACE

    this.isJumping = false;
  }
}

// other possible properties: weight, sprite, collision flag, etc
exports.Player = Player;