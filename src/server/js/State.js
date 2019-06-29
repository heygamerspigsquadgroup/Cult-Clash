const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
const ArraySchema = schema.ArraySchema;
const type = schema.type;
const Player = require('./Player').Player;
const Entity = require('./Entity').Entity;

class State extends Schema {
  constructor () {
    super();
    // map of players, clientId : Player Object
    this.players = new MapSchema();
    this.platforms = new ArraySchema();
  }

  printPlayers () {
    var keys = Object.keys(this.players);
    keys.forEach(key => {
      console.log(key + ':');
      this.players[key].printEntity();
      this.players[key].printKeys();
    });
  }
}
// player list

type([ Entity ])(State.prototype, 'platforms');
type({ map: Player })(State.prototype, 'players');

// map dimensions
type('uint16')(State.prototype, 'width');
type('uint16')(State.prototype, 'height');


exports.State = State;
