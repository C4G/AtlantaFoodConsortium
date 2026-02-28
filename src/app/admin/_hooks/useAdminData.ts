import { useState, useCallback } from 'react';
import { Supplier, Nonprofit, ProductRequest } from '../../../../types/types';
import { AdminNonprofitDocument } from '../_types';

const useAdminData = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [documents, setDocuments] = useState<AdminNonprofitDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch('/api/suppliers/all');
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch suppliers');
      if (data) setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchNonprofits = useCallback(async () => {
    try {
      const response = await fetch('/api/nonprofits/all');
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch nonprofits');
      if (data) setNonprofits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchProductRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/product-requests/multiple');
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch product requests');
      if (data) setProductRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(
        '/api/nonprofit-documents?includeFileData=true'
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch documents');
      if (data) setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const getDocumentForNonprofit = (
    nonprofitId: string
  ): AdminNonprofitDocument | undefined => {
    return documents.find((doc) => doc.nonprofit?.id === nonprofitId);
  };

  const countActiveSuppliers = (supplierList: Supplier[]): number => {
    return supplierList.filter((s) => s.users.length > 0).length;
  };

  const countActiveNonprofits = (nonprofitList: Nonprofit[]): number => {
    return nonprofitList.filter((n) => n.users.length > 0).length;
  };

  const downloadDocument = (doc: AdminNonprofitDocument) => {
    if (!doc.fileData) return;
    const binaryString = window.atob(doc.fileData as unknown as string);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: doc.fileType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  const getNonprofitName = (nonprofitId: string | null): string => {
    if (!nonprofitId) return 'Not claimed';
    const nonprofit = nonprofits.find((n) => n.id === nonprofitId);
    return nonprofit ? nonprofit.name : 'Unknown';
  };

  return {
    suppliers,
    nonprofits,
    productRequests,
    documents,
    error,
    fetchSuppliers,
    fetchNonprofits,
    fetchProductRequests,
    fetchDocuments,
    getDocumentForNonprofit,
    countActiveSuppliers,
    countActiveNonprofits,
    downloadDocument,
    getSupplierName,
    getNonprofitName,
  };
};

export { useAdminData };
