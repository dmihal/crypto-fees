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

function formatData(
  data: any,
  minDate: string,
  maxDate: string,
  primary: string,
  secondary?: string | null
) {
  const result = [];
  for (let date = new Date(minDate); !isAfter(date, new Date(maxDate)); date = addDays(date, 1)) {
    const dateStr = formatDate(date);
    result.push({
      date: date.getTime() / 1000,
      primary: data[primary][dateStr].fee,
      secondary: secondary ? data[secondary][dateStr].fee : 0,
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
  secondary?: string | null
) => {
  const fees = useRef(initial);

  const [value, setValue] = useState({
    loading: false,
    data: [],
  });

  useEffect(() => {
    const missingPrimary = getMissing(fees.current, minDate, maxDate, primary);
    const missingSecondary = secondary ? getMissing(fees.current, minDate, maxDate, secondary) : [];

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
            data: formatData(fees.current, minDate, maxDate, primary, secondary),
          });
        });
    } else {
      setValue({
        loading: false,
        data: formatData(fees.current, minDate, maxDate, primary, secondary),
      });
    }
  }, [minDate, maxDate, primary, secondary]);

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
  // const filteredData = feeCache[id].map((day: any) => ({
  //   date: new Date(day.date).getTime() / 1000,
  //   fee: day.fee,
  // }));
  const [minDate, setMinDate] = useState(formatDate(subDays(new Date(), 90)));
  const [maxDate, setMaxDate] = useState(formatDate(subDays(new Date(), 1)));
  const [secondary, setSecondary] = useState<string | null>(null);

  const { loading, data } = useFees(feeCache, minDate, maxDate, id, secondary);

  return (
    <main>
      <h1 className="title">CryptoFees.info</h1>
      <h2 className="subtitle">{metadata.name}</h2>

      <Chart data={data} loading={loading} primary={id} secondary={secondary} />

      <div>
        <select
          value={secondary || 'None'}
          onChange={(e: any) => setSecondary(e.target.value === 'None' ? null : e.target.value)}
        >
          <option>None</option>
          {protocols.map((id: string) => (
            <option key={id}>{id}</option>
          ))}
        </select>

        <DatePicker
          selected={new Date(minDate)}
          onChange={(newDate: any) => setMinDate(formatDate(newDate))}
          maxDate={subDays(new Date(), 1)}
          popperPlacement="bottom-end"
        />
        <DatePicker
          selected={new Date(maxDate)}
          onChange={(newDate: any) => setMaxDate(formatDate(newDate))}
          maxDate={subDays(new Date(), 1)}
          popperPlacement="bottom-end"
        />
      </div>

      <p>{metadata.description}</p>
      <p>{metadata.feeDescription}</p>
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
