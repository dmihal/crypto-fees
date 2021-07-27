import { ProtocolData } from './types';

export const sortByDaily = (a: ProtocolData, b: ProtocolData) => b.oneDay - a.oneDay;

export const sortByWeekly = (a: ProtocolData, b: ProtocolData) => b.sevenDayMA - a.sevenDayMA;
