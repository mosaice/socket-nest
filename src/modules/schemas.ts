import Joi, { Schema } from 'joi';

const user = Joi.object().keys({
  name: Joi.string().required(),
  avatarColor: Joi.string().required(),
  avatarText: Joi.string().required()
});

const song = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().required(),
  artist: Joi.string().required(),
  album: Joi.string().required(),
  duration: Joi.number().required(),
  url: Joi.string().required()
});

export default {
  userConnect: user,
  selectSong: song
} as { [P: string]: Schema };
