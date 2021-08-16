import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import { RegisterFunction } from '../types';
import { getHistoricalPrice } from '../lib/pricedata';
import icon from 'icons/liquity.svg';

export async function getLiquityData(date: string): Promise<number> {
  const graphQuery = `query fees($today: Int!, $yesterday: Int!) {
    today: global(id: "only", block: {number: $today}) {
      totalBorrowingFeesPaid
      totalRedemptionFeesPaid
    }
    yesterday: global(id: "only", block: {number: $yesterday}) {
      totalBorrowingFeesPaid
      totalRedemptionFeesPaid
    }
  }`;

  const data = await query(
    'liquity/liquity',
    graphQuery,
    {
      today: await getBlockNumber(offsetDaysFormatted(date, 1)),
      yesterday: await getBlockNumber(date),
    },
    'fees'
  );

  const ethPrice = await getHistoricalPrice('ethereum', date);

  const borrowingFees = data.today.totalBorrowingFeesPaid - data.yesterday.totalBorrowingFeesPaid;
  const redemptionFeesETH =
    data.today.totalRedemptionFeesPaid - data.yesterday.totalRedemptionFeesPaid;
  const redemptionFeesUSD = redemptionFeesETH * ethPrice;

  return borrowingFees + redemptionFeesUSD;
}

export default function registerLiquity(register: RegisterFunction) {
  const query = async (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Liquity doesn't support ${attribute}`);
    }
    return getLiquityData(date);
  };

  register('liquity', query, {
    icon,
    name: 'Liquity',
    category: 'lending',
    description:
      'Liquity is a decentralized borrowing protocol that allows drawing 0% interest loans against Ether.',
    feeDescription:
      'Users pay fees when borrowing and redeeming LUSD, which are paid to LQTY stakers.',
    website: 'https://liquity.org',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'liquity',
    tokenTicker: 'LQTY',
    tokenCoingecko: 'liquity',
    protocolLaunch: '2020-04-05',
    tokenLaunch: '2021-04-05',
  });
}
