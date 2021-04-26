import { useState, useRef, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import DatePicker from 'react-datepicker';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import isAfter from 'date-fns/isAfter';
import Chart from 'components/Chart';
import { getIDs, getMetadata } from 'data/adapters';
import { getDateRangeData } from 'data/queries';
import { formatDate } from 'data/lib/time';

function getMissing(data: any, minDate: string, maxDate: string, id: string) {
  const missing = [];
  if (!data[id]) {
    data[id] = {};
  }

  for (let date = new Date(minDate); !isAfter(date, new Date(maxDate)); date = addDays(date, 1)) {
    const dateStr = formatDate(date);
    if (!data[id][dateStr]) {
      missing.push(dateStr);
    }
  }
  return missing;
}

function getDateWithSmoothing(data: any, id: string, date: Date, smoothing: number) {
  let fee = data[id][formatDate(date)].fee;

  if (smoothing > 0) {
    for (let i = 1; i <= smoothing; i += 1) {
      fee += data[id][formatDate(subDays(date, i))].fee;
    }
    fee /= smoothing + 1;
  }

  return fee;
}

function formatData(
  data: any,
  minDate: string,
  maxDate: string,
  primaryId: string,
  secondaryId: string | null,
  smoothing: number
) {
  const result = [];
  for (let date = new Date(minDate); !isAfter(date, new Date(maxDate)); date = addDays(date, 1)) {
    const primary = getDateWithSmoothing(data, primaryId, date, smoothing);
    const secondary = secondaryId ? getDateWithSmoothing(data, secondaryId, date, smoothing) : 0;

    result.push({
      date: date.getTime() / 1000,
      primary,
      secondary,
    });
  }
  return result;
}

function saveFeeData(response: any, storedFees: any) {
  for (const protocol of response) {
    if (!storedFees[protocol.id]) {
      storedFees[protocol.id] = {};
    }

    for (const { date, ...data } of protocol.data) {
      storedFees[protocol.id][date] = data;
    }
  }
}

const useFees = (
  initial: any,
  minDate: string,
  maxDate: string,
  primary: string,
  secondary: string | null,
  smoothing: number
) => {
  const fees = useRef(initial);

  const [value, setValue] = useState({
    loading: false,
    data: [],
  });

  useEffect(() => {
    // We need to fetch extra data if using smoothing
    const actualMinDate =
      smoothing > 0 ? formatDate(subDays(new Date(minDate), smoothing)) : minDate;

    const missingPrimary = getMissing(fees.current, actualMinDate, maxDate, primary);
    const missingSecondary = secondary
      ? getMissing(fees.current, actualMinDate, maxDate, secondary)
      : [];

    if (missingPrimary.length > 0 || missingSecondary.length > 0) {
      setValue(({ data }) => ({ data, loading: true }));

      const secondaryQuery =
        missingSecondary.length > 0 ? `&${secondary}=${missingSecondary.join(',')}` : '';
      fetch(`/api/v1/feesByDay?${primary}=${missingPrimary.join(',')}&${secondaryQuery}`)
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
            data: formatData(fees.current, minDate, maxDate, primary, secondary, smoothing),
          });
        });
    } else {
      setValue({
        loading: false,
        data: formatData(fees.current, minDate, maxDate, primary, secondary, smoothing),
      });
    }
  }, [minDate, maxDate, primary, secondary, smoothing]);

  return value;
};

interface ProtocolDetailsProps {
  id: string;
  metadata: any;
  feeCache: any;
  protocols: string[];
}

export const ProtocolDetails: NextPage<ProtocolDetailsProps> = ({
  id,
  metadata,
  feeCache,
  protocols,
}) => {
  const [minDate, setMinDate] = useState(formatDate(subDays(new Date(), 90)));
  const [maxDate, setMaxDate] = useState(formatDate(subDays(new Date(), 1)));
  const [smoothing, setSmoothing] = useState(0);
  const [secondary, setSecondary] = useState<string | null>(null);

  const { loading, data } = useFees(feeCache, minDate, maxDate, id, secondary, smoothing);

  return (
    <main>
      <h1 className="title">CryptoFees.info</h1>
      <h2 className="subtitle">{metadata.name}</h2>

      <Chart data={data} loading={loading} primary={id} secondary={secondary} />

      <div className="toolbar">
        <div className="toolbar-col">
          <DatePicker
            selected={new Date(minDate)}
            onChange={(newDate: any) => setMinDate(formatDate(newDate))}
            maxDate={subDays(new Date(), 1)}
            popperPlacement="bottom-end"
          />
          <div>From</div>
        </div>
        <div className="toolbar-col">
          <DatePicker
            selected={new Date(maxDate)}
            onChange={(newDate: any) => setMaxDate(formatDate(newDate))}
            maxDate={subDays(new Date(), 1)}
            popperPlacement="bottom-end"
          />
          <div>To</div>
        </div>

        <div className="toolbar-col">
          <select value={smoothing} onChange={(e: any) => setSmoothing(parseInt(e.target.value))}>
            <option value={0}>None</option>
            <option value={2}>3 Days</option>
            <option value={6}>7 Days</option>
          </select>
          <div>Smoothing</div>
        </div>

        <div className="toolbar-col">
          <select
            value={secondary || 'None'}
            onChange={(e: any) => setSecondary(e.target.value === 'None' ? null : e.target.value)}
          >
            <option>None</option>
            {protocols.map((id: string) => (
              <option key={id}>{id}</option>
            ))}
          </select>
          <div>Compare</div>
        </div>
      </div>

      <p>{metadata.description}</p>
      <p>{metadata.feeDescription}</p>

      <style jsx>{`
        .toolbar {
          display: flex;
          margin: 8px 0;
        }
        .toolbar-col {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
      `}</style>
    </main>
  );
};

export default ProtocolDetails;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params.id.toString();
  const defaultFeesArray = await getDateRangeData(
    id,
    subDays(new Date(), 90),
    subDays(new Date(), 1)
  );
  const defaultFees: { [date: string]: any } = {};
  for (const { date, ...data } of defaultFeesArray) {
    defaultFees[date] = data;
  }

  return {
    props: {
      id,
      metadata: getMetadata(id),
      feeCache: {
        [id]: defaultFees,
      },
      protocols: getIDs(),
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getIDs().map((id: string) => ({ params: { id } })),
    fallback: false,
  };
};
