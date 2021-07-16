import sdk from '../sdk';

import registerAave from './aave';
import registerAvalanche from './avalanche';
import registerBalancer from './balancer';
import registerBancor from './bancor';
import registerBSC from './bsc';
import registerCoinMetrics from './coinmetrics';
import registerCompound from './compound';
// import registerCurve from './curve';
import registerFTM from './fantom';
import registerQuickswap from './quickswap';
import registerHegic from './hegic';
import registerHoneyswap from './honeyswap';
import registerLinkswap from './linkswap';
import registerMaker from './maker';
import register0x from './zerox';
import registerMstable from './mStable';
import registerOptimism from './optimism';
import registerPolygon from './polygon';
import registerPolymarket from './polymarket';
import registerRen from './ren';
import registerSushiswap from './sushi';
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

const register = (id: string, query: any, metadata: any) => {
  if (adapters[id]) {
    throw new Error(`Adapter ${id} already registered`);
  }
  ids.push(id);
  adapters[id] = { query, metadata };
};

register0x(register, sdk);
registerAave(register, sdk);
registerAvalanche(register, sdk);
registerBalancer(register, sdk);
registerBancor(register, sdk);
registerBSC(register, sdk);
registerCoinMetrics(register, sdk);
registerCompound(register, sdk);
// registerCurve(register);
registerFTM(register, sdk);
registerHegic(register, sdk);
registerHoneyswap(register, sdk);
registerLinkswap(register, sdk);
registerMaker(register, sdk);
registerMstable(register, sdk);
registerOptimism(register, sdk);
registerQuickswap(register, sdk);
registerPolkadot(register, sdk);
registerPolygon(register, sdk);
registerPolymarket(register, sdk);
registerRen(register, sdk);
registerSushiswap(register, sdk);
registerSynthetix(register, sdk);
registerTBTC(register, sdk);
registerTerra(register, sdk);
registerTornado(register, sdk);
registerUniswap(register, sdk);
registerXDai(register, sdk);
registerZilliqa(register, sdk);

export const getIDs = () => ids;

export function getMetadata(id: string) {
  if (!adapters[id]) {
    throw new Error(`Unknown protocol ${id}`);
  }
  return adapters[id].metadata;
}

export async function queryAdapter(protocol: string, attribute: string, date: string) {
  if (!adapters[protocol]) {
    throw new Error(`Unknown protocol ${protocol}`);
  }

  const value = adapters[protocol].query(attribute, date);
  return value;
}
