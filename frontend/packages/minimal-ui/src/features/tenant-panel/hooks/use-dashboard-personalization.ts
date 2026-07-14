'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  DashboardPageRef,
  DashboardPageVisit,
  MAX_DASHBOARD_PINS,
  readDashboardHistory,
  readDashboardPins,
  writeDashboardPins,
} from '../utils/dashboard-personalization';

export function useDashboardPersonalization(base: string) {
  const [pins, setPins] = useState<DashboardPageRef[]>([]);
  const [history, setHistory] = useState<DashboardPageVisit[]>([]);

  const refresh = useCallback(() => {
    setPins(readDashboardPins(base));
    setHistory(readDashboardHistory(base));
  }, [base]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('tenant-dashboard-history-updated', handler);
    window.addEventListener('tenant-dashboard-pins-updated', handler);
    return () => {
      window.removeEventListener('tenant-dashboard-history-updated', handler);
      window.removeEventListener('tenant-dashboard-pins-updated', handler);
    };
  }, [refresh]);

  const addPin = useCallback(
    (page: DashboardPageRef) => {
      const current = readDashboardPins(base);
      if (current.some((p) => p.id === page.id)) return;
      const next = [...current, page].slice(0, MAX_DASHBOARD_PINS);
      writeDashboardPins(base, next);
      setPins(next);
      window.dispatchEvent(new CustomEvent('tenant-dashboard-pins-updated'));
    },
    [base]
  );

  const removePin = useCallback(
    (pageId: string) => {
      const next = readDashboardPins(base).filter((p) => p.id !== pageId);
      writeDashboardPins(base, next);
      setPins(next);
      window.dispatchEvent(new CustomEvent('tenant-dashboard-pins-updated'));
    },
    [base]
  );

  const isPinned = useCallback(
    (pageId: string) => pins.some((p) => p.id === pageId),
    [pins]
  );

  return { pins, history, addPin, removePin, isPinned, refresh };
}
