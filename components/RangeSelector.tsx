import React, { useRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { usePopper } from 'react-popper';
import Button from './Button';
import { formatDate } from 'data/lib/time';

export interface DateRange {
  start: Date;
  end: Date;
}

interface RangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  maxDate?: Date;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({ value, onChange, maxDate }) => {
  const [show, setShow] = useState(false);
  const button = useRef(null);
  const popup = useRef(null);
  const { styles, attributes } = usePopper(button.current, popup.current, {
    placement: 'bottom-start',
  });

  useEffect(() => {
    if (show) {
      const listener = () => setShow(false);
      document.addEventListener('click', listener);
      return () => document.removeEventListener('click', listener);
    }
  }, [show]);

  return (
    <div>
      <Button ref={button} onClick={() => setShow(!show)}>
        {formatDate(value.start, '/')} - {formatDate(value.end, '/')}
      </Button>
      <div
        ref={popup}
        style={{ ...styles.popper, display: show ? 'block' : 'none' }}
        className="popover"
        {...attributes.popper}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <div className="picker-container">
          <DatePicker
            selected={value.start}
            startDate={value.start}
            endDate={value.end}
            onChange={(start: Date) => onChange({ ...value, start })}
            selectsStart
            inline
            maxDate={maxDate}
          />
          <DatePicker
            selected={value.end}
            startDate={value.start}
            endDate={value.end}
            onChange={(end: Date) => onChange({ ...value, end })}
            selectsEnd
            inline
            maxDate={maxDate}
          />
        </div>
      </div>

      <style jsx>{`
        .popover {
          z-index: 100;
        }
        .picker-container {
          display: flex;
          background: #ffffff;
          border: 1px solid #aeaeae;
          border-radius: 2px;
        }
        .picker-container :global(.react-datepicker) {
          border: none;
          border-radius: 0;
        }
      `}</style>
    </div>
  );
};

export default RangeSelector;
