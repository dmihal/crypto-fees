import { CryptoStatsSDK, Adapter as SDKAdapter } from '@cryptostats/sdk';
import { Metadata } from '../types';

import registerAave from './aave';
import registerAvalanche from './avalanche';
import registerBalancer from './balancer';
import registerBancor from './bancor';
import registerBSC from './bsc';
import registerCoinMetrics from './coinmetrics';
import registerCompound from './compound';
// import registerCurve from './curve';
import registerDfyn from './dfyn';
import registerFTM from './fantom';
import registerQuickswap from './quickswap';
import registerHegic from './hegic';
import registerHoneyswap from './honeyswap';
import registerLiquity from './liquity';
import registerLinkswap from './linkswap';
import registerMaker from './maker';
import register0x from './zerox';
import registerMstable from './mStable';
import registerOptimism from './optimism';
import registerPolygon from './polygon';
import registerPolymarket from './polymarket';
import registerRen from './ren';
import registerSushiswap from './sushi';
import registerSwapr from './swapr';
import registerSynthetix from './synthetix';
import registerPolkadot from './polkadot';
import registerTBTC from './tbtc';
import registerTerra from './terra';
import registerTornado from './tornado';
import registerUniswap from './uniswap';
import registerXDai from './xdai';
import registerZilliqa from './zilliqa';

interface Adapter {
  query: any;
  metadata: any;
}

const adapters: { [id: string]: Adapter } = {};
const ids: string[] = [];
const bundles: { [id: string]: Metadata } = {};
const bundleIds: string[] = [];

const registerFn = (id: string, query: any, metadata: Metadata) => {
  if (adapters[id]) {
    throw new Error(`Adapter ${id} already registered`);
  }
  ids.push(id);
  adapters[id] = { query, metadata };
};

const register = Object.assign(registerFn, {
  bundle(id: string, metadata: Metadata) {
    bundles[id] = metadata;
    bundleIds.push(id);
  },
});

register0x(register);
registerAave(register);
registerAvalanche(register);
registerBalancer(register);
registerBancor(register);
registerBSC(register);
registerCoinMetrics(register);
registerCompound(register);
// registerCurve(register);
registerDfyn(register);
registerFTM(register);
registerHegic(register);
registerHoneyswap(register);
registerLiquity(register);
registerLinkswap(register);
registerMaker(register);
registerMstable(register);
registerOptimism(register);
registerQuickswap(register);
registerPolkadot(register);
registerPolygon(register);
registerPolymarket(register);
registerRen(register);
registerSushiswap(register);
registerSwapr(register);
registerSynthetix(register);
registerTBTC(register);
registerTerra(register);
registerTornado(register);
registerUniswap(register);
registerXDai(register);
registerZilliqa(register);

let loadListPromise: any = null;
export async function ensureListLoaded() {
  if (!loadListPromise) {
    loadListPromise = loadList();
  }
  await loadListPromise;
}

async function loadList() {
  const sdk = new CryptoStatsSDK({
    // mongoConnectionString: process.env.MONGO_CONNECTION_STRING,
    // redisConnectionString: process.env.REDIS_URL,
    ipfsGateway: 'https://ipfs.cryptostats.community',
  });

  const list = sdk.getList('fees');
  await list.fetchAdapters();

  await Promise.all(
    list.getAdapters().map(async (adapter: SDKAdapter) => {
      const id = adapter.id;
      if (adapters[id]) {
        throw new Error(`Adapter ${id} already registered`);
      }
      ids.push(id);

      const metadata = await adapter.getMetadata();

      const query = (attribute: string, date: string) => {
        if (attribute !== 'fee') {
          throw new Error(`${id} doesn't support ${attribute}`);
        }
        return adapter.query('oneDayTotalFees', date);
      };

      adapters[id] = {
        query,
        metadata,
      };

      // eslint-disable-next-line no-console
      console.log(`Downloaded & initialized ${id} adapter`);
    })
  );
}

export const getIDs = () => ids;
export const getBundleIDs = () => bundleIds;

export function getBundle(id: string) {
  if (!bundles[id]) {
    throw new Error(`Unknown bundle ${id}`);
  }
  return bundles[id];
}

export function getMetadata(id: string) {
  if (!adapters[id]) {
    throw new Error(`Unknown protocol ${id}`);
  }
  return adapters[id].metadata;
}

export async function queryAdapter(protocol: string, attribute: string, date: string) {
  await ensureListLoaded();

  if (!adapters[protocol]) {
    throw new Error(`Unknown protocol ${protocol}`);
  }

  const value = adapters[protocol].query(attribute, date);
  return value;
}
