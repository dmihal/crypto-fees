import React, { useState } from 'react';
import { FeeData } from 'data/feeData';
import Row from './Row';

interface ListProps {
  data: FeeData[];
}

const sortByDaily = (a: FeeData, b: FeeData) => b.oneDay - a.oneDay;
const sortByWeekly = (a: FeeData, b: FeeData) => b.sevenDayMA - a.sevenDayMA;

const List: React.FC<ListProps> = ({ data }) => {
  const [sort, setSort] = useState('daily');

  const sortedData = data.sort(sort === 'weekly' ? sortByWeekly : sortByDaily);

  return (
    <div className="list">
      <div className="header">
        <div className="name">Name</div>
        <div className="amount" onClick={() => setSort('daily')}>
          {sort === 'daily' && '▼'} 1 Day Fees
        </div>
        <div className="amount" onClick={() => setSort('weekly')}>
          {sort === 'weekly' && '▼'} 7 Day Avg. Fees
        </div>
      </div>

      {sortedData.map((protocol: FeeData) => <Row protocol={protocol} key={protocol.id} />)}

      <style jsx>{`
        .list {
          border: solid 1px lightGray;
          border-radius: 0px;
          overflow: hidden;
          margin: 4px;
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
          cursor: pointer;
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
          min-width: 250px;
          text-align: right;
        }

        @media (max-width: 700px) {
          .header {
            padding-left: 30px;
          }
          .header > div {
            font-size: 14px;
          }

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

          .item > div,
          .header > div {
            padding: 8px 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default List;
