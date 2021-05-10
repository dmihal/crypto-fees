export type Category = 'l1' | 'dex' | 'lending' | 'xchain' | 'other';

export interface FeeData {
  id: string;
  name?: string;
  category: Category;
  sevenDayMA: number;
  oneDay: number;
  description?: string;
  feeDescription?: string;
  website?: string;
  blockchain?: string;
  source?: string;
  adapter?: string;
}

export interface Metadata {
  name?: string;
  category: Category;
  description?: string;
  feeDescription?: string;
  website?: string;
  blockchain?: string;
  source?: string;
  adapter: string;
  tokenTicker?: string;
  tokenCoingecko?: string;
  protocolLaunch?: string;
  tokenLaunch?: string;
  legacy?: boolean;
}

export interface ProtocolData extends Metadata {
  id: string;
  price: number | null;
  marketCap: number | null;
  psRatio: number | null;
  sevenDayMA: number;
  oneDay: number;
}
