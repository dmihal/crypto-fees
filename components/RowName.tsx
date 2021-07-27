import React from 'react';

interface RowNameProps {
  name: string;
  shortName?: string;
  subtitle?: string;
}

const RowName: React.FC<RowNameProps> = ({ name, shortName, subtitle }) => {
  return (
    <div className="name">
      <div className={shortName ? 'long-name' : ''}>{name}</div>
      {shortName && <div className="short-name">{shortName}</div>}
      {subtitle && <div className="subtitle">{subtitle}</div>}

      <style jsx>{`
        .name {
          flex: 1;
          padding-left: 32px;
        }
        .short-name {
          display: none;
        }
        .subtitle {
          font-size: 14px;
          color: #616161;
        }

        @media (max-width: 700px) {
          .name {
            font-size: 14px;
            padding: 0;
          }
          .short-name {
            display: block;
          }
          .long-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default RowName;
