import { CryptoStatsSDK } from '@cryptostats/sdk';

const sdk = new CryptoStatsSDK({
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
  redisConnectionString: process.env.REDIS_URL,
  executionTimeout: 1000,
});

if (process.env.NEXT_PUBLIC_OPTIMISM_RPC) {
  sdk.ethers.addProvider('optimism', process.env.NEXT_PUBLIC_OPTIMISM_RPC, { archive: true });
}
if (process.env.POKT_KEY) {
  sdk.ethers.addProvider(
    'ethereum',
    `https://eth-archival.gateway.pokt.network/v1/lb/${process.env.POKT_KEY}`,
    { archive: true }
  );
}

export default sdk;
