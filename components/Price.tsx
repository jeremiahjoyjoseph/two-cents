import React from 'react';
import { ThemedText } from './ThemedText';

interface PriceProps {
  value?: number | string;
  currency?: string;
  symbolPosition?: 'before' | 'after';
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  style?: any;
}

const Price: React.FC<PriceProps> = ({
  value = 0,
  currency = 'INR',
  symbolPosition = 'before',
  type = 'default',
  style,
}) => {
  // Convert value to number and format to 2 decimal places
  const formattedPrice = Number(value).toFixed(2);

  const renderPrice = () => {
    if (symbolPosition === 'before') {
      return (
        <ThemedText type={type} style={style}>
          {currency} {formattedPrice}
        </ThemedText>
      );
    }
    return (
      <ThemedText type={type} style={style}>
        {formattedPrice} {currency}
      </ThemedText>
    );
  };

  return renderPrice();
};

export default Price;
