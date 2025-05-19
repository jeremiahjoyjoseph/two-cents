import { format } from 'date-fns';
import React from 'react';
import { ThemedText } from './ThemedText';

interface DateDisplayProps {
  date: string | Date;
  format?: string; // Optional custom format
}

const BASE_FORMAT = 'MMM dd, yyyy';

export const DateDisplay: React.FC<DateDisplayProps> = ({ date, format: fmt }) => {
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  const display = format(dateObj, fmt || BASE_FORMAT);
  return <ThemedText type="subtitle">{display}</ThemedText>;
};

export default DateDisplay;
