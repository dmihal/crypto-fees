import { RegisterFunction } from '../types';
import { dateToTimestamp } from '../lib/time';
import icon from 'icons/ren.svg';

const ONE_DAY = 86400;

export default function registerRen(register: RegisterFunction) {
  async function getRenData(date: string): Promise<number> {
    const now = dateToTimestamp(date);
    const oneDayAgo = now - ONE_DAY;
    // console.log({ now, oneDayAgo })

    const req = await fetch('https://stats.renproject.io/', {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operationName: null,
        variables: {},
        query: `{
          current: Snapshot(timestamp: "${now}") {
            fees {
              asset
              amount
            }
            prices {
              asset
              priceInUsd
              decimals
            }
          }
          dayAgo: Snapshot(timestamp: "${oneDayAgo}") {
            fees {
              asset
              amount
            }
          }
        }`,
      }),
      method: 'POST',
    });
    const { data } = await req.json();

    const dayAgo = data.dayAgo.fees.reduce(
      (acc, fees) => ({ ...acc, [fees.asset]: fees.amount }),
      {}
    );

    const current = data.current.fees.reduce(
      (acc, fees) => ({ ...acc, [fees.asset]: fees.amount }),
      {}
    );

    const prices = data.current.prices.reduce(
      (acc, prices) => ({ ...acc, [prices.asset]: prices }),
      {}
    );

    const assets = Object.keys(current);

    return assets.reduce((acc, asset) => {
      const difference = current[asset] - (dayAgo[asset] || 0);
      const differentInUsd = (difference / 10 ** prices[asset].decimals) * prices[asset].priceInUsd;
      return acc + (differentInUsd || 0);
    }, 0);
  }

  const query = async (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Ren doesn't support ${attribute}`);
    }
    return getRenData(date);
  };

  register('ren', query, {
    icon,
    name: 'Ren Protocol',
    category: 'xchain',
    description: 'Ren Protocol is a protocol for cross-chain asset transfers.',
    feeDescription: 'Transfer fees are paid by users to node operators (Darknodes).',
    source: 'RenVM Tracker',
    adapter: 'ren',
    website: 'https://renproject.io',
    tokenTicker: 'REN',
    tokenCoingecko: 'republic-protocol',
    protocolLaunch: '2020-08-01',
  });
}
