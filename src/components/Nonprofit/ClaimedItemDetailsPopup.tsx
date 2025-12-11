'use client';

import { PickupTimeframe } from '../../../types/types';

interface ClaimedItemDetailsPopupProps {
  showDetailsPopup: boolean;
  closeDetailsPopup: () => void;
  claimedItem: { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const formatTimeframe = (timeframe: PickupTimeframe): string => {
  switch (timeframe) {
    case 'MORNING':
      return '7 AM - 10 AM';
    case 'MID_DAY':
      return '10 AM - 2 PM';
    case 'AFTERNOON':
      return '2 PM - 5 PM';
    default:
      return timeframe;
  }
};

export const ClaimedItemDetailsPopup: React.FC<
  ClaimedItemDetailsPopupProps
> = ({ showDetailsPopup, closeDetailsPopup, claimedItem }) => {
  if (!showDetailsPopup) return null;
  return (
    <div>
      <div
        className='relative z-10'
        aria-labelledby='modal-title'
        role='dialog'
        aria-modal='true'
      >
        <div
          className='fixed inset-0 bg-gray-500/75 transition-opacity'
          aria-hidden='true'
        ></div>
        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
            <div className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
              <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                    <button
                      className='absolute right-2 top-2 text-gray-500 hover:text-gray-700 focus:outline-none'
                      onClick={closeDetailsPopup}
                    >
                      {' '}
                      X{' '}
                    </button>

                    <h3
                      className='text-base font-bold text-black'
                      id='modal-title'
                    >
                      Product Details
                    </h3>
                    <hr className='my-4 border-t border-gray-300' />
                    <div className='mt-2 text-black'>
                      <div className='mb-4'>
                        <h3 className='font-semibold text-black'>
                          Product Information
                        </h3>
                        <p>
                          <span className='font-bold'> Item: </span>{' '}
                          {claimedItem.name}{' '}
                        </p>
                        <p>
                          <span className='font-bold'> Description: </span>
                          {claimedItem.description}{' '}
                        </p>
                        <p>
                          <span className='font-bold'> Quantity: </span>{' '}
                          {claimedItem.quantity} {claimedItem.unit}{' '}
                        </p>
                      </div>
                      <div className='mb-4'>
                        <h3 className='font-semibold text-black'>
                          Supplier Information
                        </h3>
                        <p>
                          {' '}
                          <span className='font-bold'> Key Contact:</span>{' '}
                          {claimedItem.pickupInfo.contactName}{' '}
                        </p>
                        <p>
                          {' '}
                          <span className='font-bold'> Phone Number:</span>{' '}
                          {claimedItem.pickupInfo.contactPhone}{' '}
                        </p>
                      </div>

                      <div className='mb-4'>
                        <h3 className='font-semibold text-black'>
                          Pickup Information
                        </h3>
                        <p>
                          {' '}
                          <span className='font-bold'> Pickup Date: </span>
                          {new Date(
                            claimedItem.pickupInfo.pickupDate
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          {' '}
                          <span className='font-bold'>
                            {' '}
                            Pickup Timeframe(s):{' '}
                          </span>
                          {claimedItem.pickupInfo.pickupTimeframe.map(
                            (timeframe: PickupTimeframe) => (
                              <p key={timeframe}>
                                {formatTimeframe(timeframe)}
                              </p>
                            )
                          )}
                        </p>
                        <p>
                          {' '}
                          <span className='font-bold'> Pickup Location: </span>
                          {claimedItem.pickupInfo.pickupLocation}
                        </p>
                        <p>
                          {' '}
                          <span className='font-bold'>
                            {' '}
                            Pickup Instructions:{' '}
                          </span>
                          {claimedItem.pickupInfo.pickupInstructions}{' '}
                        </p>
                      </div>
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
