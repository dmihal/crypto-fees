import React from 'react';
import Link from 'next/link';
import { ProtocolData } from 'data/types';
import { sortByDaily, sortByWeekly } from 'data/utils';
import Attribute from './Attribute';
import Button from './Button';
import BundleItemRow from './BundleItemRow';

interface DetailsCardProps {
  protocol: ProtocolData;
  sort: string;
  yearly?: boolean;
}

const GITHUB_URL = 'https://github.com/dmihal/crypto-fees/blob/master/data/adapters/';

const DetailsCard: React.FC<DetailsCardProps> = ({ protocol, sort, yearly }) => {
  return (
    <div className="details-card">
      {protocol.bundleData && (
        <div>
          {protocol.bundleData
            .sort(sort === 'weekly' ? sortByWeekly : sortByDaily)
            .map((bundleItem: ProtocolData) => (
              <BundleItemRow item={bundleItem} key={bundleItem.id} yearly={yearly} />
            ))}
        </div>
      )}

      <div className="metadata">
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

        {protocol.tokenTicker && (
          <div className="row">
            <Attribute title="Token">
              <a
                href={`https://www.coingecko.com/en/coins/${protocol.tokenCoingecko}`}
                target="coingecko"
              >
                {protocol.tokenTicker}
              </a>
            </Attribute>

            <Attribute title="Price">
              {protocol.price?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </Attribute>
            <Attribute title="Market Cap">
              {protocol.marketCap?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Attribute>
            <Attribute title="P/S Ratio" tooltip="Based on 7 day average fees, annualized">
              {protocol.psRatio?.toFixed(2)}
            </Attribute>
          </div>
        )}

        <div className="spacer" />

        <div>
          <Link href={`/protocol/${protocol.id}`} passHref>
            <Button>More Details</Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .details-card {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .metadata {
          padding: 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
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
        .spacer {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default DetailsCard;
