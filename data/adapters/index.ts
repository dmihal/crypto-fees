import registerAave from './aave';
import registerAvalanche from './avalanche';
import registerBalancer from './balancer';
import { getBancorData } from './bancor';
import registerCoinMetrics from './coinmetrics';
import registerCompound from './compound';
import registerCurve from './curve';
import registerQuickswap from './quickswap';
import { getFutureswapData } from './futureswap';
import registerHegic from './hegic';
import registerHoneyswap from './honeyswap';
import registerLinkswap from './linkswap';
import registerMaker from './maker';
import { getOmenData } from './omen';
import register0x from './zerox';
import registerRen from './ren';
import registerSushiswap from './sushi';
import registerSynthetix from './synthetix';
// import { getPolymarketData } from './polymarket';
import registerPolkadot from './polkadot';
import { getMstableData } from './mStable';
import registerTBTC from './tbtc';
import registerTerra from './terra';
import registerTornado from './tornado';
import registerUniswap from './uniswap';
import { getZilliqaData } from './zilliqa';

export const adapters = [
  getBancorData,
  getFutureswapData,
  getOmenData,
  // getPolymarketData,
  getMstableData,
  getZilliqaData,
];

interface Adapter {
  query: any;
  metadata: any;
}

const adapters2: { [id: string]: Adapter } = {};
const ids: string[] = [];

const register = (id: string, query: any, metadata: any) => {
  ids.push(id);
  adapters2[id] = { query, metadata };
};

register0x(register);
registerAave(register);
registerAvalanche(register);
registerBalancer(register);
registerCoinMetrics(register);
registerCompound(register);
registerCurve(register);
registerHegic(register);
registerHoneyswap(register);
registerLinkswap(register);
registerMaker(register);
registerQuickswap(register);
registerPolkadot(register);
registerRen(register);
registerSushiswap(register);
registerSynthetix(register);
registerTBTC(register);
registerTerra(register);
registerTornado(register);
registerUniswap(register);

export const getIDs = () => ids;

export function getMetadata(id: string) {
  if (!adapters2[id]) {
    throw new Error(`Unknown protocol ${id}`);
  }
  return adapters2[id].metadata;
}

export async function queryAdapter(protocol: string, attribute: string, date: string) {
  if (!adapters2[protocol]) {
    throw new Error(`Unknown protocol ${protocol}`);
  }

  const value = adapters2[protocol].query(attribute, date);
  return value;
}
