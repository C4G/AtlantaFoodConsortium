'use client';

interface ClaimConfirmationPopupProps {
  openPopup: boolean;
  closePopup: () => void;
  productName: string;
  onConfirm: () => void;
  mode?: 'claim' | 'unclaim';
}

export const ClaimConfirmationPopup: React.FC<ClaimConfirmationPopupProps> = ({
  openPopup,
  closePopup,
  productName,
  onConfirm,
  mode = 'claim',
}) => {
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
          className='fixed inset-0 bg-gray-500/75 transition-opacity'
          aria-hidden='true'
        ></div>
        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
            <div className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
              <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left'>
                    <h3
                      className={`text-center text-base font-bold ${isClaim ? 'text-blue-600' : 'text-red-500'}`}
                      id='modal-title'
                    >
                      {isClaim ? 'Claim This Product' : 'Unclaim This Product'}
                    </h3>
                    <hr className='my-4 border-t border-gray-300' />
                    <div className='mt-2'>
                      <p className='text-center text-sm text-gray-500'>
                        {isClaim ? (
                          <>
                            Are you sure you want to claim{' '}
                            <span className='font-semibold text-slate-700'>
                              {productName}
                            </span>
                            ? You will be responsible for picking it up on the
                            scheduled date.
                          </>
                        ) : (
                          <>
                            Are you sure you want to unclaim{' '}
                            <span className='font-semibold text-slate-700'>
                              {productName}
                            </span>
                            ? It will be released back to the available pool.
                          </>
                        )}
                      </p>
                    </div>
                    <div className='mt-5 flex justify-between'>
                      <button
                        className='bg-gray-50 px-4 py-2'
                        onClick={closePopup}
                      >
                        Cancel
                      </button>
                      <button
                        className={`rounded-md px-4 py-2 text-white ${isClaim ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={() => {
                          onConfirm();
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
