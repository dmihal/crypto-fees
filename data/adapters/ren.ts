import { RegisterFunction } from '../types';
import { dateToTimestamp } from '../lib/time';
import icon from 'icons/ren.svg';

const ONE_DAY = 86400;

export default function registerRen(register: RegisterFunction) {
  async function getRenData(date: string): Promise<number> {
    const now = dateToTimestamp(date);
    const tomorrow = now + ONE_DAY;
    console.log({ now, tomorrow })

    const req = await fetch('https://stats.renproject.io/', {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operationName: null,
        variables: {},
        query: `{
          now: Snapshot(timestamp: "${now}") {
            timestampString
            fees {
              amountInUsd
            }
          }
          tomorrow: Snapshot(timestamp: "${tomorrow}") {
            timestampString
            fees {
              amountInUsd
            }
          }
        }`,
      }),
      method: 'POST',
    });
    const { data } = await req.json();

    const nowFees = data.now.fees.reduce((acc, fee) => acc + parseFloat(fee.amountInUsd), 0);
    const tomorrowFees = data.tomorrow.fees.reduce((acc, fee) => acc + parseFloat(fee.amountInUsd), 0);
    console.log(data, { nowFees, tomorrowFees });
    return tomorrowFees - nowFees;
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
