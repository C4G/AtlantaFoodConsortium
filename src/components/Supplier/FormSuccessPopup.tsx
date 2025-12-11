'use client';

interface FormSuccessPopupProps {
  openPopup: boolean;
  closePopup: () => void;
}
export const FormSuccessPopup: React.FC<FormSuccessPopupProps> = ({
  openPopup,
  closePopup,
}) => {
  if (!openPopup) return null;

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
                      onClick={closePopup}
                    >
                      {' '}
                      X{' '}
                    </button>

                    <h3
                      className='text-center text-base font-bold text-teal-600'
                      id='modal-title'
                    >
                      Food Pickup Request Submitted!
                    </h3>
                    <hr className='my-4 border-t border-gray-300' />
                    <div className='mt-2'>
                      <p className='text-center text-sm text-gray-500'>
                        Thank you for submitting a new food pickup request. Your
                        request will now be visible to the community and
                        nonprofit organizations will be able to see and respond
                        to your request.
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
  );
};
