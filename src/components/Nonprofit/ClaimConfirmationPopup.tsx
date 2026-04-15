'use client';
import { useState, useEffect } from 'react';

interface ClaimConfirmationPopupProps {
  openPopup: boolean;
  closePopup: () => void;
  productName: string;
  onConfirm: (_quantity: number) => void;
  mode?: 'claim' | 'unclaim';
  /** Total available quantity — required in claim mode */
  maxQuantity?: number;
  /** Unit label (e.g. "lbs", "boxes") */
  unit?: string;
}

export const ClaimConfirmationPopup: React.FC<ClaimConfirmationPopupProps> = ({
  openPopup,
  closePopup,
  productName,
  onConfirm,
  mode = 'claim',
  maxQuantity = 1,
  unit = '',
}) => {
  const [quantity, setQuantity] = useState<number>(maxQuantity);

  // Reset to full quantity whenever the popup opens or the product changes
  useEffect(() => {
    setQuantity(maxQuantity);
  }, [openPopup, maxQuantity]);

  if (!openPopup) return null;

  const isClaim = mode === 'claim';
  return (
    <div>
      <div
        className='relative z-10'
        aria-labelledby='modal-title'
        role='dialog'
        aria-modal='true'
      >
        <div
          className='bg-muted0/75 fixed inset-0 transition-opacity'
          aria-hidden='true'
        ></div>
        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
            <div className='relative transform overflow-hidden rounded-lg bg-card text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
              <div className='bg-card px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left'>
                    <h3
                      className={`text-center text-base font-bold ${isClaim ? 'text-blue-600' : 'text-red-500'}`}
                      id='modal-title'
                    >
                      {isClaim ? 'Claim This Product' : 'Unclaim This Product'}
                    </h3>
                    <hr className='my-4 border-t border-border' />
                    <div className='mt-2'>
                      <p className='text-center text-sm text-muted-foreground'>
                        {isClaim ? (
                          <>
                            Are you sure you want to claim{' '}
                            <span className='font-semibold text-foreground'>
                              {productName}
                            </span>{' '}
                            would you like to claim? You will be responsible for
                            picking it up on the scheduled date.
                          </>
                        ) : (
                          <>
                            Are you sure you want to unclaim{' '}
                            <span className='font-semibold text-foreground'>
                              {productName}
                            </span>
                            ? It will be released back to the available pool.
                          </>
                        )}
                      </p>

                      {isClaim && (
                        <div className='mt-4'>
                          <label
                            htmlFor='claim-quantity'
                            className='block text-sm font-medium text-slate-700'
                          >
                            Quantity to claim
                            {unit ? ` (${unit})` : ''}
                          </label>
                          <div className='mt-1 flex items-center gap-2'>
                            <input
                              id='claim-quantity'
                              type='number'
                              min={1}
                              max={maxQuantity}
                              value={quantity}
                              onChange={(e) => {
                                const val = Math.max(
                                  1,
                                  Math.min(
                                    maxQuantity,
                                    Math.floor(Number(e.target.value))
                                  )
                                );
                                setQuantity(val);
                              }}
                              className='w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                            />
                            <span className='text-sm text-slate-500'>
                              of {maxQuantity} {unit} available
                            </span>
                          </div>
                          {quantity < maxQuantity && (
                            <p className='mt-1 text-xs text-amber-600'>
                              Partial claim — the remaining{' '}
                              {maxQuantity - quantity} {unit} will stay
                              available for other nonprofits.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className='mt-5 flex justify-between'>
                      <button
                        className='rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200'
                        onClick={closePopup}
                      >
                        Cancel
                      </button>
                      <button
                        className={`rounded-md px-4 py-2 text-white ${isClaim ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={() => {
                          onConfirm(quantity);
                          closePopup();
                        }}
                      >
                        {isClaim ? 'Confirm Claim' : 'Confirm Unclaim'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
