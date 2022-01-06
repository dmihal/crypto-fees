import React, { forwardRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import subDays from 'date-fns/subDays';
import { useRouter } from 'next/router';
import { Filter, Calendar, Share, CheckSquare, Square } from 'react-feather';
import Button from './Button';
import gtc from 'icons/gtc.svg';

const showGitcoin = false;

const DateButton = forwardRef<
  HTMLButtonElement,
  { onClick?: any; value?: string; loading?: boolean }
>(({ onClick, value, loading }, ref) => (
  <Button ref={ref} onClick={onClick} Icon={Calendar}>
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

const GTCIcon: React.FC = () => (
  <div className="gtc">
    <style jsx>{`
      .gtc {
        background: url('${gtc}');
        height: 18px;
        width: 18px;
        margin-right: 2px;
        flex: 0 0 18px;
      }
    `}</style>
  </div>
);

interface ToolbarProps {
  date?: Date;
  onDateChange?: (date: string) => void;
  onFilterToggle?: () => void;
  numFilters?: number;
  bundle: boolean;
  onBundleChange: (bundle: boolean) => void;
  onShare?: () => void;
  tags: { id: string; label: string }[];
  onTagRemoved: (tag: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  date,
  onDateChange,
  onFilterToggle,
  numFilters,
  bundle,
  onBundleChange,
  onShare,
  tags,
  onTagRemoved,
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
      <div className="tags">
        {tags.map((tag: any) => (
          <div key={tag.id} className="label" title={tag.label}>
            <span>{tag.label}</span>
            <button onClick={() => onTagRemoved(tag.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="buttons">
        {showGitcoin && (
          <Button
            Icon={GTCIcon}
            target="gitcoin"
            href="https://gitcoin.co/grants/1624/cryptofeesinfo"
          >
            Support us on Gitcoin
          </Button>
        )}

        {onShare && (
          <Button onClick={onShare} Icon={Share}>
            Share
          </Button>
        )}

        <Button onClick={() => onBundleChange(!bundle)} Icon={bundle ? CheckSquare : Square}>
          Bundle
        </Button>

        <Button onClick={onFilterToggle} Icon={Filter}>
          Filters
          {numFilters > 0 && <span className="chip">{numFilters}</span>}
        </Button>

        {onDateChange && (
          <DatePicker
            selected={date}
            customInput={<DateButton loading={loading && changed} />}
            onChange={(newDate: Date) => {
              setChanged(true);
              const pad = (num: number) => (num < 10 ? `0${num}` : num.toString());
              const formattedDate = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(
                newDate.getDate()
              )}`;
              onDateChange(formattedDate);
            }}
            maxDate={subDays(new Date(), 1)}
            popperPlacement="bottom-end"
          />
        )}
      </div>

      <style jsx>{`
        .toolbar {
          display: flex;
          justify-content: flex-end;
          align-self: stretch;
        }
        .buttons > :global(*),
        .tags > :global(*) {
          margin-left: 4px;
        }
        .tags {
          display: flex;
          justify-content: flex-end;
        }
        .buttons {
          display: flex;
          justify-content: flex-end;
          align-self: stretch;
        }
        .chip {
          background: #828282;
          color: #f9fafc;
          border-radius: 6px;
          font-size: 10px;
          padding: 2px 4px;
          margin-left: 6px;
        }
        .label {
          font-size: 10px;
          display: flex;
          max-width: 150px;
          align-items: center;
          background: #eeeeee;
          padding: 2px;
          border-radius: 4px;
        }
        .label span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .label button {
          margin-left: 4px;
          background: transparent;
          border: none;
          outline: none;
          padding: 4px;
        }
        .label button:hover {
          background: #dedede;
        }

        :global(.react-datepicker-wrapper),
        :global(.react-datepicker__input-container) {
          display: inline-flex;
          align-items: stretch;
        }

        @media (max-width: 700px) {
          .toolbar {
            flex-direction: column-reverse;
          }
          .tags {
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
