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
    <ul>
      {items.map((item: Item) => {
        const isSelected = _selected.indexOf(item.id) !== -1;
        const toggle = isSelected
          ? () => onSelectedChanged(_selected.filter((_id: string) => _id !== item.id))
          : () => onSelectedChanged([..._selected, item.id]);

        return (
          <li key={item.id} onClick={toggle}>
            {isSelected && 'x '}
            {item.name}
          </li>
        );
      })}
    </ul>
  );
};

export default ToggleList;
