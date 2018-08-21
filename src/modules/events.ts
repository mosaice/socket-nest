import { Socket } from 'socket.io';
import redis, { print } from './redis';
import https from 'https';
import { Song, Message } from '../types';

let currentSong: Song | undefined;
let timer: NodeJS.Timer;

export const initPlay = (socket: Socket) => {
  // redis.get('playSong', (err, data) => {
  //   if (!err && data) {
  //     currentSong = JSON.parse(data);
  //     const nextTime =
  //       currentSong!.duration + currentSong!.playTime! - Date.now();
  //     timer = setTimeout(() => autoPlay(socket), nextTime + 3000);
  //   } else {
  //     autoPlay(socket);
  //   }
  // });

  autoPlay(socket);
};

export const userConnect = (socket: Socket) => {
  socket.on('userConnect', async data => {
    redis.sadd('connectedUsers', JSON.stringify(data));
    redis.hset('socketUser', socket.id, JSON.stringify(data));
    socket.emit('userConnect', data);
    socket.to('public').emit('userJoin', data.name);
    syncUser(socket);
    syncMessage(socket);
    syncSongs(socket, false);
    if (currentSong) {
      socket.emit('playSong', currentSong);
    }
  });
};

export const disconnect = (socket: Socket) => {
  socket.on('disconnect', async () => {
    const userString = await redis.hgetAsync('socketUser', socket.id);
    redis.hdel('socketUser', socket.id);
    if (userString) {
      await redis.sremAsync('connectedUsers', userString);
      socket.to('public').emit('userLevel', JSON.parse(userString).name);
    }
    syncUser(socket);
  });
};

export const selectSong = (socket: Socket) => {
  socket.on('selectSong', async (data: Song) => {
    https.get(data.url, resp => {
      if (resp.headers.location) {
        data.url = resp.headers.location.replace('http://', 'https://');
      }
      redis.rpush('activeSongs', JSON.stringify(data));
      if (!currentSong) {
        autoPlay(socket);
      } else {
        syncSongs(socket);
      }
    });
  });
};

export const nextSong = (socket: Socket) => {
  socket.on('nextSong', async () => {
    if (currentSong && timer) {
      clearTimeout(timer);
      autoPlay(socket);
    }
  });
};

export const sendMessage = (socket: Socket) => {
  socket.on('sendMessage', async (message: Message) => {
    const msg = { ...message, time: new Date().toLocaleString() };
    redis.lpush('chatMessage', JSON.stringify(msg));
    socket.emit('sendMessage', msg);
    socket.to('public').emit('sendMessage', msg);
  });
};

export const syncMessageEvent = (socket: Socket) => {
  socket.on('syncMessage', async (pos: number) => {
    let len = await redis.llenAsync('chatMessage');
    if (pos >= len) {
      return;
    }
    const end = pos + 20 < len ? pos + 20 : len;
    const msgs = await redis.lrangeAsync('chatMessage', pos, end);
    socket.emit('syncMessage', msgs.reverse());
  });
};

const autoPlay = async (socket: Socket) => {
  const songString = await redis.lpopAsync('activeSongs');

  const song: Song | undefined = songString
    ? JSON.parse(songString)
    : undefined;
  if (song) {
    song.playTime = Date.now();
    currentSong = song;
  }
  socket.emit('playSong', song);
  socket.to('public').emit('playSong', song);
  syncSongs(socket);
  if (!song) {
    currentSong = undefined;
  } else {
    timer = setTimeout(() => autoPlay(socket), song.duration + 3000);
  }
};

const syncSongs = async (socket: Socket, all: boolean = true) => {
  const len = await redis.llenAsync('activeSongs');
  const songs = await redis.lrangeAsync('activeSongs', 0, len);
  socket.emit('syncSongs', songs);
  if (all) {
    socket.to('public').emit('syncSongs', songs);
  }
};

const syncMessage = async (socket: Socket) => {
  let len = await redis.llenAsync('chatMessage');
  len = len > 20 ? 20 : len;
  const msgs = await redis.lrangeAsync('chatMessage', 0, len);
  socket.emit('syncMessage', msgs.reverse());
};

const syncUser = async (socket: Socket) => {
  const userString: string[] = await redis.smembersAsync('connectedUsers');
  const users = userString.map(s => JSON.parse(s));
  socket.emit('getAllUsers', users);
  socket.to('public').emit('getAllUsers', users);
};

export const error = (socket: Socket) => {
  socket.on('error', data => {});
};

process.on('exit', code => {
  console.log(`即将退出，退出码：${code}`);
  // if (currentSong) {
  //   const ex = currentSong.duration + currentSong.playTime! - Date.now();
  //   if (ex > 0) {
  //     redis.set('playSong', JSON.stringify(currentSong), 'EX', ex / 1000);
  //   }
  // }
});

// const returnUsers = (socket:Socket)
