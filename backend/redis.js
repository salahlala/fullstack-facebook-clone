import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL);

redis.on("error", (err) => {
  console.log("Redis Client Error", err);
});

redis.on("connect", () => {
  console.log("Redis Client Connected");
});

redis.on("ready", () => {
  console.log("Redis Client Ready");
});

export default redis;
