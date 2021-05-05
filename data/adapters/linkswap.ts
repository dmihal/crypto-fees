import { query } from '../lib/graph';
import { dateToTimestamp } from '../lib/time';

const LINK_ADDRESS = '0x514910771af9ca656af840dff83e8264ecf986ca';

export async function getLinkswapData(date: string): Promise<number> {
  const data = await query(
    'yflink/linkswap-v1',
    `{
      notlink: 
        pairDayDatas(where:{
          date: ${dateToTimestamp(date)},
          token0_not_contains: "${LINK_ADDRESS}",
          token1_not_contains: "${LINK_ADDRESS}"
        }) {
        date
        dailyVolumeUSD
      }
      all: 
       pairDayDatas(where:{date: ${dateToTimestamp(date)} }) {
        date
        dailyVolumeUSD
      }
    }`
  );

  let oneDayNotLinkTotal = 0;
  data['notlink'].forEach((element: any) => {
    oneDayNotLinkTotal += parseFloat(element.dailyVolumeUSD);
  });

  let oneDayNotAllTotal = 0;
  data['all'].forEach((element: any) => {
    oneDayNotAllTotal += parseFloat(element.dailyVolumeUSD);
  });

  const oneDay = (oneDayNotAllTotal - oneDayNotLinkTotal) * 0.0025 + oneDayNotLinkTotal * 0.003;

  return oneDay;
}

export default function registerLinkswap(register: any) {
  const sushiQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Linkswap doesn't support ${attribute}`);
    }
    return getLinkswapData(date);
  };

  register('linkswap', sushiQuery, {
    name: 'Linkswap',
    category: 'dex',
    description: 'Linkswap is a LINK-centred decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'linkswap',
    website: 'https://linkswap.app',
    tokenTicker: 'YFL',
    tokenCoingecko: 'yflink',
    protocolLaunch: '2020-11-15',
    tokenLaunch: '2020-08-09',
  });
}
