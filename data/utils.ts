import { ProtocolData, Metadata } from './types';

export const sortByDaily = (a: ProtocolData, b: ProtocolData) => b.oneDay - a.oneDay;

export const sortByWeekly = (a: ProtocolData, b: ProtocolData) => b.sevenDayMA - a.sevenDayMA;

const filterListToLabel = (list: any[], ids: string[]) =>
  list
    .filter((item: any) => ids.indexOf(item.id) !== -1)
    .map((item: any) => item.name)
    .join(', ');

export const filterCategories = (data: ProtocolData[], filter: string[], allCategories: any[]) => {
  const _data = data.filter((item: ProtocolData) => filter.indexOf(item.category) !== -1);
  const tag = {
    id: 'categories',
    label: filterListToLabel(allCategories, filter),
  };
  return { data: _data, tag };
};

export const filterChains = (data: ProtocolData[], filter: string[], allChains: any[]) => {
  const _data = data.filter((item: ProtocolData) =>
    item.blockchain ? filter.indexOf(item.blockchain) !== -1 : filter.indexOf('other') !== -1
  );
  const tag = {
    id: 'chains',
    label: filterListToLabel(allChains, filter),
  };

  return { data: _data, tag };
};

export const bundleItems = (data: ProtocolData[], bundles: { [id: string]: Metadata }) => {
  const _data = [...data];
  for (let i = 0; i < _data.length; i += 1) {
    const item = _data[i];
    if (item.bundle) {
      const bundleItems = [item];

      for (let j = i + 1; j < _data.length; j += 1) {
        if (_data[j].bundle === item.bundle) {
          bundleItems.push(_data[j]);
        }
      }

      if (bundleItems.length > 1) {
        const bundleMetadata = bundles[item.bundle as string];
        let oneDay = 0;
        let sevenDayMA = 0;
        let price = null;
        let marketCap = null;

        for (const bundleItem of bundleItems) {
          _data.splice(_data.indexOf(bundleItem), 1);
          oneDay += bundleItem.oneDay;
          sevenDayMA += bundleItem.sevenDayMA;

          if (bundleMetadata.tokenCoingecko === bundleItem.tokenCoingecko) {
            price = bundleItem.price;
            marketCap = bundleItem.marketCap;
          }
        }
        _data.push({
          ...bundleMetadata,
          id: item.bundle,
          oneDay,
          sevenDayMA,
          bundleData: bundleItems,
          price,
          marketCap,
          psRatio: marketCap ? marketCap / (sevenDayMA * 365) : null,
        });

        i -= 1; // To compensate for the first item removed
      }
    }
  }
  return _data;
};
