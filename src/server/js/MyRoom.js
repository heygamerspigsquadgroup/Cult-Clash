const colyseus = require('colyseus');
const Matter = require('matter-js');
const parser = require('fast-xml-parser');
const State = require('./State').State;
const Player = require('./Player').Player;
const Entity = require('./Entity').Entity;
const ColorCode = require('./ColorCode').ColorCode;
const RuneBagConst = require('./RuneBag');
const fs = require('fs');
const path = require('path');

const MAP_FOLDER = './maps';

exports.MyRoom = class extends colyseus.Room {
  onInit (options) {
    this.maxClients = 4;
    this.fps = 30;

    console.log('\nCREATING NEW ROOM');
    this.printRoomId();
    this.setState(new State());

    let keys = this.getKeys();
    this.leftKeys = keys[0];
    this.rightKeys = keys[1];
    this.upKeys = keys[2];
    this.downKeys = keys[3];

    // load map
    const dirs = fs.readdirSync(MAP_FOLDER).map(file => {
      return path.join(MAP_FOLDER, file);
    });
    let mapFile = dirs[Math.floor(Math.random() * (dirs.length))];
    let mapContents = fs.readFileSync(mapFile, { encoding: 'UTF-8' });
    let mapData = parser.parse(mapContents, { ignoreAttributes: false, parseAttributeValue: true });
    let map = this.createMap(mapData);

    // add physics engine
    this.engine = Matter.Engine.create();
    this.engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: map.width, y: map.height } };
    this.unusedColors = [];
    map.totems.tiles.forEach((totem) => {
      if (map.blueStart === totem.tile) this.unusedColors.push(new ColorCode('blue', totem.x + map.tiles[totem.tile].width / 2, totem.y));
      if (map.purpleStart === totem.tile) this.unusedColors.push(new ColorCode('purple', totem.x + map.tiles[totem.tile].width / 2, totem.y));
      if (map.greenStart === totem.tile) this.unusedColors.push(new ColorCode('green', totem.x + map.tiles[totem.tile].width / 2, totem.y));
      if (map.orangeStart === totem.tile) this.unusedColors.push(new ColorCode('orange', totem.x + map.tiles[totem.tile].width / 2, totem.y));
    });

    map.walls.tiles.forEach((wall) => {
      this.addPlatform(wall.x + map.tiles[wall.tile].width / 2, wall.y + map.tiles[wall.tile].height / 2);
    });

    // so players dont collide w each other
    this.playerGroup = Matter.Body.nextGroup(true);

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      var pairs = event.pairs;

      // just detects if player body collided with SOMETHING. make sure its ground later
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];

        Object.keys(this.state.players).forEach(key => {
          var player = this.state.players[key];

          if (pair.bodyA.id === player.body.id || pair.bodyB.id === player.body.id) {
            player.isJumping = false;
          }
        });
      }
    });

    // setup update loop
    this.clock.setInterval(() => {
      Matter.Engine.update(this.engine, 1000 / this.fps);

      Object.keys(this.state.players).forEach(key => {
        // update pos_x, pos_y to new physics-calculated position
        this.state.players[key].pos_x = this.state.players[key].body.position.x;
        this.state.players[key].pos_y = this.state.players[key].body.position.y;
      });
    }, 1000 / this.fps);
  }

  onJoin (client, options) {
    console.log('\nCLIENT JOINED (' + this.clients.length + ' clients total)');
    this.printClientId(client);
    this.printSessionId(client);
    this.printRoomId();

    let colorIndex = Math.floor(Math.random() * this.unusedColors.length);
    let color = this.unusedColors.splice(colorIndex, 1)[0];
    this.state.players[client.sessionId] = new Player(color);
    var playerBody = this.state.players[client.sessionId].body;
    playerBody.collisionFilter.group = this.playerGroup;
    // add player's body to world
    Matter.World.add(this.engine.world, playerBody);
  }

  onMessage (client, message) {
    if (message.key) {
      // a client pressed or released a key
      this.handleKeyEvent(client.sessionId, message.key);
    }
    // handle other message types...
  }

  onLeave (client, consented) {
    console.log('\nCLIENT LEFT ROOM (' + this.clients.length + ' clients remain)');
    this.printClientId(client);
    this.printSessionId(client);
    this.printRoomId();
    this.unusedColors.push(this.state.players[client.sessionId].colorCode);

    // remove player's body from world
    Matter.World.remove(this.engine.world, this.state.players[client.sessionId].body);
    delete this.state.players[client.sessionId];
  }

  onDispose () {
    console.log('\nDISPOSING ROOM (all clients disconnected)');
    this.printRoomId();
  }

  handleKeyEvent (sessionId, keyMsg) {
    // keyMsg should be {pressed: true/false, keyCode: ##}
    if (this.state.players[sessionId]) {
      var player = this.state.players[sessionId];

      // update held state
      if (keyMsg.keyCode === player.keyUp) {
        player.holdUp = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyLeft) {
        player.holdLeft = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyDown) {
        player.holdDown = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyRight) {
        player.holdDown = keyMsg.pressed;
      } else if (keyMsg.keyCode === player.keyAction) {
        if (keyMsg.pressed && !player.holdAction) {
          this.broadcast('doot');
        }
        player.holdAction = keyMsg.pressed;
      }

      if (player.holdUp) {
        if (!player.isJumping) {
          Matter.Body.setVelocity(player.body, { x: player.body.velocity.x, y: -18 });
          player.isJumping = true;
        } else {

          // Matter.Body.setVelocity(player.body, {x: player.body.velocity.x, y: 0});
          // cant control jump height, but doesnt have weird stopping thing
        }
      }

      if (keyMsg.keyCode === player.keyLeft) {
        if (keyMsg.pressed) {
          player.facingLeft = true;
          Matter.Body.setVelocity(player.body, { x: -1 * player.speed, y: player.body.velocity.y });
        } else {
          if (!player.holdRight) {
            Matter.Body.setVelocity(player.body, { x: 0, y: player.body.velocity.y });
          } else {
            Matter.Body.setVelocity(player.body, { x: player.speed, y: player.body.velocity.y });
          }
        }
      } else if (keyMsg.keyCode === player.keyRight) {
        if (keyMsg.pressed) {
          player.facingLeft = false;
          Matter.Body.setVelocity(player.body, { x: player.speed, y: player.body.velocity.y });
        } else {
          if (!player.holdLeft) {
            Matter.Body.setVelocity(player.body, { x: 0, y: player.body.velocity.y });
          } else {
            Matter.Body.setVelocity(player.body, { x: -1 * player.speed, y: player.body.velocity.y });
          }
        }
      }
    }
  }

  // add a platform object to list
  addPlatform (x, y) {
    // fix platform gif size
    var platform = new Entity(Matter.Bodies.rectangle(x, y, 50, 50, { isStatic: true }));
    Matter.World.add(this.engine.world, platform.body);
    this.state.platforms.push(platform);
  }

  printRoomId () {
    console.log('\t(Room ID: ' + this.roomId + ')');
  }
  printSessionId (client) {
    console.log('\t(Session ID: ' + client.sessionId + ')');
  }
  printClientId (client) {
    console.log('\t(Client ID: ' + client.id + ')');
  }

  getKeys () {
    const SHUFFLE_COUNT = 8;
    let keys = [RuneBagConst.MOVEMENT_SET_1, RuneBagConst.MOVEMENT_SET_2, RuneBagConst.MOVEMENT_SET_3, RuneBagConst.MOVEMENT_SET_4];
    for (let i = 0; i < SHUFFLE_COUNT; i++) {
      let first = Math.floor(Math.random() * keys.length);
      let second = Math.floor(Math.random() * keys.length);
      [keys[first], keys[second]] = [keys[second], keys[first]];
    }
    return keys;
  }

  createMap (mapData) {
    let map = {};
    let tileRowSize = mapData.map['@_width'];
    let tileWidth = mapData.map['@_tilewidth'];
    let tileColumnSize = mapData.map['@_height'];
    let tileHeight = mapData.map['@_tileheight'];
    map.width = tileRowSize * tileWidth;
    map.height = tileColumnSize * tileHeight;
    map.tiles = [];
    mapData.map.tileset.forEach((tile) => {
      if (Array.isArray(tile.tile)) {
        tile.tile.forEach((subTile) => {
          map.tiles.push({
            image: /[^/]*$/.exec(subTile.image['@_source'])[0],
            width: subTile.image['@_width'],
            height: subTile.image['@_height']
          });
          if (map.tiles[map.tiles.length - 1].image.includes('blue')) map.blueStart = map.tiles.length - 1;
          if (map.tiles[map.tiles.length - 1].image.includes('green')) map.greenStart = map.tiles.length - 1;
          if (map.tiles[map.tiles.length - 1].image.includes('orange')) map.orangeStart = map.tiles.length - 1;
          if (map.tiles[map.tiles.length - 1].image.includes('purple')) map.purpleStart = map.tiles.length - 1;
        });
      } else {
        map.tiles.push({
          image: /[^/]*$/.exec(tile.tile.image['@_source'])[0],
          width: tile.tile.image['@_width'],
          height: tile.tile.image['@_height']
        });
      }
    });
    map.background = {
      tiles: []
    };
    map.walls = {
      tiles: []
    };
    map.totems = {
      tiles: []
    };
    mapData.map.layer.forEach((layerData) => {
      let layer = map[layerData['@_name']];
      layer.opacity = layerData['@_opacity'] || 1;
      let tiles = layerData.data['#text'].split('\r\n');
      for (let i = 0; i < tiles.length; i++) {
        tiles[i] = tiles[i].split(',').map((tile) => {
          return parseInt(tile, 10);
        });
        for (let j = 0; j < tiles[i].length; j++) {
          let x = j * tileWidth;
          let y = i * tileHeight;
          if (tiles[i][j]) {
            layer.tiles.push({
              tile: tiles[i][j] - 1,
              x: x,
              y: y
            });
          }
        }
      }
    });

    return map;
  }
};
