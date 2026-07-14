import { useMemo } from 'react';
import dayjs from 'dayjs';

export function useLocalizedDate() {
  const formatDate = useMemo(() => {
    return (date: string | Date | null | undefined, format = 'YYYY/MM/DD'): string => {
      if (!date) return '';
      return dayjs(date).format(format);
    };
  }, []);

  const formatTime = useMemo(() => {
    return (date: string | Date | null | undefined, format = 'HH:mm'): string => {
      if (!date) return '';
      return dayjs(date).format(format);
    };
  }, []);

  const formatDateTime = useMemo(() => {
    return (date: string | Date | null | undefined, format = 'YYYY/MM/DD HH:mm'): string => {
      if (!date) return '';
      return dayjs(date).format(format);
    };
  }, []);

  return {
    formatDate,
    formatTime,
    formatDateTime,
  };
}

