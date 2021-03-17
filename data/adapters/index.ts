import { getLinkswapData } from './feeData';
import { getBalancerData } from './balancer';
import { getBancorData } from './bancor';
import registerCoinMetrics from './coinmetrics';
import registerCompound from './compound';
import { getCurveData } from './curve';
import { getHegicData } from './hegic';
import { getOmenData } from './omen';
import { get0xData } from './zerox';
import { getRenData } from './ren';
import registerSushiswap from './sushi';
import registerSynthetix from './synthetix';
// import { getPolymarketData } from './polymarket';
import { getPolkadotData, getKusamaData } from './polkadot';
import { getMstableData } from './mStable';
import { getTBTCData } from './tbtc';
import { getTornadoData } from './tornado';
import registerUniswap from './uniswap';
import { getAaveData } from './aave';

export const adapters = [
  getLinkswapData,
  getBalancerData,
  getBancorData,
  get0xData,
  getCurveData,
  getHegicData,
  getKusamaData,
  getOmenData,
  // getPolymarketData,
  getPolkadotData,
  getRenData,
  getMstableData,
  getTornadoData,
  getTBTCData,
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

registerCoinMetrics(register);
registerCompound(register);
registerSushiswap(register);
registerSynthetix(register);
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
