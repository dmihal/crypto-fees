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
        const isSelected = _selected.indexOf(item.id) !== -1;
        const toggle = isSelected
          ? () => onSelectedChanged(_selected.filter((_id: string) => _id !== item.id))
          : () =>
              onSelectedChanged(
                _selected.length === items.length - 1 ? undefined : [..._selected, item.id]
              );

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
        }

        .item.selected {
          color: #091636;
          background: #ffffff;
        }
      `}</style>
    </ul>
  );
};

export default ToggleList;
