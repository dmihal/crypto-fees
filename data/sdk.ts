import { CryptoStatsSDK } from '@cryptostats/sdk';

const sdk = new CryptoStatsSDK({
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
  redisConnectionString: process.env.REDIS_URL,
  ipfsGateway: 'https://ipfs.cryptostats.community',
  executionTimeout: 1000,
  adapterListSubgraph: 'dmihal/cryptostats-adapter-registry-test',
});

if (process.env.NEXT_PUBLIC_OPTIMISM_RPC) {
  sdk.ethers.addProvider('optimism', process.env.NEXT_PUBLIC_OPTIMISM_RPC, { archive: true })
}

export default sdk;
