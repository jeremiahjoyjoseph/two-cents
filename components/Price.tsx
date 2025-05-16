import React from 'react';
import { ThemedText } from './ThemedText';

interface PriceProps {
  value?: number | string;
  currency?: string;
  symbolPosition?: 'before' | 'after';
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  style?: any;
  showDecimals?: boolean;
}

const Price: React.FC<PriceProps> = ({
  value = 0,
  currency = 'INR',
  symbolPosition = 'before',
  type = 'default',
  style,
  showDecimals = true,
}) => {
  // Format price based on input type and showDecimals prop
  const formattedPrice =
    typeof value === 'string'
      ? value
      : showDecimals
      ? Number(value).toFixed(2)
      : Number(value).toString();

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
