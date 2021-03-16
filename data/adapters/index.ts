import {
  getL1FeeData,
  getLinkswapData,
  getUniswapV1Data,
  getUniswapV2Data,
  getSushiswapData,
} from './feeData';
import { getBalancerData } from './balancer';
import { getBancorData } from './bancor';
import { getCompoundData } from './compound';
import { getCurveData } from './curve';
import { getHegicData } from './hegic';
import { getOmenData } from './omen';
import { get0xData } from './zerox';
import { getRenData } from './ren';
import { getSynthetixData } from './synthetix';
import registerSynthetix from './synthetix';
import { getPolymarketData } from './polymarket';
import { getPolkadotData, getKusamaData } from './polkadot';
import { getMstableData } from './mStable';
import { getTBTCData } from './tbtc';
import { getTornadoData } from './tornado';
import { getAaveData } from './aave';

export const adapters = [
  getL1FeeData,
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
  getPolymarketData,
  getPolkadotData,
  getRenData,
  getSushiswapData,
  getSynthetixData,
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
}

registerSynthetix(register);

export async function queryAdapter(protocol: string, attribute: string, date: string) {
  if (!adapters2[protocol]) {
    throw new Error(`Unknown protocol ${protocol}`);
  }

  const value = adapters2[protocol].query(attribute, date);
  return value;
}
