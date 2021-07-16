import { CryptoStatsSDK } from '@cryptostats/sdk';

const sdk = new CryptoStatsSDK({
  // mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
  // redisConnectionString: process.env.REDIS_URL,
});

export default sdk;
