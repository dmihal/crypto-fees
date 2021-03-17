import React from 'react';
import { FeeData } from 'data/adapters/feeData';
import Attribute from './Attribute';

interface DetailsCardProps {
  protocol: FeeData;
}

const GITHUB_URL = 'https://github.com/dmihal/crypto-fees/blob/master/data/adapters/';

const DetailsCard: React.FC<DetailsCardProps> = ({ protocol }) => {
  return (
    <div className="details-card">
      {protocol.description && <div className="description">{protocol.description}</div>}
      {protocol.feeDescription && (
        <Attribute title="Fee Model">{protocol.feeDescription}</Attribute>
      )}

      <div className="row">
        {protocol.website && (
          <Attribute title="Website">
            <a href={protocol.website} target="website">
              {protocol.website.replace('https://', '')}
            </a>
          </Attribute>
        )}
        {protocol.blockchain && <Attribute title="Blockchain">{protocol.blockchain}</Attribute>}
        {protocol.source && (
          <Attribute title="Source">
            {protocol.adapter ? (
              <a href={`${GITHUB_URL}${protocol.adapter}.ts`} target="source">
                {protocol.source}
              </a>
            ) : (
              protocol.source
            )}
          </Attribute>
        )}
      </div>

      <style jsx>{`
        .details-card {
          padding: 8px;
        }
        .description {
          margin: 4px 0;
        }
        .row {
          display: flex;
        }
        .row > :global(div) {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default DetailsCard;
