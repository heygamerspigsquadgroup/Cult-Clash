const http = require('http');
const express = require('express');
const colyseus = require('colyseus');
const monitor = require('@colyseus/monitor').monitor;
// const socialRoutes = require('@colyseus/social/express').default;

const MyRoom = require('./MyRoom').MyRoom;

const port = process.env.PORT || 2567;
const app = express();

const server = http.createServer(app);
// const presence = process.env.isProd ? new colyseus.RedisPresence({
//  host: 'key-kalamity-pres.9dybtp.ng.0001.usw2.cache.amazonaws.com',
//  port: 6379,
//  db: process.env.TAG
// }) : new colyseus.LocalPresence();
const gameServer = new colyseus.Server({
  server: server
});

// register your room handlers
gameServer.register('my_room', MyRoom);

// register @colyseus/social routes
// app.use('/', socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor(gameServer));

// register healthcheck url
app.get('/healthcheck', (req, res) => res.send('Healthcheck Success'));

gameServer.onShutdown(function () {
  console.log(`game server is going down.`);
});

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
