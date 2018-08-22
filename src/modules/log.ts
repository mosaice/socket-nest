import { configure, getLogger } from 'log4js';
import config from '../config';
import { Socket } from 'socket.io';
import redis from './redis';
configure(config.log);

export const log = getLogger();
export const errorLog = getLogger('error');

export const info = async (event: string, data: string, socket?: Socket) => {
  let msg = `[${
    socket ? 'Send' : 'Public Send'
  }] ${new Date().toLocaleString()}: event: ${event} data: ${data}`;
  if (socket) {
    const userString = await redis.hgetAsync('socketUser', socket.id);
    msg += ` who: ${userString}`;
  }

  log.info(msg);
};
