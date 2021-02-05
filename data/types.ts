type Category = 'l1' | 'app' | 'l2';

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
}
