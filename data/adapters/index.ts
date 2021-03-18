import { getLinkswapData } from './feeData';
import registerBalancer from './balancer';
import { getBancorData } from './bancor';
import registerCoinMetrics from './coinmetrics';
import registerCompound from './compound';
import registerCurve from './curve';
import registerHegic from './hegic';
import { getOmenData } from './omen';
import register0x from './zerox';
import registerRen from './ren';
import registerSushiswap from './sushi';
import registerSynthetix from './synthetix';
// import { getPolymarketData } from './polymarket';
import registerPolkadot from './polkadot';
import { getMstableData } from './mStable';
import registerTBTC from './tbtc';
import registerTornado from './tornado';
import registerUniswap from './uniswap';
import { getAaveData } from './aave';

export const adapters = [
  getLinkswapData,
  getBancorData,
  getOmenData,
  // getPolymarketData,
  getMstableData,
  getAaveData,
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
registerBalancer(register);
registerCoinMetrics(register);
registerCompound(register);
registerCurve(register);
registerHegic(register);
registerPolkadot(register);
registerRen(register);
registerSushiswap(register);
registerSynthetix(register);
registerTBTC(register);
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
