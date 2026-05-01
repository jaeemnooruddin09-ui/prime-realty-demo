'use client';
import { useEffect } from 'react';
import { pushRecent } from '@/lib/storage';

export default function RecordView({ propertyId }) {
  useEffect(() => {
    if (propertyId) pushRecent(propertyId);
  }, [propertyId]);
  return null;
}
