/*
 * This code is being deprecated!
 *
 * CryptoFees.info is transitioning to pull all data from the CryptoStats protocol
 * Visit https://cryptostats.community/discover/fees to see the code for adapters not included here,
 * and to write new adapters.
 */

import type { Adapter as SDKAdapter } from '@cryptostats/sdk';
import { Metadata } from '../types';

import registerBancor from './bancor';
// import registerCurve from './curve';
import registerDfyn from './dfyn';
// import registerHegic from './hegic';
import registerHoneyswap from './honeyswap';
import registerLinkswap from './linkswap';
// import register0x from './zerox';
import registerMstable from './mStable';
// import registerOptimism from './optimism';
import registerPolymarket from './polymarket';
import registerRen from './ren';
import registerSwapr from './swapr';
// import registerTBTC from './tbtc';
import registerZilliqa from './zilliqa';
import sdk from 'data/sdk';

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

// register0x(register);
registerBancor(register);
registerDfyn(register);
registerHoneyswap(register);
registerLinkswap(register);
registerMstable(register);
registerPolymarket(register);
registerRen(register);
registerSwapr(register);
// registerTBTC(register);
registerZilliqa(register);

let loadListPromise: any = null;
export async function ensureListLoaded() {
  if (!loadListPromise) {
    loadListPromise = loadList();
  }
  await loadListPromise;
}

/*
 * This code loads adapters from CryptoStats's fee list, and adapts them to function like legacy adapters
 * See https://cryptostats.community/discover/fees
 */
async function loadList() {
  const list = sdk.getList('fees');
  list.setCacheKeyResolver((_id: string, query: string, params: string[]) =>
    query === 'oneDayTotalFees' ? params[0] : null
  );
  await list.fetchAdapters();

  // list.bundles
  await Promise.all(
    list.getAdapters().map(async (adapter: SDKAdapter) => {
      const id = adapter.id;
      if (adapters[id]) {
        throw new Error(`Adapter ${id} already registered`);
      }
      ids.push(id);

      const metadata = await adapter.getMetadata();
      metadata.bundle = adapter.bundle || null;

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

  for (const id of list.bundleIds) {
    bundleIds.push(id);
    bundles[id] = (await list.getBundle(id)) as any;
  }
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
