import React from 'react';
import RangeSelector, { DateRange } from './RangeSelector';
import Select from 'react-select';

interface ChartToolbarProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  maxDate?: Date;
  smoothing: number;
  onSmoothingChange: (smoothing: number) => void;
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
}) => {
  return (
    <div className="toolbar">
      <RangeSelector value={range} onChange={onRangeChange} maxDate={maxDate} />
      <Select
        options={smoothingOptions}
        value={smoothing}
        onChange={(val: any) => onSmoothingChange(val.value)}
      />

      <style jsx>{`
        .toolbar {
          display: flex;
        }
      `}</style>
    </div>
  );
};

export default ChartToolbar;
