import { configure, getLogger, Logger } from 'log4js';
import config from '../config';

configure(config.log);

const log = getLogger();
const errorLog = getLogger('error');

declare global {
  namespace NodeJS {
    interface Global {
      log: Logger;
      errorLog: Logger;
    }
  }
}

global.log = log;
global.errorLog = errorLog;
