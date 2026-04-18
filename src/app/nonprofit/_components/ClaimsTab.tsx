'use client';
import { useMemo, useState } from 'react';
import { ClaimConfirmationPopup } from '@/components/Nonprofit/ClaimConfirmationPopup';
import { ClaimedItemDetailsPopup } from '@/components/Nonprofit/ClaimedItemDetailsPopup';
import { Nonprofit, ProductInterest, ClaimedProduct } from '../_types';

type ClaimsSortMode = 'pickupSoonest' | 'recentlyClaimed';

function sortClaimedProducts(
  products: ClaimedProduct[],
  mode: ClaimsSortMode
): ClaimedProduct[] {
  const list = [...products];
  const byId = (a: ClaimedProduct, b: ClaimedProduct) =>
    a.id.localeCompare(b.id);

  if (mode === 'pickupSoonest') {
    return list.sort((a, b) => {
      const diff =
        new Date(a.pickupInfo.pickupDate).getTime() -
        new Date(b.pickupInfo.pickupDate).getTime();
      return diff !== 0 ? diff : byId(a, b);
    });
  }

  return list.sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    const diff = tb - ta;
    return diff !== 0 ? diff : byId(a, b);
  });
}

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
  const [claimsSort, setClaimsSort] = useState<ClaimsSortMode>('pickupSoonest');

  const sortedClaimedProducts = useMemo(
    () => sortClaimedProducts(nonprofit.productsClaimed, claimsSort),
    [nonprofit.productsClaimed, claimsSort]
  );

  return (
    <div className='space-y-6'>
      {/* Product Interests Section */}
      <div className='rounded-xl border border-border bg-card p-6 shadow-lg'>
        <h2 className='mb-4 text-xl font-semibold text-foreground'>
          Your Product Interests
        </h2>
        {productInterests ? (
          <div className='grid gap-4 md:grid-cols-2'>
            {productInterests.protein && (
              <div className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'>
                <h3 className='font-semibold text-foreground'>Protein</h3>
                <p className='text-muted-foreground'>
                  Types: {productInterests.proteinTypes.join(', ')}
                </p>
              </div>
            )}
            {productInterests.produce && (
              <div className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'>
                <h3 className='font-semibold text-foreground'>Produce</h3>
                <p className='text-muted-foreground'>
                  Type: {productInterests.produceType}
                </p>
              </div>
            )}
            {productInterests.shelfStable && (
              <div className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'>
                <h3 className='font-semibold text-foreground'>Shelf Stable</h3>
                <p className='text-muted-foreground'>
                  Type: {productInterests.shelfStableType}
                </p>
              </div>
            )}
            {productInterests.shelfStableIndividualServing && (
              <div className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'>
                <h3 className='font-semibold text-foreground'>
                  Individual Shelf Stable
                </h3>
                <p className='text-muted-foreground'>
                  Type: {productInterests.shelfStableIndividualServingType}
                </p>
              </div>
            )}
            {productInterests.alreadyPreparedFood && (
              <div className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'>
                <h3 className='font-semibold text-foreground'>Prepared Food</h3>
                <p className='text-muted-foreground'>
                  Type: {productInterests.alreadyPreparedFoodType}
                </p>
              </div>
            )}
            {productInterests.other && (
              <div className='rounded-lg border border-border bg-muted/40 p-4 shadow-sm'>
                <h3 className='font-semibold text-foreground'>Other</h3>
                <p className='text-muted-foreground'>
                  Type: {productInterests.otherType}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className='text-center text-muted-foreground'>
            No product interests found
          </p>
        )}
      </div>

      {/* Claimed Products Section */}
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-lg'>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-xl font-semibold text-slate-800'>
            Claimed Products
          </h2>
          {nonprofit.productsClaimed.length > 0 && (
            <div className='flex flex-wrap items-center gap-2'>
              <label
                htmlFor='claims-sort'
                className='text-sm font-medium text-slate-600'
              >
                Sort by
              </label>
              <select
                id='claims-sort'
                value={claimsSort}
                onChange={(e) =>
                  setClaimsSort(e.target.value as ClaimsSortMode)
                }
                className='rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='pickupSoonest'>Pickup Date (Soonest)</option>
                <option value='recentlyClaimed'>Most Recently Claimed</option>
              </select>
            </div>
          )}
        </div>
        {nonprofit.productsClaimed.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2'>
            {sortedClaimedProducts.map((product) => {
              const isPartial = !!product.originalProductId;
              const pickupLabel = new Date(
                product.pickupInfo.pickupDate
              ).toLocaleDateString();
              return (
                <div
                  key={product.id}
                  className='cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md'
                  onClick={(e) => showItemDetails(e, product)}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-lg font-bold leading-snug tracking-tight text-slate-900'>
                      {product.name}
                    </h3>
                    {isPartial ? (
                      <span className='shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700'>
                        Partially Claimed
                      </span>
                    ) : (
                      <span className='shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700'>
                        Claimed
                      </span>
                    )}
                  </div>
                  <p className='mt-2 text-base font-semibold text-blue-900'>
                    Pickup: {pickupLabel}
                  </p>
                  <div className='mt-3 space-y-1 border-t border-slate-200/80 pt-3 text-sm text-slate-600'>
                    <p>Quantity: {product.quantity}</p>
                    <p>Location: {product.pickupInfo.pickupLocation}</p>
                  </div>
                  <button
                    type='button'
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
              );
            })}
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
          <p className='text-center text-muted-foreground'>
            No products claimed yet
          </p>
        )}
      </div>
    </div>
  );
};

export default ClaimsTab;
