import { getLinkswapData } from './feeData';
import { getBalancerData } from './balancer';
import { getBancorData } from './bancor';
import registerCoinMetrics from './coinmetrics';
import { getCompoundData } from './compound';
import { getCurveData } from './curve';
import { getHegicData } from './hegic';
import { getOmenData } from './omen';
import { get0xData } from './zerox';
import { getRenData } from './ren';
import { getSushiswapData } from './sushi';
import registerSynthetix from './synthetix';
// import { getPolymarketData } from './polymarket';
import { getPolkadotData, getKusamaData } from './polkadot';
import { getMstableData } from './mStable';
import { getTBTCData } from './tbtc';
import { getTornadoData } from './tornado';
import { getUniswapV1Data, getUniswapV2Data } from './uniswap';
import { getAaveData } from './aave';

export const adapters = [
  getUniswapV1Data,
  getUniswapV2Data,
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
  getSushiswapData,
  getMstableData,
  getTornadoData,
  getTBTCData,
  getAaveData,
  getCompoundData,
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

registerSynthetix(register);
registerCoinMetrics(register);

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
