import * as secret from './secret';

export const log = {
  appenders: {
    activeLog: {
      filename: './log/status',
      type: 'dateFile',
      pattern: '.dd.log',
      daysToKeep: 28,
      alwaysIncludePattern: true
    },
    errorLog: {
      type: 'file',
      filename: 'log/errors.log'
    },
    email: {
      type: '@log4js-node/smtp',
      plugin: 'smtp',
      SMTP: secret.mail
    }
  },
  categories: {
    default: {
      appenders: ['activeLog'],
      level: 'debug'
    },
    error: {
      appenders: ['errorLog', 'email'],
      level: 'warn'
    }
  }
};
