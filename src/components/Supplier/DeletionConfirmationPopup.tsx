'use client';

interface DeletionConfirmationProps {
  openPopup: boolean;
  closePopup: () => void;
  foodId: string;
  deleteProductRequest: (_prodId: string) => void;
}
export const DeletionConfirmationPopup: React.FC<DeletionConfirmationProps> = ({
  openPopup,
  closePopup,
  foodId,
  deleteProductRequest,
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
                    <h3
                      className='text-center text-base font-bold text-red-400'
                      id='modal-title'
                    >
                      Delete Pickup Request
                    </h3>
                    <hr className='my-4 border-t border-gray-300' />
                    <div className='mt-2'>
                      <p className='text-center text-sm text-gray-500'>
                        Are you sure you want to delete this pickup request?
                        This action cannot be undone.
                      </p>
                    </div>
                    <div className='flex justify-between'>
                      <button
                        className='bg-gray-50 px-4 py-2'
                        onClick={closePopup}
                      >
                        Cancel
                      </button>
                      <button
                        className='bg-red-400 px-4 py-2 text-white'
                        onClick={() => deleteProductRequest(foodId)}
                      >
                        Delete
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
