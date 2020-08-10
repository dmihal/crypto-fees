import React from 'react';
import { FeeData } from 'data/feeData';
import { protocolNames } from '../constants';

interface ListProps {
  data: FeeData[];
  sort: string;
  setSort: (newSort: string) => void;
}

const List: React.FC<ListProps> = ({ data, sort, setSort }) => {
  return (
    <div className="list">
      <div className="header">
        <div className="name">Name</div>
        <div className="amount">1 Day Fees</div>
        <div className="amount">7 Day Avg. Fees</div>
      </div>

      {data.map((protocol: FeeData) => (
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
        }

        .header {
          display: flex;
          padding: 10px 4px;
          border-bottom: solid 2px #ccc;
        }

        .item {
          display: flex;
          padding: 10px 4px;
          background: #c5dac5;
        }

        .item.app {
          background: #c7c7e6;
        }

        .item > div, .header > div {
          padding: 4px;
        }

        .name {
          flex: 1;
        }

        .amount {
          min-width: 140px;
          text-align: right;
        }
      `}</style>
    </div>
  )
}

export default List;
