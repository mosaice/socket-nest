import { Socket } from 'socket.io';
import redis from './redis';
import https from 'https';
import { Song, Message } from '../types';
import { db } from './nedb';
import { errorLog, info } from './log';
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
  socket.on('userConnect', async (data, fn) => {
    redis.sadd('connectedUsers', JSON.stringify(data));
    redis.hset('socketUser', socket.id, JSON.stringify(data));
    fn();
    socket.to('public').emit('userJoin', data.name);
    info('userJoin', data.name);
    syncUser(socket);
    syncMessage(socket);
    syncSongs(socket, false);
    if (currentSong) {
      socket.emit('playSong', currentSong);
    }
  });
};

export const userLeave = (socket: Socket) => {
  socket.on('userLeave', async () => {
    leave(socket, 'userLeave');
  });
};

export const disconnect = (socket: Socket) => {
  socket.on('disconnect', async () => {
    leave(socket, 'disconnect');
  });
};

export const selectSong = (socket: Socket) => {
  socket.on('selectSong', async (data: Song) => {
    https.get(data.url, resp => {
      if (resp.headers.location === 'http://music.163.com/404') {
        socket.emit('songError', data.name);
        info('songError', data.name, socket);
      } else {
        if (resp.headers.location) {
          data.url = resp.headers.location.replace('http://', 'https://');
        }
        redis.rpush('activeSongs', JSON.stringify(data));
      }

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

    db.insert(message, (err?: Error) => {
      if (err) {
        errorLog.error(
          `[存储信息失败] ${new Date().toLocaleString()}:${err.message}`
        );
      }
    });
    socket.emit('sendMessage', msg);
    socket.to('public').emit('sendMessage', msg);
    info('sendMessage', JSON.stringify(msg));
  });
};

export const syncMessageEvent = (socket: Socket) => {
  socket.on('syncMessage', async (pos: number) => {
    const len = await redis.llenAsync('chatMessage');
    if (pos >= len) {
      return;
    }
    const end = pos + 10 < len ? pos + 10 : len;
    let msgs = await redis.lrangeAsync('chatMessage', pos, end);
    msgs = msgs.reverse();
    socket.emit('syncMessage', msgs);
    info('syncMessage', `len: ${len} pos: ${pos}`, socket);
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
  info('playSong', JSON.stringify(song));
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
  // info('syncSongs', JSON.stringify(songs), all ? undefined : socket);
};

const syncMessage = async (socket: Socket) => {
  let len = await redis.llenAsync('chatMessage');
  len = len > 10 ? 10 : len;
  let msgs = await redis.lrangeAsync('chatMessage', 0, len);
  msgs = msgs.reverse();
  socket.emit('syncMessage', msgs);
  // info('syncMessage', JSON.stringify(msgs), socket);
};

const syncUser = async (socket: Socket) => {
  const userString: string[] = await redis.smembersAsync('connectedUsers');
  const users = userString.map(s => JSON.parse(s));
  socket.emit('getAllUsers', users);
  socket.to('public').emit('getAllUsers', users);
  info('getAllUsers', JSON.stringify(users));
};

const leave = async (socket: Socket, type: 'disconnect' | 'userLeave') => {
  const userString = await redis.hgetAsync('socketUser', socket.id);
  redis.hdel('socketUser', socket.id);
  if (userString) {
    await redis.sremAsync('connectedUsers', userString);
    const user = JSON.parse(userString);
    socket.to('public').emit('userLeave', user.name);
    info(type, user.name);
  }
  syncUser(socket);
};

export const error = (socket: Socket) => {
  socket.on('error', async err => {
    const userString = await redis.hgetAsync('socketUser', socket.id);
    errorLog.error(
      `[recive Error] ${new Date().toLocaleString()}:${
        err.message
      } who: ${userString}`
    );
  });
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
