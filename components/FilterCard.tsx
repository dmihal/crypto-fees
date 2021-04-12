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

const allChains: Item[] = [
  { name: 'Ethereum', id: 'Ethereum' },
  { name: 'xDai', id: 'xDai' },
  { name: 'Polygon', id: 'Polygon' },
  { name: 'Other', id: 'other' },
];

export interface Filters {
  categories?: string[];
  chains?: string[];
}

interface FilterCardProps {
  open: boolean;
  // onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const FilterCard: React.FC<FilterCardProps> = ({ open, /*onClose,*/ filters, onFilterChange }) => {
  return (
    <Fragment>
      <CSSTransition in={open} transitionName="example" timeout={500} unmountOnExit>
        <div className="filers-card">
          <div className="column">
            <div className="title">Categories</div>
            <ToggleList
              items={allCategories}
              selected={filters.categories}
              onSelectedChanged={(categories: string[]) =>
                onFilterChange({ ...filters, categories })
              }
            />
          </div>

          <div className="column">
            <div className="title">Blockchain</div>
            <ToggleList
              items={allChains}
              selected={filters.chains}
              onSelectedChanged={(chains: string[]) => onFilterChange({ ...filters, chains })}
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

        .title {
          font-size: 12px;
          font-weight: 700;
          padding: 4px;
        }

        .column {
          flex: 1;
          padding: 8px;
        }

        .filers-card {
          height: 200px;
          animation: 0.5s 1 filter-slidein;
          overflow: hidden;
          display: flex;
          width: 100%;
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
