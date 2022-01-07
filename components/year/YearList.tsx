import { ProtocolData } from 'data/types';
import React, { useState } from 'react';
import YearRow from './YearRow';

interface ListProps {
  data: ProtocolData[];
}

const YearList: React.FC<ListProps> = ({ data }) => {
  const [showAll, setShowAll] = useState(false);
  const sortedData = data
    .sort((a: any, b: any) => b.oneDay - a.oneDay)
    .slice(0, showAll ? undefined : 5);

  return (
    <div className="list">
      <div className="header">
        <div className="name">Name</div>
        <div className="amount">2021 Total Fees</div>
      </div>

      {sortedData.map((protocol: any) => (
        <YearRow protocol={protocol} key={protocol.id} />
      ))}

      {!showAll && (
        <button className="show-all" onClick={() => setShowAll(true)}>
          Show All...
        </button>
      )}

      <style jsx>{`
        .list {
          border: solid 1px lightGray;
          border-radius: 0px;
          overflow: hidden;
          margin: 4px;
          max-width: 600px;
          width: 100%;
        }

        .header {
          display: flex;
          padding: 0 4px;
          border-bottom: solid 1px lightGray;
          background: #eee;
          font-weight: 500;
          padding-left: 10px;
        }

        .header .amount:hover {
          background: #eee;
        }

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

        .item.app {
          background-color: #fad3f6;
        }

        .item > div,
        .header > div {
          padding: 16px 32px;
        }

        .name {
          flex: 1;
        }

        .amount {
          min-width: 200px;
          text-align: right;
        }

        .show-all {
          display: block;
          width: 100%;
          background: #eeeeee;
          border: none;
          padding: 10px;
          color: #666666;
          font-size: 14px;
          cursor: pointer;
        }

        .show-all:hover {
          background: #dddddd;
        }

        @media (max-width: 700px) {
          .header {
            padding-left: 28px;
            padding-right: 30px;
          }
          .header > div {
            font-size: 14px;
          }

          .amount {
            font-size: 16px;
            min-width: 110px;
          }
          .name {
            font-size: 14px;
          }
          .g {
            display: none;
          }

          .item {
            padding-left: 30px;
            padding-right: 0;
            background-position: 6px center;
          }

          .item > div,
          .header > div {
            padding: 8px 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default YearList;
