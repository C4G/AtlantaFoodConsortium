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
        className='relative z-50'
        aria-labelledby='modal-title'
        role='dialog'
        aria-modal='true'
      >
        <div
          className='fixed inset-0 z-50 bg-black/50 transition-opacity'
          aria-hidden='true'
        ></div>
        <div className='fixed inset-0 z-50 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
            <div className='relative transform overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-xl transition-all dark:border-border dark:bg-card sm:my-8 sm:w-full sm:max-w-lg'>
              <div className='px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left'>
                    <h3
                      className='text-center text-base font-bold text-red-500 dark:text-red-400'
                      id='modal-title'
                    >
                      Delete Pickup Request
                    </h3>
                    <hr className='my-4 border-t border-slate-200 dark:border-border' />
                    <div className='mt-2'>
                      <p className='text-center text-sm text-slate-500 dark:text-muted-foreground'>
                        Are you sure you want to delete this pickup request?
                        This action cannot be undone.
                      </p>
                    </div>
                    <div className='mt-6 flex justify-between'>
                      <button
                        className='rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                        onClick={closePopup}
                      >
                        Cancel
                      </button>
                      <button
                        className='rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                        onClick={() => {
                          deleteProductRequest(foodId);
                          closePopup();
                        }}
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
