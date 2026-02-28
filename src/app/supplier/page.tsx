'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSupplierMetrics } from './_hooks/useSupplierMetrics';
import { useSupplierData } from './_hooks/useSupplierData';
import { useSupplierForm } from './_hooks/useSupplierForm';
import TabNav from './_components/TabNav';
import OverviewTab from './_components/OverviewTab';
import ProductsTab from './_components/ProductsTab';

const SupplierDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>(
    'overview'
  );

  const { metricsData, loadingMetrics, setLoadingMetrics, refreshMetrics } =
    useSupplierMetrics();

  const {
    supplierDetails,
    setProductRequests,
    productRequests,
    rowData,
    loadSupplierData,
    deleteProductRequest,
  } = useSupplierData({ refreshMetrics, setLoadingMetrics });

  const {
    formData,
    register,
    handleSubmit,
    errors,
    handleInputChange,
    handleProductTypeToggle,
    handleProductDetailsChange,
    formatSnakeCase,
    onSubmit,
  } = useSupplierForm({
    supplierDetails,
    setProductRequests,
    refreshMetrics,
    setActiveTab,
  });

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (session?.user.role !== 'SUPPLIER') {
      router.replace('/');
      return;
    }
    loadSupplierData();
  }, [status]);

  return (
    <div className='light min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4'>
          <div className='text-xl font-semibold text-black'>MAFC</div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-8'>
        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          productCount={productRequests.length}
        />

        {activeTab === 'overview' && (
          <OverviewTab
            metricsData={metricsData}
            loadingMetrics={loadingMetrics}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            rowData={rowData}
            deleteProductRequest={deleteProductRequest}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            formData={formData}
            register={register}
            errors={errors}
            handleInputChange={handleInputChange}
            handleProductTypeToggle={handleProductTypeToggle}
            handleProductDetailsChange={handleProductDetailsChange}
            formatSnakeCase={formatSnakeCase}
          />
        )}
      </main>
    </div>
  );
};

export default SupplierDashboard;
