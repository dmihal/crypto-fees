import { useState, useRef, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import subDays from 'date-fns/subDays';
import isAfter from 'date-fns/isAfter';
import { ArrowLeft } from 'react-feather';
import Attribute from 'components/Attribute';
import Chart, { FeeItem } from 'components/Chart';
import ChartToolbar from 'components/ChartToolbar';
import SocialTags from 'components/SocialTags';
import { getIDs, getBundleIDs, getMetadata, getBundle, ensureListLoaded } from 'data/adapters';
import { Metadata } from 'data/types';
import { getDateRangeData, getMarketData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import _icons from 'components/icons';

const GITHUB_URL = 'https://github.com/dmihal/crypto-fees/blob/master/data/adapters/';

type FeeCache = { [id: string]: { [date: string]: { fee: number } } };

function getMissingDates(data: FeeCache, minDate: Date, maxDate: Date, id: string) {
  const missing = [];
  if (!data[id]) {
    data[id] = {};
  }

  for (let date = minDate; !isAfter(date, maxDate); date = nextDay(date)) {
    const dateStr = formatDate(date);
    if (!data[id][dateStr]) {
      missing.push(dateStr);
    }
  }
  return missing;
}

function getDateWithSmoothing(data: FeeCache, id: string, date: Date, smoothing: number) {
  let fee = data[id][formatDate(date)].fee;

  if (smoothing > 0) {
    for (let i = 1; i <= smoothing; i += 1) {
      fee += data[id][formatDate(subDays(date, i))].fee;
    }
    fee /= smoothing + 1;
  }

  return fee;
}

const sum = (acc: number, num: number) => acc + num;

const dateFloor = (date: Date) => {
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const nextDay = (date: Date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatData(
  data: FeeCache,
  minDate: Date,
  maxDate: Date,
  primaryId: string,
  secondaryId: string | null,
  smoothing: number,
  protocolsByBundle: { [bundleId: string]: string[] }
): FeeItem[] {
  const result = [];
  for (let date = minDate; !isAfter(date, maxDate); date = nextDay(date)) {
    const primary = protocolsByBundle[primaryId]
      ? protocolsByBundle[primaryId]
          .map((id: string) => getDateWithSmoothing(data, id, date, smoothing))
          .reduce(sum, 0)
      : getDateWithSmoothing(data, primaryId, date, smoothing);

    let secondary = 0;
    if (secondaryId) {
      secondary = protocolsByBundle[secondaryId]
        ? protocolsByBundle[secondaryId]
            .map((id: string) => getDateWithSmoothing(data, id, date, smoothing))
            .reduce(sum, 0)
        : getDateWithSmoothing(data, secondaryId, date, smoothing);
    }

    result.push({
      date: date.getTime() / 1000,
      primary,
      secondary,
    });
  }
  return result;
}

function saveFeeData(response: any, storedFees: FeeCache) {
  for (const protocol of response) {
    if (!storedFees[protocol.id]) {
      storedFees[protocol.id] = {};
    }

    for (const { date, ...data } of protocol.data) {
      storedFees[protocol.id][date] = data;
    }
  }
}

const emptyData = ({ start, end }: { start: Date; end: Date }): FeeItem[] => {
  const data = [];
  for (let date = start; !isAfter(date, end); date = nextDay(date)) {
    data.push({ date: date.getTime() / 1000, primary: null, secondary: null });
  }
  return data;
};

const useFees = ({
  initial,
  dateRange,
  primary,
  secondary,
  smoothing,
  protocolsByBundle,
}: {
  initial: FeeCache;
  dateRange: { start: Date; end: Date };
  primary: string;
  secondary: string | null;
  smoothing: number;
  protocolsByBundle: { [id: string]: string[] };
}) => {
  const fees = useRef(initial);

  const [value, setValue] = useState<{ loading: boolean; data: FeeItem[] }>({
    loading: false,
    data: emptyData(dateRange),
  });

  useEffect(() => {
    // We need to fetch extra data if using smoothing
    const actualStartDate = smoothing > 0 ? subDays(dateRange.start, smoothing) : dateRange.start;

    const missing: { [protocol: string]: string[] } = {};

    const getMissing = (id: string) => {
      const missingDates = getMissingDates(fees.current, actualStartDate, dateRange.end, id);
      if (missingDates.length > 0) {
        missing[id] = missingDates;
      }
    };

    if (protocolsByBundle[primary]) {
      protocolsByBundle[primary].map(getMissing);
    } else {
      getMissing(primary);
    }
    if (secondary) {
      if (protocolsByBundle[secondary]) {
        protocolsByBundle[secondary].map(getMissing);
      } else {
        getMissing(secondary);
      }
    }

    const missingArray = Object.entries(missing);
    if (missingArray.length > 0) {
      setValue(({ data }) => ({ data, loading: true }));

      const params = missingArray.map(([id, dates]) => `${id}=${dates.join(',')}`).join('&');

      fetch(`/api/v1/feesByDay?${params}`)
        .then((response: any) => response.json())
        .then((response: any) => {
          if (!response.success) {
            console.error(response);
            setValue(({ data }) => ({ data, loading: false }));
            return;
          }

          saveFeeData(response.data, fees.current);

          setValue({
            loading: false,
            data: formatData(
              fees.current,
              dateRange.start,
              dateRange.end,
              primary,
              secondary,
              smoothing,
              protocolsByBundle
            ),
          });
        });
    } else {
      setValue({
        loading: false,
        data: formatData(
          fees.current,
          dateRange.start,
          dateRange.end,
          primary,
          secondary,
          smoothing,
          protocolsByBundle
        ),
      });
    }
  }, [dateRange, primary, secondary, smoothing]);

  return value;
};

interface ProtocolDetailsProps {
  id: string;
  metadata: Metadata;
  feeCache: any;
  protocols: { [id: string]: string };
  protocolsByBundle: { [id: string]: string[] };
  icons: { [id: string]: string };
  marketData: { marketCap?: number; price?: number; psRatio?: number };
}

export const ProtocolDetails: NextPage<ProtocolDetailsProps> = ({
  id,
  metadata,
  feeCache,
  protocols,
  protocolsByBundle,
  marketData,
  icons,
}) => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    start: dateFloor(subDays(new Date(), 90)),
    end: dateFloor(subDays(new Date(), 1)),
  });
  const [smoothing, setSmoothing] = useState(0);
  const [secondary, setSecondary] = useState<string | null>(null);

  const { loading, data } = useFees({
    initial: feeCache,
    dateRange,
    primary: id,
    secondary,
    smoothing,
    protocolsByBundle,
  });

  const { [id]: filter, ...otherProtocols } = protocols; // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    const { compare, smooth, range } = router.query;
    if (compare || smooth || range) {
      if (compare) {
        setSecondary(compare.toString());
      }
      if (smooth) {
        setSmoothing(parseInt(smooth.toString()) - 1);
      }
      if (range) {
        const [start, end] = range
          .toString()
          .split(',')
          .map((day: string) => new Date(day));
        setDateRange({ start, end });
      }
      router.replace(router.pathname.replace('[id]', id));
    }
  }, [router.query]);

  const icon = icons[id];

  return (
    <main>
      <Head>
        <title key="title">{metadata.name} - CryptoFees.info</title>
      </Head>

      <SocialTags title={metadata.name} image={id} />

      <h1 className="title">CryptoFees.info</h1>
      <div>
        <Link href="/">
          <a>
            <ArrowLeft size={14} /> Back to list
          </a>
        </Link>
      </div>

      <h2 className="subtitle">
        <div className="icon" style={{ backgroundImage: `url('${icon}')` }} />
        <div className="protocol-name">
          <div>{metadata.name}</div>
          {metadata.subtitle && <div className="protocol-subtitle">{metadata.subtitle}</div>}
        </div>
      </h2>

      {metadata.legacy && <div className="legacy">Some historical data may be unavailable</div>}

      <ChartToolbar
        range={dateRange}
        onRangeChange={setDateRange}
        maxDate={subDays(new Date(), 1)}
        smoothing={smoothing}
        onSmoothingChange={setSmoothing}
        protocols={otherProtocols}
        secondary={secondary}
        onSecondaryChange={setSecondary}
        protocolIcons={icons}
      />

      <div className="chart-container">
        <Chart
          data={data}
          loading={loading}
          primary={id}
          secondary={secondary}
          protocols={protocols}
          events={metadata.events}
        />
      </div>

      <p>{metadata.description}</p>

      {metadata.feeDescription && (
        <Attribute title="Fee Model">{metadata.feeDescription}</Attribute>
      )}

      <div className="row">
        {metadata.website && (
          <Attribute title="Website">
            <a href={metadata.website} target="website">
              {metadata.website.replace('https://', '')}
            </a>
          </Attribute>
        )}
        {metadata.blockchain && <Attribute title="Blockchain">{metadata.blockchain}</Attribute>}
        {metadata.source && (
          <Attribute title="Source">
            {metadata.adapter ? (
              <a href={`${GITHUB_URL}${metadata.adapter}.ts`} target="source">
                {metadata.source}
              </a>
            ) : (
              metadata.source
            )}
          </Attribute>
        )}
      </div>

      {metadata.tokenTicker && (
        <div className="row">
          <Attribute title="Token">
            <a
              href={`https://www.coingecko.com/en/coins/${metadata.tokenCoingecko}`}
              target="coingecko"
            >
              {metadata.tokenTicker}
            </a>
          </Attribute>

          <Attribute title="Price">
            {marketData.price?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </Attribute>
          <Attribute title="Market Cap">
            {marketData.marketCap?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Attribute>
          <Attribute title="P/S Ratio" tooltip="Based on 7 day average fees, annualized">
            {marketData.psRatio?.toFixed(2)}
          </Attribute>
        </div>
      )}

      <style jsx>{`
        main {
          margin-bottom: 18px;
          width: 100%;
          max-width: 800px;
        }
        .title {
          margin: 10px 0 4px;
          font-weight: 700;
        }
        .chart-container {
          padding: 14px;
          background: #ffffff;
          border-radius: 8px;
          margin: 6px 0;
          border: solid 1px #d0d1d9;
        }
        .row {
          display: flex;
        }
        .row > :global(div) {
          flex: 1;
        }
        h2 {
          display: flex;
          align-items: center;
          font-weight: 700;
        }
        .protocol-name {
          display: flex;
          flex-direction: column;
        }
        .protocol-subtitle {
          font-size: 14px;
          color: #616161;
          font-weight: 400;
        }

        .icon {
          height: 24px;
          width: 24px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          margin-right: 8px;
        }
        .legacy {
          font-size: 12px;
          color: #666;
          margin: 4px 0;
          padding: 6px;
          background: #f3e8d4;
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
};

export default ProtocolDetails;

export const getStaticProps: GetStaticProps<ProtocolDetailsProps> = async ({ params }) => {
  await ensureListLoaded();

  const ids = getIDs().sort();
  const bundleIds = getBundleIDs().sort();
  const protocolsByBundle: { [id: string]: string[] } = {};
  const protocols: { [id: string]: string } = {};
  const icons: { [id: string]: string } = {};

  const feeCache: { [id: string]: { [date: string]: any } } = {};

  for (const id of ids) {
    const metadata = getMetadata(id);
    protocols[id] = metadata.subtitle ? `${metadata.name} (${metadata.subtitle})` : metadata.name;
    icons[id] = metadata.icon || _icons[id];

    if (metadata.bundle) {
      protocolsByBundle[metadata.bundle] = [...(protocolsByBundle[metadata.bundle] || []), id];
    }
  }

  const id = params.id.toString();
  const yesterday = formatDate(subDays(new Date(), 1));

  const getFeesByDate = async (id: string) => {
    const feesArray = await getDateRangeData(id, subDays(new Date(), 90), subDays(new Date(), 1));
    const feesByDate: { [date: string]: any } = {};
    for (const { date, ...data } of feesArray) {
      feesByDate[date] = data;
    }
    return feesByDate;
  };

  let marketData: any;
  let metadata: Metadata;

  if (protocols[id]) {
    // The page is a single protocol
    const fees = await getFeesByDate(id);
    feeCache[id] = fees;
    const sevenDayMA =
      Object.values(fees)
        .slice(-7)
        .reduce((acc: number, day: any) => acc + day.fee, 0) / 7;

    marketData = await getMarketData(id, sevenDayMA, yesterday);
    metadata = getMetadata(id);
  } else if (protocolsByBundle[id]) {
    // The page is a bundle
    let sevenDayMA = 0;
    await Promise.all(
      protocolsByBundle[id].map(async (protocolId: string) => {
        const fees = await getFeesByDate(protocolId);
        feeCache[protocolId] = fees;
        sevenDayMA +=
          Object.values(fees)
            .slice(-7)
            .reduce((acc: number, day: any) => acc + day.fee, 0) / 7;
      })
    );

    marketData = await getMarketData(protocolsByBundle[id][0], sevenDayMA, yesterday);
    metadata = getBundle(id);
  } else {
    throw new Error(`Unknown protocol ${id}`);
  }

  // Do this at the end of the function so that the `protocols` var can be used for checking if an
  // ID is a protocol or bundle in the `if (protocols[id])` statement.
  for (const bundleId of bundleIds) {
    const metadata = getBundle(bundleId);
    protocols[bundleId] = metadata.name;
    icons[bundleId] = metadata.icon;
  }

  return {
    props: {
      id,
      protocolsByBundle,
      metadata,
      feeCache,
      protocols,
      icons,
      marketData,
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  await ensureListLoaded();

  return {
    paths: [
      ...getIDs().map((id: string) => ({ params: { id } })),
      ...getBundleIDs().map((id: string) => ({ params: { id } })),
    ],
    fallback: false,
  };
};
