const ContainerBuilder = require('node-dependency-injection').ContainerBuilder;
const Game = require('./Game').Game;

window.inject = new ContainerBuilder();

inject
  .register('game', Game);
