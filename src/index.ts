import './modules/log';
import { createServer } from 'http';
import socket from 'socket.io';
import { values } from 'lodash';
import * as events from './modules/events';
import * as middlewares from './modules/middleware';
const { initPlay, ...other } = events;
const server = createServer();

const io = socket(server, {
  serveClient: false,
  origins: '*:*',
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: true
});

io.sockets.on('connection', socket => {
  // console.log(io.sockets);
  socket.join('public');
  initPlay(socket);
  values(middlewares).forEach(middware => socket.use(middware));
  values(other).forEach(func => func(socket));
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listen ON', process.env.PORT || 3000);
  console.log('NODE_ENV = ', process.env.NODE_ENV);
});
