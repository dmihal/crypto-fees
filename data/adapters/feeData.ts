type Category = 'l1' | 'app' | 'l2' | 'dex' | 'lending' | 'xchain' | 'other';

export interface FeeData {
  id: string;
  name?: string;
  category: Category;
  sevenDayMA: number;
  oneDay: number;
  description?: string;
  feeDescription?: string;
  blockchain?: string;
  source?: string;
  adapter?: string;
  website?: string;
}

const last7Days = () =>
  [...new Array(7)].map((_, num) => Math.floor(Date.now() / 1000 / 86400 - num - 1) * 86400);

export async function getLinkswapData(): Promise<FeeData> {
  const last7DaysArray = last7Days();
  const lastDay = last7DaysArray[6];
  const linkAddress = '0x514910771af9ca656af840dff83e8264ecf986ca';
  const request = await fetch('https://api.thegraph.com/subgraphs/name/yflink/linkswap-v1', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        notlink: 
          pairDayDatas(where:{date_in: ${JSON.stringify(
            last7Days()
          )}, token0_not_contains: "${linkAddress}", token1_not_contains: "${linkAddress}" }) {
          date
          dailyVolumeUSD
        }
        all: 
         pairDayDatas(where:{date_in: ${JSON.stringify(last7Days())} }) {
          date
          dailyVolumeUSD
        }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  let sevenDayMANotLinkTotal = 0;
  let oneDayNotLinkTotal = 0;
  data['notlink'].forEach(function (element) {
    sevenDayMANotLinkTotal += parseFloat(element.dailyVolumeUSD);
    if (element.date === lastDay) {
      oneDayNotLinkTotal += parseFloat(element.dailyVolumeUSD);
    }
  });
  sevenDayMANotLinkTotal = sevenDayMANotLinkTotal / 7;

  let sevenDayMAAllTotal = 0;
  let oneDayNotAllTotal = 0;
  data['all'].forEach(function (element) {
    sevenDayMAAllTotal += parseFloat(element.dailyVolumeUSD);
    if (element.date === lastDay) {
      oneDayNotAllTotal += parseFloat(element.dailyVolumeUSD);
    }
  });
  sevenDayMAAllTotal = sevenDayMAAllTotal / 7;

  const sevenDayMANotLink = sevenDayMANotLinkTotal * 0.003;
  const sevenDayMALink = (sevenDayMAAllTotal - sevenDayMANotLinkTotal) * 0.0025;

  const sevenDayMA = sevenDayMANotLink + sevenDayMALink;

  const oneDay = (oneDayNotAllTotal - oneDayNotLinkTotal) * 0.0025 + oneDayNotLinkTotal * 0.003;

  return {
    id: 'linkswap',
    category: 'app',
    sevenDayMA,
    oneDay,
  };
}
