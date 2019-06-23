const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const type = schema.type;

class State extends Schema {

}

type("string")(State.prototype, "hey");