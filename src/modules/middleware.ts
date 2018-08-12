import { Packet } from 'socket.io';
import schemas from './schemas';
import Joi from 'joi';

type Next = (err?: any) => void;
type Middleware = (packet: Packet, next: Next) => void;

export const auth: Middleware = (packet, next) => {
  // const [type, data] = packet;
  // const validator = schemas[type];
  // if (validator) {
  //   const { error, value } = Joi.validate(data, validator);
  // }
  // // next(new Error('Not a doge error'));
  return next();
};

export const validate: Middleware = (packet, next) => {
  const [type, data] = packet;
  const validator = schemas[type];
  if (validator) {
    const { error, value } = Joi.validate(data, validator);
    console.log(error);
    if (error) {
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
