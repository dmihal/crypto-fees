import React, { useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import format from 'date-fns/format';
import Numeral from 'numeral';
import { dateToTimestamp } from 'data/lib/time';

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

  return '$' + Number(num.toFixed(0)).toLocaleString();
};

const toNiceDate = (date: string) => format(new Date(parseInt(date) * 1000), 'MMM dd');

const toNiceDateYear = (date: string) => format(new Date(parseInt(date) * 1000), 'MMMM dd, yyyy');

export interface FeeItem {
  date: number;
  primary: number | null;
  secondary: number | null;
}

function findFee(days: FeeItem[], date: number) {
  for (const day of days) {
    if (day.date === date) {
      return day.primary;
    }
  }
  return 0;
}

interface SeriesChartProps {
  data: FeeItem[];
  primary: string;
  secondary?: string | null;
  loading?: boolean;
  protocols: { [id: string]: string };
  server?: boolean;
  events?: { date: string; description: string }[];
}

interface ActiveTooltip {
  description: string;
  point: { x: number; y: number };
}

const Chart: React.FC<SeriesChartProps> = ({
  data,
  primary,
  secondary,
  loading,
  protocols,
  server,
  events,
}) => {
  const [tooltip, setTooltip] = useState<null | ActiveTooltip>(null);
  const color = 'blue';
  const textColor = 'black';

  const Container: any = server ? 'div' : ResponsiveContainer;

  const margin = server
    ? { top: 20, right: 20, bottom: 20, left: 20 }
    : { top: 0, right: 10, bottom: 6, left: 0 };

  const width = server ? 380 : 500;

  return (
    <Container height={200}>
      <LineChart height={200} width={width} margin={margin} barCategoryGap={1} data={data}>
        <XAxis
          tickLine={false}
          stroke="#efefef"
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
          stroke="#efefef"
          interval="preserveEnd"
          minTickGap={80}
          yAxisId={0}
          tickMargin={16}
          tick={{ fill: textColor }}
        />
        <Tooltip
          cursor={true}
          separator={tooltip ? null : ' : '}
          formatter={(val: any) => (tooltip ? [tooltip.description] : formattedNum(val))}
          labelFormatter={(label: any) => toNiceDateYear(label)}
          labelStyle={{ paddingTop: 4 }}
          position={tooltip?.point}
          contentStyle={{
            padding: '10px 14px',
            borderRadius: 10,
            borderColor: color,
            color: 'black',
            maxWidth: 250,
            whiteSpace: 'normal',
          }}
          wrapperStyle={{ top: -70, left: -10 }}
        />
        <Line
          strokeWidth={2}
          dot={false}
          type="monotone"
          name={protocols[primary]}
          dataKey="primary"
          yAxisId={0}
          stroke="#f2a900"
        />

        {events?.map((event) => (
          <ReferenceDot
            key={event.description}
            x={dateToTimestamp(event.date)}
            y={findFee(data, dateToTimestamp(event.date))}
            r={4}
            fill="#b957af"
            onMouseOver={(e: any) =>
              setTooltip({
                description: event.description,
                point: { x: e.cx + 10, y: e.cy - 10 },
              })
            }
            onMouseOut={() => setTooltip(null)}
          />
        ))}

        {secondary && (
          <Line
            strokeWidth={2}
            dot={false}
            type="monotone"
            name={protocols[secondary]}
            dataKey="secondary"
            yAxisId={0}
            stroke="#d6d3cc"
          />
        )}
        {loading && <rect height="100%" width="100%" opacity="0.5" fill="#666" />}
      </LineChart>
    </Container>
  );
};

export default Chart;
