import Joi, { Schema } from 'joi';

const user = Joi.object().keys({
  name: Joi.string().required(),
  avatarColor: Joi.string().required(),
  avatarText: Joi.string().required(),
  hash: Joi.string().required()
});

const song = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().required(),
  artist: Joi.string().required(),
  album: Joi.string().required(),
  duration: Joi.number().required(),
  url: Joi.string().required()
});

const message = Joi.object().keys({
  message: Joi.string().required(),
  user
});

const syncMessage = Joi.number()
  .required()
  .min(0);

export default {
  userConnect: user,
  selectSong: song,
  sendMessage: message,
  syncMessage
} as { [P: string]: Schema };
