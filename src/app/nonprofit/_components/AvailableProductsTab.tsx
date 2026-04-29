'use client';
import {
  ClaimConfirmationPopup,
  NonprofitPickupContact,
} from '@/components/Nonprofit/ClaimConfirmationPopup';
import { Nonprofit, ProductRequest } from '../_types';

interface AvailableProductsTabProps {
  availableProducts: ProductRequest[];
  nonprofit: Nonprofit;
  claimConfirm: {
    open: boolean;
    productId: string;
    productName: string;
    maxQuantity: number;
    unit: string;
  };
  setClaimConfirm: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      productId: string;
      productName: string;
      maxQuantity: number;
      unit: string;
    }>
  >;
  handleClaimProduct: (
    _productId: string,
    _quantity: number,
    _contact: NonprofitPickupContact
  ) => Promise<void>;
}

const AvailableProductsTab = ({
  availableProducts,
  nonprofit,
  claimConfirm,
  setClaimConfirm,
  handleClaimProduct,
}: AvailableProductsTabProps) => {
  return (
    <div className='rounded-xl border border-border bg-card p-6 shadow-lg'>
      <h2 className='mb-4 text-xl font-semibold text-foreground'>
        Available Products
      </h2>
      {availableProducts.length > 0 ? (
        <div className='space-y-4'>
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'
            >
              <div className='flex justify-between'>
                <h3 className='text-lg font-semibold text-foreground'>
                  {product.name}
                </h3>
                <span className='text-sm text-muted-foreground'>
                  Posted {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className='mt-4 grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
                      Quantity:
                    </span>{' '}
                    {product.quantity} {product.unit}
                  </p>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
                      Description:
                    </span>{' '}
                    {product.description}
                  </p>
                  {product.perishable && product.expirationDate && (
                    <p className='text-foreground'>
                      <span className='font-medium text-foreground'>
                        Expires:
                      </span>{' '}
                      {new Date(product.expirationDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>Status:</span>{' '}
                    {product.status}
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
                      Supplier:
                    </span>{' '}
                    {product.supplier.name}
                  </p>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
                      Pickup Location:
                    </span>{' '}
                    {product.pickupInfo.pickupLocation}
                  </p>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
                      Pickup Date:
                    </span>{' '}
                    {new Date(
                      product.pickupInfo.pickupDate
                    ).toLocaleDateString()}
                  </p>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
                      Pickup Time:
                    </span>{' '}
                    {product.pickupInfo.pickupTimeframe
                      .map((time) => time.replace(/_/g, ' '))
                      .join(', ')}
                  </p>
                  <p className='text-foreground'>
                    <span className='font-medium text-foreground'>
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
                      maxQuantity: product.quantity,
                      unit: product.unit,
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
                    className='cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  >
                    Claim This Product
                  </button>
                  <p className='text-sm text-red-600 dark:text-red-400'>
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
        <p className='text-center text-muted-foreground'>
          No available products found
        </p>
      )}
      <ClaimConfirmationPopup
        openPopup={claimConfirm.open}
        closePopup={() =>
          setClaimConfirm({
            open: false,
            productId: '',
            productName: '',
            maxQuantity: 0,
            unit: '',
          })
        }
        productName={claimConfirm.productName}
        maxQuantity={claimConfirm.maxQuantity}
        unit={claimConfirm.unit}
        onConfirm={(quantity, contact) =>
          handleClaimProduct(claimConfirm.productId, quantity, contact)
        }
      />
    </div>
  );
};

export default AvailableProductsTab;
