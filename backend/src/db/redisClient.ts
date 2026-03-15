import {createClient} from 'redis'

const redisClient = createClient({
  url:process.env.REDIS_URL as string
})

redisClient.on('error',(err)=>{
  console.log(`Redis Client Error`,err);
})

redisClient.on('connect',()=>{
  console.log(`Redis Connected`);
})

const connectRedis = async()=>{
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect()
    }
  } catch (error) {
    console.log(`Redis Not Connected`,error);
  }
}


export {redisClient,connectRedis}