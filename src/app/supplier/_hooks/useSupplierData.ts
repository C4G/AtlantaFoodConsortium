'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { ProductRequest, Supplier, ProductType } from '../../../../types/types';
import { SupplierRowData } from '../_types';

interface UseSupplierDataOptions {
  refreshMetrics: (_supplierId: string) => Promise<void>;
  setLoadingMetrics: (_loading: boolean) => void;
}

const useSupplierData = ({
  refreshMetrics,
  setLoadingMetrics,
}: UseSupplierDataOptions) => {
  const [supplierDetails, setSupplierDetails] = useState<Supplier | null>(null);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [rowData, setRowData] = useState<SupplierRowData[]>([]);

  const findFoodType = (productType: ProductType): string => {
    if (productType.protein) return 'PROTEIN';
    if (productType.produce) return 'PRODUCE';
    if (productType.shelfStable) return 'SHELF_STABLE';
    if (productType.shelfStableIndividualServing) {
      return 'SHELF_STABLE_INDIVIDUAL_SERVING';
    }
    if (productType.alreadyPreparedFood) return 'ALREADY_PREPARED_FOOD';
    if (productType.other) return 'OTHER';
    return '';
  };

  const neededData = useMemo(() => {
    return productRequests.map((item) => ({
      foodName: item.name,
      foodType: findFoodType(item.productType),
      foodStatus: item.status,
      foodClaimer: item.claimedById ? 'Claimed' : 'Not claimed',
      foodId: item.id,
      supplierId: item.supplierId,
      prod: item,
    }));
  }, [productRequests]);

  useEffect(() => {
    setRowData(neededData);
  }, [neededData]);

  const loadSupplierData = useCallback(async () => {
    try {
      const res = await fetch(`/api/users`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch user data');
      const userData = await res.json();
      console.log(userData);
      setSupplierDetails(userData.supplier);

      const productRes = await fetch(
        `/api/product-requests?supplierId=${userData.supplier.id}`
      );
      if (!productRes.ok) throw new Error('Failed to fetch product requests');
      const productData = await productRes.json();
      setProductRequests(productData);

      await refreshMetrics(userData.supplier.id);
      setLoadingMetrics(false);
    } catch (error) {
      console.error('Error loading supplier data:', error);
      setLoadingMetrics(false);
    }
  }, [refreshMetrics, setLoadingMetrics]);

  const deleteProductRequest = async (prodId: string) => {
    try {
      const deletionResponse = await fetch(`/api/product-requests`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { id: prodId } }),
      });
      if (!deletionResponse.ok) {
        throw new Error('Failed to delete product requests');
      }
      setProductRequests((prev) => prev.filter((p) => p.id !== prodId));
      if (supplierDetails?.id) {
        await refreshMetrics(supplierDetails.id);
      }
    } catch (error) {
      console.error('Error deleting product request:', error);
    }
  };

  return {
    supplierDetails,
    setSupplierDetails,
    productRequests,
    setProductRequests,
    rowData,
    loadSupplierData,
    deleteProductRequest,
    findFoodType,
  };
};

export { useSupplierData };
