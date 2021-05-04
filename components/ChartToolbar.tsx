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
  secondary,
  onSecondaryChange,
}) => {
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
        options={Object.entries(protocols).map(([value, label]: string[]) => ({ value, label }))}
        value={secondary}
        onChange={(val: string) => onSecondaryChange(val)}
        placeholder="Compare"
        searchable
        width={150}
        protocol
      />

      <style jsx>{`
        .toolbar {
          display: flex;
        }
        .select {
          width: 100px;
        }
      `}</style>
    </div>
  );
};

export default ChartToolbar;
