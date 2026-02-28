'use client';
import { ClaimConfirmationPopup } from '@/components/Nonprofit/ClaimConfirmationPopup';
import { ClaimedItemDetailsPopup } from '@/components/Nonprofit/ClaimedItemDetailsPopup';
import { Nonprofit, ProductInterest, ClaimedProduct } from '../_types';

interface ClaimsTabProps {
  nonprofit: Nonprofit;
  productInterests: ProductInterest | null;
  showItemDetailPopup: boolean;
  claimedItem: ClaimedProduct | null;
  setShowItemDetailPopup: (_show: boolean) => void;
  showItemDetails: (
    _event: React.MouseEvent<HTMLDivElement>,
    _product: ClaimedProduct
  ) => void;
  unclaimConfirm: {
    open: boolean;
    productId: string;
    productName: string;
    pickupDate: string;
  };
  setUnclaimConfirm: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      productId: string;
      productName: string;
      pickupDate: string;
    }>
  >;
  handleUnclaimProduct: (
    _productId: string,
    _pickupDate: string
  ) => Promise<void>;
}

const ClaimsTab = ({
  nonprofit,
  productInterests,
  showItemDetailPopup,
  claimedItem,
  setShowItemDetailPopup,
  showItemDetails,
  unclaimConfirm,
  setUnclaimConfirm,
  handleUnclaimProduct,
}: ClaimsTabProps) => {
  return (
    <div className='space-y-6'>
      {/* Product Interests Section */}
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-xl font-semibold text-slate-800'>
          Your Product Interests
        </h2>
        {productInterests ? (
          <div className='grid gap-4 md:grid-cols-2'>
            {productInterests.protein && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <h3 className='font-semibold text-slate-800'>Protein</h3>
                <p className='text-slate-700'>
                  Types: {productInterests.proteinTypes.join(', ')}
                </p>
              </div>
            )}
            {productInterests.produce && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <h3 className='font-semibold text-slate-800'>Produce</h3>
                <p className='text-slate-700'>
                  Type: {productInterests.produceType}
                </p>
              </div>
            )}
            {productInterests.shelfStable && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <h3 className='font-semibold text-slate-800'>Shelf Stable</h3>
                <p className='text-slate-700'>
                  Type: {productInterests.shelfStableType}
                </p>
              </div>
            )}
            {productInterests.shelfStableIndividualServing && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <h3 className='font-semibold text-slate-800'>
                  Individual Shelf Stable
                </h3>
                <p className='text-slate-700'>
                  Type: {productInterests.shelfStableIndividualServingType}
                </p>
              </div>
            )}
            {productInterests.alreadyPreparedFood && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <h3 className='font-semibold text-slate-800'>Prepared Food</h3>
                <p className='text-slate-700'>
                  Type: {productInterests.alreadyPreparedFoodType}
                </p>
              </div>
            )}
            {productInterests.other && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                <h3 className='font-semibold text-slate-800'>Other</h3>
                <p className='text-slate-700'>
                  Type: {productInterests.otherType}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className='text-center text-slate-500'>
            No product interests found
          </p>
        )}
      </div>

      {/* Claimed Products Section */}
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-xl font-semibold text-slate-800'>
          Claimed Products
        </h2>
        {nonprofit.productsClaimed.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2'>
            {nonprofit.productsClaimed.map((product) => (
              <div
                key={product.id}
                className='cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md'
                onClick={(e) => showItemDetails(e, product)}
              >
                <h3 className='font-semibold text-slate-800'>{product.name}</h3>
                <div className='mt-2 space-y-1'>
                  <p className='text-slate-700'>Quantity: {product.quantity}</p>
                  <p className='text-slate-700'>Status: {product.status}</p>
                  <p className='text-slate-700'>
                    Pickup Date:{' '}
                    {new Date(
                      product.pickupInfo.pickupDate
                    ).toLocaleDateString()}
                  </p>
                  <p className='text-slate-700'>
                    Location: {product.pickupInfo.pickupLocation}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUnclaimConfirm({
                      open: true,
                      productId: product.id,
                      productName: product.name,
                      pickupDate: product.pickupInfo.pickupDate,
                    });
                  }}
                  className='mt-4 rounded-md bg-red-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                >
                  Unclaim Product
                </button>
              </div>
            ))}
            {showItemDetailPopup && (
              <ClaimedItemDetailsPopup
                showDetailsPopup={showItemDetailPopup}
                closeDetailsPopup={() => setShowItemDetailPopup(false)}
                claimedItem={claimedItem}
              />
            )}
            <ClaimConfirmationPopup
              openPopup={unclaimConfirm.open}
              closePopup={() =>
                setUnclaimConfirm({
                  open: false,
                  productId: '',
                  productName: '',
                  pickupDate: '',
                })
              }
              productName={unclaimConfirm.productName}
              onConfirm={() =>
                handleUnclaimProduct(
                  unclaimConfirm.productId,
                  unclaimConfirm.pickupDate
                )
              }
              mode='unclaim'
            />
          </div>
        ) : (
          <p className='text-center text-slate-500'>No products claimed yet</p>
        )}
      </div>
    </div>
  );
};

export default ClaimsTab;
