import React from 'react';
import RangeSelector, { DateRange } from './RangeSelector';
import Select from './Select';

interface ChartToolbarProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  maxDate?: Date;
  smoothing: number;
  onSmoothingChange: (smoothing: number) => void;
  protocols: { [id: string]: string };
  protocolIcons: { [id: string]: string };
  secondary: string | null;
  onSecondaryChange: (val: string | null) => void;
}

const smoothingOptions = [
  { value: 0, label: 'None' },
  { value: 2, label: '3 Days' },
  { value: 6, label: '7 Days' },
];

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  range,
  onRangeChange,
  maxDate,
  smoothing,
  onSmoothingChange,
  protocols,
  protocolIcons,
  secondary,
  onSecondaryChange,
}) => {
  const protocolList = Object.entries(protocols)
    .sort((a: string[], b: string[]) => a[1].localeCompare(b[1]))
    .map(([value, label]: string[]) => ({ value, label }));

  return (
    <div className="toolbar">
      <RangeSelector value={range} onChange={onRangeChange} maxDate={maxDate} />
      <Select
        options={smoothingOptions}
        value={smoothing > 0 ? smoothing : undefined}
        onChange={(val: number) => onSmoothingChange(val)}
        placeholder="Smoothing"
        width={120}
      />
      <Select
        options={protocolList}
        value={secondary}
        onChange={(val: string) => onSecondaryChange(val)}
        placeholder="Compare"
        searchable
        width={150}
        icons={protocolIcons}
      />

      <style jsx>{`
        .toolbar {
          display: flex;
        }
        .toolbar > :global(*) {
          margin-right: 4px;
          margin-bottom: 4px;
        }
        .select {
          width: 100px;
        }
        @media (max-width: 700px) {
          .toolbar {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ChartToolbar;
