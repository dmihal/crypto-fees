import React, { useState } from 'react';
import { FeeData } from 'data/feeData';
import { protocolNames } from '../constants';

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

      {sortedData.map((protocol: FeeData) => (
        <div className={`item ${protocol.category}`} key={protocol.id}>
          <div className="name">{protocolNames[protocol.id]}</div>
          <div className="amount">{protocol.oneDay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <div className="amount">{protocol.sevenDayMA.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
        </div>
      ))}

      <style jsx>{`
        .list {
          border: solid 2px gray;
          border-radius: 8px;
          overflow: hidden;
          margin: 4px;
        }

        .header {
          display: flex;
          padding: 0 4px;
          border-bottom: solid 2px #ccc;
          background: #c6c6c6;
          font-weight: 500;
        }

        .header .amount:hover {
          cursor: pointer;
          background: #eee;
        }

        .item {
          display: flex;
          padding: 0 4px;
          background: #e6efe6;
          font-size: 18px;
        }

        .item.app {
          background: #e3e3f2;
        }

        .item > div, .header > div {
          padding: 10px 4px;
        }

        .name {
          flex: 1;
        }

        .amount {
          min-width: 150px;
          text-align: right;
        }

        @media (max-width: 600px) {
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

          .item > div, .header > div {
            padding: 8px 2px;
          }
        }
      `}</style>
    </div>
  )
}

export default List;
