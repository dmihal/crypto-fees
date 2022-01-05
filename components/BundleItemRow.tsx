import React, { Fragment } from 'react';
import Link from 'next/link';
import { ProtocolData } from 'data/types';
import { ChevronRight } from 'react-feather';

interface BundleItemRowProps {
  item: ProtocolData;
  yearly?: boolean;
}

const BundleItemRow: React.FC<BundleItemRowProps> = ({ item, yearly }) => {
  return (
    <Fragment>
      <Link href={`/protocol/${item.id}`}>
        <a
          className="bundle-item"
          style={{
            backgroundImage: item.icon ? `url('${item.icon}')` : undefined,
          }}
        >
          <div className="name">{item.subtitle}</div>
          <div className="amount">
            {item.oneDay?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </div>
          {!yearly && (
            <div className="amount">
              {item.sevenDayMA?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </div>
          )}
          <div className="arrow">
            <ChevronRight />
          </div>
        </a>
      </Link>
      <style jsx>{`
        .bundle-item {
          display: flex;
          background-repeat: no-repeat;
          background-position: 10px center;
          background-size: 20px 20px;
          padding: 4px;
          text-decoration: none;
          background-color: #eee;
        }
        .bundle-item:hover {
          background-color: #dddddd;
        }
        .name {
          padding-left: 32px;
          flex: 1;
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

export default BundleItemRow;
