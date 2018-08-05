export const log = {
  appenders: {
    console: {
      type: 'console'
    },
    activeLog: {
      filename: 'log/status',
      type: 'dateFile',
      pattern: '.dd.log',
      flags: 'w',
      daysToKeep: 1,
      alwaysIncludePattern: true
    },
    errorLog: {
      type: 'file',
      filename: 'log/errors.log'
    }
  },
  categories: {
    default: {
      appenders: ['activeLog', 'console'],
      level: 'debug'
    },
    error: {
      appenders: ['errorLog'],
      level: 'warn'
    }
  }
};
