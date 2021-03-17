import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import subDays from 'date-fns/subDays';
import Button from './Button';

const DateButton = forwardRef<HTMLButtonElement, { onClick?: any; value?: string }>(
  ({ onClick, value }, ref) => (
    <Button ref={ref} onClick={onClick}>
      {value || 'Yesterday'}
    </Button>
  )
);

interface ToolbarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ date, onDateChange }) => {
  return (
    <div>
      {onDateChange && (
        <DatePicker
          selected={date}
          customInput={<DateButton />}
          onChange={onDateChange}
          maxDate={subDays(new Date(), 1)}
        />
      )}
    </div>
  );
};

export default Toolbar;
