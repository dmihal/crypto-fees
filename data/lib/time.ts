import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import subHours from 'date-fns/subHours';

// returns timestamp for start of the day
export function dateToTimestamp(date: string | Date) {
  const _date = (date as string).length ? new Date(date) : (date as Date);
  return Math.floor(_date.getTime() / 1000 / 86400) * 86400;
}

export function formatDate(date: Date, connector = '-') {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return [date.getUTCFullYear(), pad(date.getUTCMonth() + 1), pad(date.getUTCDate())].join(
    connector
  );
}

export function getYesterdayDate() {
  const date = subDays(new Date(), 1);
  return formatDate(date);
}

export const last7Days = (date?: Date) => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const _date = subDays(date || subHours(new Date(), 2), 7 - i);
    dates.push(formatDate(_date));
  }
  return dates;
};

export function isBefore(date?: string, comparrison?: string) {
  if (!date) {
    return true;
  }
  const _comparrison = comparrison || formatDate(new Date());
  return new Date(date) < new Date(_comparrison);
}

export function getDateRange(dateStart: string | Date, dateEnd: string | Date) {
  const _dateStart = dateStart instanceof Date ? dateStart : new Date(dateStart);
  const _dateEnd = dateEnd instanceof Date ? dateEnd : new Date(dateEnd);

  const days = [];
  for (let date = _dateStart; date <= _dateEnd; date = addDays(date, 1)) {
    days.push(formatDate(date));
  }

  return days;
}

export function offsetDaysFormatted(date: string, numDays: number) {
  return formatDate(addDays(new Date(date), numDays));
}
