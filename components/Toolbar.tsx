import React, { forwardRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import subDays from 'date-fns/subDays';
import { useRouter } from 'next/router';
import Button from './Button';

const DateButton = forwardRef<
  HTMLButtonElement,
  { onClick?: any; value?: string; loading?: boolean }
>(({ onClick, value, loading }, ref) => (
  <Button ref={ref} onClick={onClick}>
    {loading ? <div className="loader" /> : value || 'Yesterday'}

    <style jsx>{`
      .loader {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 0 10px;
      }
      .loader:after {
        content: ' ';
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid #333;
        border-color: #333 transparent #333 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </Button>
));

interface ToolbarProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  onFilterToggle?: () => void;
  numFilters?: number;
  onShare?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  date,
  onDateChange,
  onFilterToggle,
  numFilters,
  onShare,
}) => {
  const router = useRouter();
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (changed) {
      const startLoading = () => setLoading(true);
      const stopLoading = () => {
        setLoading(false);
        setChanged(false);
      };

      router.events.on('routeChangeStart', startLoading);
      router.events.on('routeChangeComplete', stopLoading);
      router.events.on('routeChangeError', stopLoading);

      return () => {
        router.events.off('routeChangeStart', startLoading);
        router.events.off('routeChangeComplete', stopLoading);
        router.events.off('routeChangeError', stopLoading);
      };
    }
  }, [changed]);

  return (
    <div className="toolbar">
      <Button onClick={onShare}>Share</Button>

      <Button onClick={onFilterToggle}>
        Filters
        {numFilters > 0 && <span className="chip">{numFilters}</span>}
      </Button>

      {onDateChange && (
        <DatePicker
          selected={date}
          customInput={<DateButton loading={loading && changed} />}
          onChange={(newDate: any) => {
            setChanged(true);
            onDateChange(newDate);
          }}
          maxDate={subDays(new Date(), 1)}
          popperPlacement="bottom-end"
        />
      )}

      <style jsx>{`
        .toolbar {
          display: flex;
          justify-content: flex-end;
          align-self: stretch;
          margin: 0 4px;
        }
        .chip {
          background: #828282;
          color: #f9fafc;
          border-radius: 6px;
          font-size: 10px;
          padding: 2px 4px;
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
