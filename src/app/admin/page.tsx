'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminData } from './_hooks/useAdminData';
import { useAdminAnalytics } from './_hooks/useAdminAnalytics';
import { useApproval } from './_hooks/useApproval';
import TabNav from './_components/TabNav';
import OverviewTab from './_components/OverviewTab';
import SuppliersTab from './_components/SuppliersTab';
import NonprofitsTab from './_components/NonprofitsTab';
import ProductRequestsTab from './_components/ProductRequestsTab';

const AdminPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') router.replace('/');
  }, [session, status, router]);

  const [activeTab, setActiveTab] = useState<string>('overview');

  const {
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
  } = useAdminData();

  const { analyticsData, loading, fetchAnalytics } = useAdminAnalytics();

  const { approvalConfirm, setApprovalConfirm, handleApproval } = useApproval({
    fetchNonprofits,
    fetchAnalytics,
  });

  useEffect(() => {
    fetchSuppliers();
    fetchNonprofits();
    fetchProductRequests();
    fetchDocuments();
    fetchAnalytics();
  }, [
    fetchSuppliers,
    fetchNonprofits,
    fetchProductRequests,
    fetchDocuments,
    fetchAnalytics,
  ]);

  return (
    <div className='flex min-h-screen flex-col bg-slate-50 p-6'>
      <div className='mx-auto w-full max-w-7xl'>
        <h1 className='mb-6 text-center text-3xl font-bold text-slate-900'>
          Admin Dashboard
        </h1>

        {error && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600'>
            <div className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mr-2 h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          supplierCount={countActiveSuppliers(suppliers)}
          nonprofitCount={countActiveNonprofits(nonprofits)}
          productRequestCount={productRequests.length}
        />

        {activeTab === 'overview' && (
          <OverviewTab analyticsData={analyticsData} loading={loading} />
        )}

        {activeTab === 'suppliers' && <SuppliersTab suppliers={suppliers} />}

        {activeTab === 'nonprofits' && (
          <NonprofitsTab
            nonprofits={nonprofits}
            documents={documents}
            approvalConfirm={approvalConfirm}
            setApprovalConfirm={setApprovalConfirm}
            handleApproval={handleApproval}
            getDocumentForNonprofit={getDocumentForNonprofit}
            downloadDocument={downloadDocument}
            fetchDocuments={fetchDocuments}
          />
        )}

        {activeTab === 'productRequests' && (
          <ProductRequestsTab
            productRequests={productRequests}
            getSupplierName={getSupplierName}
            getNonprofitName={getNonprofitName}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
