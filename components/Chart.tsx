import React from 'react';
import { Line, XAxis, YAxis, Tooltip, LineChart, ResponsiveContainer } from 'recharts';
import format from 'date-fns/format';
import Numeral from 'numeral';

const toK = (num: number | string) => Numeral(num).format('0.[00]a');

const formattedNum = (number: number | string) => {
  // @ts-ignore
  if (isNaN(number) || number === '' || number === undefined) {
    return '$0';
  }
  // @ts-ignore
  const num = parseFloat(number);

  if (num > 500000000) {
    return '$' + toK(num.toFixed(0));
  }

  if (num === 0) {
    return '$0';
  }

  if (num < 0.0001 && num > 0) {
    return '< $0.0001';
  }

  if (num > 1000) {
    return '$' + Number(num.toFixed(0)).toLocaleString();
  }

  return Number(num.toFixed(5));
};

const toNiceDate = (date: string) => format(new Date(parseInt(date) * 1000), 'MMM dd');

const toNiceDateYear = (date: string) => format(new Date(parseInt(date) * 1000), 'MMMM dd, yyyy');

export interface ChartDay {
  date: number;
  fee: number;
}

interface SeriesChartProps {
  data: ChartDay[];
  primary: string;
  secondary?: string | null;
  loading?: boolean;
}

const Chart: React.FC<SeriesChartProps> = ({ data, primary, secondary, loading }) => {
  const color = 'blue';
  const textColor = 'black';

  return (
    <ResponsiveContainer height={200}>
      <LineChart
        height={200}
        width={500}
        margin={{ top: 0, right: 10, bottom: 6, left: 0 }}
        barCategoryGap={1}
        data={data}
      >
        <XAxis
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          tickMargin={14}
          minTickGap={0}
          tickFormatter={(tick: any) => toNiceDate(tick)}
          dataKey="date"
          tick={{ fill: textColor }}
          type={'number'}
          domain={['dataMin', 'dataMax']}
        />
        <YAxis
          type="number"
          orientation="right"
          tickFormatter={(tick: any) => '$' + toK(tick)}
          axisLine={false}
          tickLine={false}
          interval="preserveEnd"
          minTickGap={80}
          yAxisId={0}
          tickMargin={16}
          tick={{ fill: textColor }}
        />
        <Tooltip
          cursor={true}
          formatter={(val: any) => formattedNum(val)}
          labelFormatter={(label: any) => toNiceDateYear(label)}
          labelStyle={{ paddingTop: 4 }}
          contentStyle={{
            padding: '10px 14px',
            borderRadius: 10,
            borderColor: color,
            color: 'black',
          }}
          wrapperStyle={{ top: -70, left: -10 }}
        />
        <Line
          strokeWidth={2}
          dot={false}
          type="monotone"
          name={primary}
          dataKey="primary"
          yAxisId={0}
          stroke="#f2a900"
        />
        {secondary && (
          <Line
            strokeWidth={2}
            dot={false}
            type="monotone"
            name={secondary}
            dataKey="secondary"
            yAxisId={0}
            stroke="#f2a900"
          />
        )}
        {loading && <rect height="100%" width="100%" opacity="0.5" fill="#666" />}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
