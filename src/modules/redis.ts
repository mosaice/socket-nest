import * as redis from 'redis';
import bluebird from 'bluebird';

interface PromisifyRedis extends redis.RedisClient {
  hdelAsync(...args: any[]): Promise<any>;
}

bluebird.promisifyAll(redis);

const redisClient = redis.createClient();

export default redisClient as PromisifyRedis;
