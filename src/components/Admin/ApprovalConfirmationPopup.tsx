'use client';

type ApprovalMode = 'approve' | 'reject' | 'reverse-approve' | 'reverse-reject';

interface ApprovalConfirmationPopupProps {
  openPopup: boolean;
  closePopup: () => void;
  nonprofitName: string;
  mode: ApprovalMode;
  onConfirm: () => void;
}

const modeConfig: Record<
  ApprovalMode,
  { title: string; body: string; confirmLabel: string; confirmClass: string }
> = {
  approve: {
    title: 'Approve Nonprofit',
    body: 'are you sure you want to approve',
    confirmLabel: 'Confirm Approval',
    confirmClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  },
  reject: {
    title: 'Reject Nonprofit',
    body: 'are you sure you want to reject',
    confirmLabel: 'Confirm Rejection',
    confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  'reverse-approve': {
    title: 'Reverse to Approved',
    body: 'are you sure you want to reverse the status back to approved for',
    confirmLabel: 'Confirm Reversal',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
  'reverse-reject': {
    title: 'Reverse to Rejected',
    body: 'are you sure you want to reverse the status back to rejected for',
    confirmLabel: 'Confirm Reversal',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
};

export default function ApprovalConfirmationPopup({
  openPopup,
  closePopup,
  nonprofitName,
  mode,
  onConfirm,
}: ApprovalConfirmationPopupProps) {
  if (!openPopup) return null;

  const config = modeConfig[mode];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Dark overlay */}
      <div
        className='fixed inset-0 bg-gray-500/75 transition-opacity'
        onClick={closePopup}
      />

      {/* Modal */}
      <div className='relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl'>
        <h2
          className={`mb-4 text-xl font-semibold ${
            mode === 'approve'
              ? 'text-green-700'
              : mode === 'reject'
                ? 'text-red-700'
                : 'text-blue-700'
          }`}
        >
          {config.title}
        </h2>

        <p className='mb-6 text-slate-700'>
          Are you sure you want to{' '}
          <span className='font-medium'>
            {config.body.replace('are you sure you want to ', '')}
          </span>{' '}
          <span className='font-semibold text-slate-900'>
            &ldquo;{nonprofitName}&rdquo;
          </span>
          ? This action will notify the nonprofit via email.
        </p>

        <div className='flex justify-end gap-3'>
          <button
            onClick={closePopup}
            className='rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2'
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.confirmClass}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
