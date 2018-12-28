import isNil from 'lodash/isNil';
import format from 'date-fns/format';

export const getFirstAndLastDayOfYear = (
  year: number,
  dateFormat?: string,
): { firstDay: string; lastDay: string } => {
  const firstDayOfYear = new Date(year, 0, 1, 0, 0, 0);
  const lastDayOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const formatDate = (date: Date) =>
    isNil(dateFormat) ? date.toISOString() : format(date, dateFormat);

  return {
    firstDay: formatDate(firstDayOfYear),
    lastDay: formatDate(lastDayOfYear),
  };
};
