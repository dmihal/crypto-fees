export type Category = 'l1' | 'l2' | 'dex' | 'lending' | 'xchain' | 'other';

export interface Metadata {
  name?: string;
  shortName?: string;
  subtitle?: string;
  bundle?: string;
  category: Category;
  description?: string;
  feeDescription?: string;
  icon?: string;
  website?: string;
  blockchain?: string;
  source?: string;
  adapter: string;
  tokenTicker?: string;
  tokenCoingecko?: string;
  protocolLaunch: string;
  tokenLaunch?: string;
  legacy?: boolean;
  events?: { date: string; description: string }[];
}

export interface ProtocolData extends Metadata {
  id: string;
  bundleData?: ProtocolData[];
  price: number | null;
  marketCap: number | null;
  psRatio: number | null;
  sevenDayMA: number;
  oneDay: number;
}

export type QueryFunction = (attribute: string, date: string) => Promise<number>;

export interface RegisterFunction {
  (name: string, fn: QueryFunction, metadata: Metadata): void;
  bundle(id: string, metadata: Metadata): void;
}
