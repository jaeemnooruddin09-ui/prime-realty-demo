'use client';
import { useLocale } from './LocaleProvider';

export default function Price({ amount, listingType = 'buy', className = '' }) {
  const { formatPrice } = useLocale();
  return <span className={className}>{formatPrice(amount, listingType)}</span>;
}
