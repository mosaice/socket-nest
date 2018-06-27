import { createServer } from 'http';
import socket from 'socket.io';

const server = createServer();

const io = socket(server, {
  // path: '/test',
  serveClient: false,
  origins: '*:*',
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: true
});

io.sockets.on('connection', socket => {
  socket.on('events', data => {
    console.log(data);
    socket.emit('events', 'ok');
  });
});

server.listen(3000, () => {
  console.log('listen ', 3000);
});
