import React from 'react';

export interface Item {
  name: string;
  id: string;
}

interface ToggleListProps {
  items: Item[];
  selected?: string[];
  onSelectedChanged: (newSelected?: string[]) => void;
}

const ToggleList: React.FC<ToggleListProps> = ({ items, selected, onSelectedChanged }) => {
  const _selected = selected || items.map((item: Item) => item.id);

  return (
    <ul className="list">
      {items.map((item: Item) => {
        const isSelected = !selected || _selected.indexOf(item.id) !== -1;

        let toggle;

        if (isSelected && !selected) {
          toggle = () => onSelectedChanged([item.id]);
        } else if (isSelected && selected.length === 1) {
          toggle = () => onSelectedChanged(undefined);
        } else if (isSelected) {
          toggle = () => onSelectedChanged(_selected.filter((_id: string) => _id !== item.id));
        } else {
          // add filter
          toggle = () => onSelectedChanged([..._selected, item.id]);
        }

        return (
          <li className={`item ${isSelected ? 'selected' : ''}`} key={item.id} onClick={toggle}>
            {item.name}
          </li>
        );
      })}

      <style jsx>{`
        .list {
          margin: 0;
          padding: 0;
        }

        .item {
          list-style: none;
          padding: 3px 10px 2px;
          border-radius: 3px;
          border: solid 1px #d0d1d9;
          background: transparent;
          font-size: 14px;
          color: #b0b4bf;
          height: 30px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item:hover {
          background: #f5f5f5;
        }

        .item:before {
          content: '✓';
          display: inline-block;
          margin-right: 8px;
        }

        .item.selected {
          color: #091636;
          background: #ffffff;
        }
        .item.selected:before {
          content: '✓';
        }
      `}</style>
    </ul>
  );
};

export default ToggleList;
