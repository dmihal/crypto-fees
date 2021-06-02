import React, { Fragment, useState } from 'react';
import { ProtocolData } from 'data/types';
import icons from './icons';
import { CSSTransition } from 'react-transition-group';
import ReactGA from 'react-ga';
import { ChevronDown, ChevronUp } from 'react-feather';
import DetailsCard from './DetailsCard';

interface RowProps {
  protocol: ProtocolData;
}

const toggle = (isOpen: boolean) => !isOpen;

const cardHeight = 300;

const Name: React.FC<{ name: string; shortName: string }> = ({ name, shortName }) => {
  return (
    <div className="name">
      <div className={shortName ? 'long-name' : ''}>{name}</div>
      {shortName && <div className="short-name">{shortName}</div>}

      <style jsx>{`
        .name {
          flex: 1;
          padding-left: 32px;
        }
        .short-name {
          display: none;
        }
        @media (max-width: 700px) {
          .name {
            font-size: 14px;
            padding: 0;
          }
          .short-name {
            display: block;
          }
          .long-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

const Row: React.FC<RowProps> = ({ protocol }) => {
  const [open, setOpen] = useState(false);

  const icon = protocol.icon || icons[protocol.id];

  return (
    <Fragment>
      <a
        href={`/protocol/${protocol.id}`}
        onClick={(e: any) => {
          e.preventDefault();
          setOpen(toggle);
          ReactGA.event({
            category: 'Navigation',
            action: open ? 'Close details' : 'Open details',
            label: protocol.name,
          });
        }}
        className={`item ${protocol.category !== 'l1' ? 'app' : ''} ${open ? 'open' : ''}`}
        style={{
          backgroundImage: icon ? `url('${icon}')` : undefined,
        }}
      >
        <Name name={protocol.name} shortName={protocol.shortName} />
        <div className="amount">
          {protocol.oneDay?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </div>
        <div className="amount">
          {protocol.sevenDayMA?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </div>
        <div className="arrow">{open ? <ChevronUp /> : <ChevronDown />}</div>
      </a>

      <CSSTransition in={open} timeout={500} unmountOnExit>
        <div className="details-container">
          <DetailsCard protocol={protocol} />
        </div>
      </CSSTransition>
      <style jsx>{`
        .item {
          display: flex;
          padding: 0 4px;
          background-color: #fff;
          font-size: 18px;
          background-repeat: no-repeat;
          background-position: 10px center;
          background-size: 20px 20px;
          padding-left: 10px;
          color: black;
          text-decoration: none;
          align-items: center;
          height: 54px;
        }
        .item:hover {
          background-color: #f5f5f5;
        }

        .item.app {
          background-color: #fad3f6;
        }
        .item.app:hover {
          background-color: #f8c3f3;
        }

        .amount {
          padding-left: 32px;
        }

        .amount {
          min-width: 200px;
          text-align: right;
          font-family: 'Noto Sans TC', sans-serif;
        }

        .arrow {
          padding: 0 4px;
          height: 24px;
          opacity: 0.7;
        }

        @keyframes slidein {
          from {
            height: 0px;
          }

          to {
            height: ${cardHeight}px;
          }
        }

        @keyframes slideout {
          from {
            height: ${cardHeight}px;
          }

          to {
            height: 0px;
          }
        }

        .details-container {
          height: ${cardHeight}px;
          animation: 0.5s 1 slidein;
          overflow: hidden;

          border-top: solid 1px #e3e3e3;
          border-bottom: solid 1px #e3e3e3;
          display: flex;
          flex-direction: column;
        }

        .details-container.exit {
          height: 0;
          animation: 0.5s 1 slideout;
        }

        @media (max-width: 700px) {
          .amount {
            font-size: 14px;
            min-width: 110px;
            padding-left: 8px;
          }

          .item {
            padding-left: 30px;
            background-position: 6px center;
          }

          .arrow {
            padding: 0 2px;
          }
        }
      `}</style>
    </Fragment>
  );
};

export default Row;
