import * as redis from 'redis';
import bluebird from 'bluebird';

interface PromisifyRedis extends redis.RedisClient {
  hdelAsync(...args: any[]): Promise<any>;
  saddAsync(...args: any[]): Promise<any>;
  hsetAsync(...args: any[]): Promise<any>;
  hgetallAsync(...args: any[]): Promise<any>;
}

bluebird.promisifyAll(redis);

const redisClient = redis.createClient();
export * from 'redis';
export default redisClient as PromisifyRedis;
