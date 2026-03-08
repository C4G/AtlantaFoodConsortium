'use client';
import { useState, useCallback } from 'react';
import { Nonprofit, ProductInterest, ProductRequest } from '../_types';

interface UseNonprofitDataOptions {
  refreshMetrics: (_nonprofitId: string) => Promise<void>;
  setLoadingMetrics: (_loading: boolean) => void;
}

const useNonprofitData = ({
  refreshMetrics,
  setLoadingMetrics,
}: UseNonprofitDataOptions) => {
  const [nonprofit, setNonprofit] = useState<Nonprofit | null>(null);
  const [productInterests, setProductInterests] =
    useState<ProductInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState<ProductRequest[]>(
    []
  );

  const fetchData = useCallback(
    async (nonprofitId?: string, productSurveyId?: string) => {
      try {
        if (!nonprofitId) throw new Error('No nonprofit ID found');

        const nonprofitResponse = await fetch(
          `/api/nonprofits?nonprofitId=${nonprofitId}`
        );
        if (!nonprofitResponse.ok) {
          throw new Error('Failed to fetch nonprofit data');
        }
        const nonprofitData = await nonprofitResponse.json();
        setNonprofit(nonprofitData);

        if (productSurveyId) {
          const interestsResponse = await fetch(
            `/api/non-profit-interests?productSurveyId=${productSurveyId}`
          );
          if (!interestsResponse.ok) {
            throw new Error('Failed to fetch nonprofit interests');
          }
          const interestsData = await interestsResponse.json();
          setProductInterests(interestsData);
        }

        const productsResponse = await fetch(
          '/api/item-availability?status=AVAILABLE'
        );
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch available products');
        }
        const productsData = await productsResponse.json();
        setAvailableProducts(productsData);

        await refreshMetrics(nonprofitId);
        setLoadingMetrics(false);
      } catch (error) {
        console.error('Error:', error);
        setNonprofit(null);
        setLoadingMetrics(false);
      } finally {
        setLoading(false);
      }
    },
    [refreshMetrics, setLoadingMetrics]
  );

  const loadData = useCallback(
    async (nonprofitId?: string, productSurveyId?: string) => {
      await fetchData(nonprofitId, productSurveyId);
    },
    [fetchData]
  );

  const handleDocumentReupload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/nonprofit-documents', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      setNonprofit((prev) =>
        prev ? { ...prev, nonprofitDocumentApproval: null } : null
      );

      alert('Document uploaded successfully. Pending approval.');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to upload document. Please try again.'
      );
    }
  };

  return {
    nonprofit,
    setNonprofit,
    productInterests,
    loading,
    availableProducts,
    setAvailableProducts,
    loadData,
    handleDocumentReupload,
  };
};

export { useNonprofitData };
