import React from 'react';
import RangeSelector, { DateRange } from './RangeSelector';
import Select from 'react-select';
import icons from './icons';

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

const protocolStyles = (styles: any, { data }: any) => ({
  ...styles,
  display: 'flex',
  alignItems: 'center',
  ':before': {
    background: icons[data.value] ? `url('${icons[data.value]}')` : null,
    content: '""',
    display: 'block',
    marginRight: 8,
    height: 20,
    width: 20,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
  },
});

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
        value={smoothing && { label: `${smoothing + 1} Days` }}
        onChange={(val: any) => onSmoothingChange(val.value)}
        placeholder="Smoothing"
        isSearchable={false}
        styles={{
          control: (provided: any) => ({
            ...provided,
            width: 120,
          }),
        }}
      />
      <Select
        options={Object.entries(protocols).map(([value, label]: string[]) => ({ value, label }))}
        value={secondary && { value: secondary, label: protocols[secondary] }}
        onChange={(val: any) => onSecondaryChange(val.value)}
        placeholder="Compare"
        styles={{
          control: (provided: any) => ({
            ...provided,
            width: 150,
          }),
          singleValue: protocolStyles,
          option: protocolStyles,
        }}
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
