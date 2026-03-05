import { useState, useCallback } from 'react';
import { AnalyticsData } from '../_types';

const useAdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [
        distributionRes,
        trendsRes,
        supplierActivityRes,
        nonprofitEngagementRes,
        systemHealthRes,
        claimsOverTimeRes,
      ] = await Promise.all([
        fetch('/api/analytics/product-distribution'),
        fetch('/api/analytics/product-status-trends'),
        fetch('/api/analytics/supplier-activity'),
        fetch('/api/analytics/nonprofit-engagement'),
        fetch('/api/analytics/system-health'),
        fetch('/api/analytics/claims-over-time'),
      ]);

      const [
        distribution,
        trends,
        supplierActivity,
        nonprofitEngagement,
        systemHealth,
        claimsOverTime,
      ] = await Promise.all([
        distributionRes.json(),
        trendsRes.json(),
        supplierActivityRes.json(),
        nonprofitEngagementRes.json(),
        systemHealthRes.json(),
        claimsOverTimeRes.json(),
      ]);

      setAnalyticsData({
        distribution,
        trends,
        supplierActivity,
        nonprofitEngagement,
        systemHealth,
        claimsOverTime,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyticsData, loading, fetchAnalytics };
};

export { useAdminAnalytics };
