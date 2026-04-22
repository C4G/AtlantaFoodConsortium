'use client';
import { useState, useEffect } from 'react';

export interface NonprofitPickupContact {
  name: string;
  phone: string;
  date: string;
  timeframe: string;
}

interface ClaimConfirmationPopupProps {
  openPopup: boolean;
  closePopup: () => void;
  productName: string;
  onConfirm: (_quantity: number, _contact: NonprofitPickupContact) => void;
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
  const [contact, setContact] = useState<NonprofitPickupContact>({
    name: '',
    phone: '',
    date: '',
    timeframe: '',
  });

  // Reset all fields whenever the popup opens or the product changes
  useEffect(() => {
    setQuantity(maxQuantity);
    setContact({ name: '', phone: '', date: '', timeframe: '' });
  }, [openPopup, maxQuantity]);

  const today = new Date().toISOString().split('T')[0];

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
                            How much of{' '}
                            <span className='font-semibold text-slate-700'>
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
                        <>
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

                          {/* Nonprofit pickup contact info */}
                          <div className='mt-5 space-y-3 border-t border-slate-200 pt-4'>
                            <p className='text-sm font-semibold text-slate-700'>
                              Your Pickup Contact
                            </p>
                            <div className='grid gap-3 sm:grid-cols-2'>
                              <div>
                                <label
                                  htmlFor='np-contact-name'
                                  className='block text-sm font-medium text-slate-700'
                                >
                                  Contact Name *
                                </label>
                                <input
                                  id='np-contact-name'
                                  type='text'
                                  required
                                  value={contact.name}
                                  onChange={(e) =>
                                    setContact((c) => ({
                                      ...c,
                                      name: e.target.value,
                                    }))
                                  }
                                  placeholder='Full name'
                                  className='mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor='np-contact-phone'
                                  className='block text-sm font-medium text-slate-700'
                                >
                                  Phone Number *
                                </label>
                                <input
                                  id='np-contact-phone'
                                  type='tel'
                                  required
                                  value={contact.phone}
                                  onChange={(e) =>
                                    setContact((c) => ({
                                      ...c,
                                      phone: e.target.value,
                                    }))
                                  }
                                  placeholder='(404) 555-0100'
                                  className='mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor='np-pickup-date'
                                className='block text-sm font-medium text-slate-700'
                              >
                                Pickup Date *
                              </label>
                              <input
                                id='np-pickup-date'
                                type='date'
                                required
                                min={today}
                                value={contact.date}
                                onChange={(e) =>
                                  setContact((c) => ({
                                    ...c,
                                    date: e.target.value,
                                  }))
                                }
                                className='mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                              />
                            </div>
                            <div>
                              <p className='block text-sm font-medium text-slate-700'>
                                Pickup Time *
                              </p>
                              <div className='mt-1 flex flex-wrap gap-x-4 gap-y-1'>
                                {[
                                  ['MORNING', '7 AM – 10 AM'],
                                  ['MID_DAY', '10 AM – 2 PM'],
                                  ['AFTERNOON', '2 PM – 5 PM'],
                                ].map(([val, label]) => (
                                  <label
                                    key={val}
                                    className='flex items-center gap-1.5 text-sm text-slate-700'
                                  >
                                    <input
                                      type='radio'
                                      name='np-pickup-timeframe'
                                      value={val}
                                      checked={contact.timeframe === val}
                                      onChange={() =>
                                        setContact((c) => ({
                                          ...c,
                                          timeframe: val,
                                        }))
                                      }
                                      className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                                    />
                                    {label}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
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
                        className={`rounded-md px-4 py-2 text-white ${isClaim ? 'bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300' : 'bg-red-500 hover:bg-red-600'}`}
                        disabled={
                          isClaim &&
                          (!contact.name ||
                            !contact.phone ||
                            !contact.date ||
                            !contact.timeframe)
                        }
                        onClick={() => {
                          onConfirm(quantity, contact);
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
