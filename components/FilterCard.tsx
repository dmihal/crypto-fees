import React, { Fragment } from 'react';
import { CSSTransition } from 'react-transition-group';
import ToggleList, { Item } from './ToggleList';

interface Category {
  name: string;
  id: string;
}

const allCategories: Item[] = [
  { name: 'Layer 1', id: 'l1' },
  { name: 'Decentralized Exchange', id: 'dex' },
  { name: 'Lending', id: 'lending' },
  { name: 'Cross-Chain', id: 'xchain' },
  { name: 'Other', id: 'other' },
];

export interface Filters {
  categories?: string[];
  chains?: string[];
}

interface FilterCardProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const FilterCard: React.FC<FilterCardProps> = ({ open, onClose, filters, onFilterChange }) => {
  return (
    <Fragment>
      <CSSTransition in={open} transitionName="example" timeout={500} unmountOnExit>
        <div className="filers-card">
          <button onClick={onClose}>Close</button>

          <div>
            <div>Categories</div>
            <ToggleList
              items={allCategories}
              selected={filters.categories}
              onSelectedChanged={(categories: string[]) =>
                onFilterChange({ ...filters, categories })
              }
            />
          </div>
        </div>
      </CSSTransition>

      <style jsx>{`
        @keyframes filter-slidein {
          from {
            height: 0px;
          }

          to {
            height: 200px;
          }
        }

        @keyframes filter-slideout {
          from {
            height: 200px;
          }

          to {
            height: 0px;
          }
        }

        .filers-card {
          height: 200px;
          animation: 0.5s 1 filter-slidein;
          overflow: hidden;
        }

        .filers-card.exit {
          height: 0;
          animation: 0.5s 1 filter-slideout;
        }
      `}</style>
    </Fragment>
  );
};

export default FilterCard;
