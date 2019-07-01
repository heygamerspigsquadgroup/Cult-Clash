const Matter = require('matter-js');
const Entity = require('./Entity').Entity;
const schema = require('@colyseus/schema');
const type = schema.type;

class Player extends Entity {
  constructor (colorCode) {
    var playerBody = Matter.Bodies.rectangle(colorCode.mapX, colorCode.mapY, 100, 150, { inertia: Infinity, inverseInertia: 0, friction: 0 });
    // var floorSensor = Matter.Bodies.circle(colorCode.mapX, colorCode.mapY + 10, 2,{density:0, friction:0, isSensor: true});

    // super(Matter.Body.create({parts: [playerBody, floorSensor], friction:0}));
    super(playerBody);

    this.keyUp = 87; // W
    this.keyLeft = 65; // A
    this.keyDown = 83; // S
    this.keyRight = 68; // D
    this.keyAction = 32; // SPACE

    // if key is being held currently
    this.holdUp = false;
    this.holdLeft = false;
    this.holdDown = false;
    this.holdRight = false;
    this.holdAction = false;

    this.speed = 8;
    
    this.color = colorCode.color;
    this.colorCode = colorCode;

    this.isJumping = false;
  }
}
type('uint8')(Player.prototype, 'keyUp');
type('uint8')(Player.prototype, 'keyLeft');
type('uint8')(Player.prototype, 'keyDown');
type('uint8')(Player.prototype, 'keyRight');
type('uint8')(Player.prototype, 'keyAction');
type('string')(Player.prototype, 'color');

exports.Player = Player;
