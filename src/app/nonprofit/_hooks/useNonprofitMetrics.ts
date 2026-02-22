'use client';
import { useState, useCallback } from 'react';
import { NonprofitMetrics } from '../_types';

const useNonprofitMetrics = () => {
  const [metricsData, setMetricsData] = useState<NonprofitMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const refreshMetrics = useCallback(async (nonprofitId: string) => {
    try {
      const metricsRes = await fetch(
        `/api/analytics/nonprofit-metrics?nonprofitId=${nonprofitId}`
      );
      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setMetricsData(metrics);
      }
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    }
  }, []);

  return { metricsData, loadingMetrics, setLoadingMetrics, refreshMetrics };
};

export { useNonprofitMetrics };
