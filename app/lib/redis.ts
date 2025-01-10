import Redis, { RedisOptions } from "ioredis";

const options : RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number.parseInt('' + process.env.REDIS_PORT),
  db: 1
}

export const redisPub = new Redis(options);
export const redisSub = new Redis(options);