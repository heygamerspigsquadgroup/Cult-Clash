/* global Bottle */

import Game from './Game.js';

const bottle = new Bottle();

export function loadInjection () {
  bottle.service('game', Game);
}

export default function inject (id) {
  return bottle.container[id];
}
