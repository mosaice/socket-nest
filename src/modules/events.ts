import { Socket } from 'socket.io';
import redis, { print } from './redis';
import { values, uniq } from 'lodash';
import { Song } from '../types';
export const userConnect = (socket: Socket) => {
  socket.on('userConnect', async data => {
    redis.hset('connectedUsers', socket.id, JSON.stringify(data), print);
    socket.emit('userConnect', data);

    redis.hvals('connectedUsers', async (err, userString) => {
      if (err) {
        console.error(err);
      }
      const users = uniq(userString).map(s => JSON.parse(s));
      socket.emit('getAllUsers', users);
      socket.to('public').emit('getAllUsers', users);
      socket.to('public').emit('userJoin', data.name);
      const len = await redis.llenAsync('activeSongs');
      const songs = await redis.lrangeAsync('activeSongs', 0, len);
      socket.emit('syncSongs', songs);
    });
  });
};

export const disconnect = (socket: Socket) => {
  socket.on('disconnect', async data => {
    // console.log('disconnect', socket.id);
    redis.hdel('connectedUsers', socket.id, print);
  });
};

export const selectSong = (socket: Socket) => {
  socket.on('selectSong', async (data: Song) => {
    // TODO: 点歌逻辑
    redis.rpush('activeSongs', JSON.stringify(data));
    const len = await redis.llenAsync('activeSongs');
    const songs = await redis.lrangeAsync('activeSongs', 0, len);
    socket.emit('syncSongs', songs);
    socket.to('public').emit('syncSongs', songs);
  });
};

// export const getAllUsers = (socket: Socket) => {
//   socket.on('getAllUsers', () => {
//     redis.hgetall('connectedUsers', (err, data) => {
//       if (err) {
//         console.error(err);
//       }
//       const users = uniq(values(data)).map(s => JSON.parse(s));
//       socket.emit('getAllUsers', users);
//     });
//   });
// };

export const error = (socket: Socket) => {
  socket.on('error', data => {
    console.log(data);
  });
};

// const returnUsers = (socket:Socket)
