import React from 'react';
import RangeSelector, { DateRange } from './RangeSelector';

interface ChartToolbarProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  maxDate?: Date;
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({ range, onRangeChange, maxDate }) => {
  return (
    <div>
      <RangeSelector value={range} onChange={onRangeChange} maxDate={maxDate} />
    </div>
  );
};

export default ChartToolbar;
