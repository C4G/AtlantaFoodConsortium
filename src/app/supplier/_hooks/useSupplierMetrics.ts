'use client';
import { useState, useCallback } from 'react';
import { SupplierMetrics } from '../_types';

const useSupplierMetrics = () => {
  const [metricsData, setMetricsData] = useState<SupplierMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const refreshMetrics = useCallback(async (supplierId: string) => {
    try {
      const metricsRes = await fetch(
        `/api/analytics/supplier-metrics?supplierId=${supplierId}`
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

export { useSupplierMetrics };
