import * as redis from 'redis';
import bluebird from 'bluebird';

interface PromisifyRedis extends redis.RedisClient {
  hdelAsync(...args: any[]): Promise<any>;
  saddAsync(...args: any[]): Promise<any>;
  hsetAsync(...args: any[]): Promise<any>;
  llenAsync(...args: any[]): Promise<any>;
  lrangeAsync(...args: any[]): Promise<any>;
  lpopAsync(...args: any[]): Promise<any>;
  smembersAsync(...args: any[]): Promise<any>;
  hgetAsync(...args: any[]): Promise<any>;
  sremAsync(...args: any[]): Promise<any>;
}

bluebird.promisifyAll(redis);

const redisClient = redis.createClient();
export * from 'redis';
export default redisClient as PromisifyRedis;
