import React, { Fragment, useState } from 'react';
import { FeeData } from 'data/adapters/feeData';
import icons from './icons';
import { CSSTransition } from 'react-transition-group';
import DetailsCard from './DetailsCard';

interface RowProps {
  protocol: FeeData;
}

const toggle = (isOpen: boolean) => !isOpen;

const Row: React.FC<RowProps> = ({ protocol }) => {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <div
        onClick={() => setOpen(toggle)}
        className={`item ${protocol.category}`}
        style={{
          backgroundImage: icons[protocol.id] ? `url('${icons[protocol.id]}')` : undefined,
        }}
      >
        <div className="name">{protocol.name}</div>
        <div className="amount">
          {protocol.oneDay.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </div>
        <div className="amount">
          {protocol.sevenDayMA.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </div>
      </div>

      <CSSTransition in={open} transitionName="example" timeout={500} unmountOnExit>
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

        .item > div {
          padding: 16px 32px;
        }

        .name {
          flex: 1;
        }

        .amount {
          min-width: 250px;
          text-align: right;
        }

        @keyframes slidein {
          from {
            height: 0px;
          }

          to {
            height: 200px;
          }
        }

        @keyframes slideout {
          from {
            height: 200px;
          }

          to {
            height: 0px;
          }
        }

        .details-container {
          height: 200px;
          animation: 0.5s 1 slidein;
          overflow: hidden;
        }

        .details-container.exit {
          height: 0;
          animation: 0.5s 1 slideout;
        }

        @media (max-width: 700px) {
          .amount {
            font-size: 16px;
            min-width: 130px;
          }
          .name {
            font-size: 14px;
          }

          .item {
            padding-left: 30px;
            background-position: 6px center;
          }

          .item > div {
            padding: 8px 2px;
          }
        }
      `}</style>
    </Fragment>
  );
};

export default Row;
