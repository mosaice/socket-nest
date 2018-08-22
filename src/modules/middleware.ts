import { Packet } from 'socket.io';
import schemas from './schemas';
import Joi from 'joi';
import { log, errorLog } from './log';

type Next = (err?: any) => void;
type Middleware = (packet: Packet, next: Next) => void;

export const logger: Middleware = (packet, next) => {
  const [type, data] = packet;
  log.info(
    `[recive] ${new Date().toLocaleString()}: event: ${type} data: ${JSON.stringify(
      data
    )}`
  );
  return next();
};

export const validate: Middleware = (packet, next) => {
  const [type, data] = packet;
  const validator = schemas[type];
  if (validator) {
    const { error, value } = Joi.validate(data, validator);
    if (error) {
      errorLog.warn(
        `[传输格式错误] ${new Date().toLocaleString()}:${
          error.message
        } event:${type} data: ${JSON.stringify(data)}`
      );
      return next(
        new Error(
          JSON.stringify({
            title: '格式错误',
            content: error.message
          })
        )
      );
    }
  }

  return next();
};
