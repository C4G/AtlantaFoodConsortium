'use client';
import { ClaimConfirmationPopup } from '@/components/Nonprofit/ClaimConfirmationPopup';
import { Nonprofit, ProductRequest } from '../_types';

interface AvailableProductsTabProps {
  availableProducts: ProductRequest[];
  nonprofit: Nonprofit;
  claimConfirm: { open: boolean; productId: string; productName: string };
  setClaimConfirm: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      productId: string;
      productName: string;
    }>
  >;
  handleClaimProduct: (_productId: string) => Promise<void>;
}

const AvailableProductsTab = ({
  availableProducts,
  nonprofit,
  claimConfirm,
  setClaimConfirm,
  handleClaimProduct,
}: AvailableProductsTabProps) => {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
      <h2 className='mb-4 text-xl font-semibold text-slate-800'>
        Available Products
      </h2>
      {availableProducts.length > 0 ? (
        <div className='space-y-4'>
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm'
            >
              <div className='flex justify-between'>
                <h3 className='text-lg font-semibold text-slate-800'>
                  {product.name}
                </h3>
                <span className='text-sm text-slate-500'>
                  Posted {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className='mt-4 grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Quantity:
                    </span>{' '}
                    {product.quantity} {product.unit}
                  </p>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Description:
                    </span>{' '}
                    {product.description}
                  </p>
                  {product.perishable && product.expirationDate && (
                    <p className='text-slate-700'>
                      <span className='font-medium text-slate-800'>
                        Expires:
                      </span>{' '}
                      {new Date(product.expirationDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>Status:</span>{' '}
                    {product.status}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Supplier:
                    </span>{' '}
                    {product.supplier.name}
                  </p>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Pickup Location:
                    </span>{' '}
                    {product.pickupInfo.pickupLocation}
                  </p>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Pickup Date:
                    </span>{' '}
                    {new Date(
                      product.pickupInfo.pickupDate
                    ).toLocaleDateString()}
                  </p>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Pickup Time:
                    </span>{' '}
                    {product.pickupInfo.pickupTimeframe
                      .map((time) => time.replace(/_/g, ' '))
                      .join(', ')}
                  </p>
                  <p className='text-slate-700'>
                    <span className='font-medium text-slate-800'>
                      Instructions:
                    </span>{' '}
                    {product.pickupInfo.pickupInstructions}
                  </p>
                </div>
              </div>

              {nonprofit.nonprofitDocumentApproval === true ? (
                <button
                  onClick={() =>
                    setClaimConfirm({
                      open: true,
                      productId: product.id,
                      productName: product.name,
                    })
                  }
                  className='mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  Claim This Product
                </button>
              ) : (
                <div className='mt-4 flex flex-col gap-2'>
                  <button
                    disabled
                    className='cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 font-medium text-slate-500'
                  >
                    Claim This Product
                  </button>
                  <p className='text-sm text-red-600'>
                    {nonprofit.nonprofitDocumentApproval === null
                      ? 'Document approval pending. You can claim products once approved.'
                      : 'Document rejected. Please reupload your document for approval.'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center text-slate-500'>
          No available products found
        </p>
      )}
      <ClaimConfirmationPopup
        openPopup={claimConfirm.open}
        closePopup={() =>
          setClaimConfirm({ open: false, productId: '', productName: '' })
        }
        productName={claimConfirm.productName}
        onConfirm={() => handleClaimProduct(claimConfirm.productId)}
      />
    </div>
  );
};

export default AvailableProductsTab;
