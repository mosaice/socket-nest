import * as prod from './producation';
import * as dev from './development';
import * as secret from './secret';

const config = process.env.NODE_ENV === 'producation' ? prod : dev;

export default {
  mail: secret.mail,
  mailNotify: secret.mailNotify,
  ...config
};
