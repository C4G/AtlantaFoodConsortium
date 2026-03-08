'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExtendedUser, ClaimedProduct } from './_types';
import { useNonprofitMetrics } from './_hooks/useNonprofitMetrics';
import { useNonprofitData } from './_hooks/useNonprofitData';
import { useClaim } from './_hooks/useClaim';
import TabNav from './_components/TabNav';
import OverviewTab from './_components/OverviewTab';
import AvailableProductsTab from './_components/AvailableProductsTab';
import ClaimsTab from './_components/ClaimsTab';

const NonprofitDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'available' | 'claims'
  >('overview');
  const [showItemDetailPopup, setShowItemDetailPopup] = useState(false);
  const [claimedItem, setClaimedItem] = useState<ClaimedProduct | null>(null);

  const { metricsData, loadingMetrics, setLoadingMetrics, refreshMetrics } =
    useNonprofitMetrics();

  const {
    nonprofit,
    setNonprofit,
    productInterests,
    loading,
    availableProducts,
    setAvailableProducts,
    loadData,
    handleDocumentReupload,
  } = useNonprofitData({ refreshMetrics, setLoadingMetrics });

  const {
    claimConfirm,
    setClaimConfirm,
    unclaimConfirm,
    setUnclaimConfirm,
    handleClaimProduct,
    handleUnclaimProduct,
  } = useClaim({
    nonprofit,
    setNonprofit,
    setAvailableProducts,
    refreshMetrics,
  });

  const showItemDetails = (
    event: React.MouseEvent<HTMLDivElement>,
    product: ClaimedProduct
  ) => {
    setShowItemDetailPopup(true);
    setClaimedItem(product);
    const element = event.target as HTMLElement;
    element.classList.add('scale-75');
    setTimeout(() => element.classList.remove('scale-75'), 200);
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.user) {
      router.replace('/');
      return;
    }
    const user = session.user as ExtendedUser;
    loadData(user.nonprofitId, user.productSurveyId);
  }, [status]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <div className='w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg'>
          <p className='text-center text-lg text-slate-700'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!nonprofit) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <div className='w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg'>
          <p className='text-center text-lg text-red-600'>
            Error loading nonprofit data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Organization Header */}
        <div className='rounded-xl bg-white p-6 shadow-lg'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='mb-2 text-3xl font-bold text-blue-600'>
                {nonprofit.name}
              </h1>
              <p className='text-lg text-slate-700'>
                {nonprofit.organizationType
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </p>
            </div>

            <div className='text-right'>
              {nonprofit.nonprofitDocumentApproval === true ? (
                <span className='inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'>
                  Approved
                </span>
              ) : (
                <>
                  <input
                    type='file'
                    id='documentUpload'
                    className='hidden'
                    accept='.pdf,.png,.jpg,.jpeg'
                    onChange={handleDocumentReupload}
                  />
                  <label
                    htmlFor='documentUpload'
                    className='mb-2 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  >
                    Reupload Document
                  </label>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        nonprofit.nonprofitDocumentApproval === null
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Status:{' '}
                      {nonprofit.nonprofitDocumentApproval === null
                        ? 'Pending'
                        : 'Rejected'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          availableCount={availableProducts.length}
          claimedCount={nonprofit.productsClaimed.length}
        />

        {activeTab === 'overview' && (
          <OverviewTab
            metricsData={metricsData}
            loadingMetrics={loadingMetrics}
            productInterests={productInterests}
            availableCount={availableProducts.length}
          />
        )}

        {activeTab === 'available' && (
          <AvailableProductsTab
            availableProducts={availableProducts}
            nonprofit={nonprofit}
            claimConfirm={claimConfirm}
            setClaimConfirm={setClaimConfirm}
            handleClaimProduct={handleClaimProduct}
          />
        )}

        {activeTab === 'claims' && (
          <ClaimsTab
            nonprofit={nonprofit}
            productInterests={productInterests}
            showItemDetailPopup={showItemDetailPopup}
            claimedItem={claimedItem}
            setShowItemDetailPopup={setShowItemDetailPopup}
            showItemDetails={showItemDetails}
            unclaimConfirm={unclaimConfirm}
            setUnclaimConfirm={setUnclaimConfirm}
            handleUnclaimProduct={handleUnclaimProduct}
          />
        )}
      </div>
    </div>
  );
};

export default NonprofitDashboard;
