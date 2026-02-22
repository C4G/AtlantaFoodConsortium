import { Nonprofit } from '../../../../types/types';
import ApprovalConfirmationPopup from '@/components/Admin/ApprovalConfirmationPopup';
import { AdminNonprofitDocument, ApprovalMode } from '../_types';

interface ApprovalConfirmState {
  open: boolean;
  nonprofitId: string;
  nonprofitName: string;
  mode: ApprovalMode;
}

interface NonprofitsTabProps {
  nonprofits: Nonprofit[];
  documents: AdminNonprofitDocument[];
  approvalConfirm: ApprovalConfirmState;
  setApprovalConfirm: React.Dispatch<
    React.SetStateAction<ApprovalConfirmState>
  >;
  handleApproval: (
    _nonprofitId: string,
    _approved: boolean,
    _closePopup?: () => void,
    _nonprofitName?: string
  ) => Promise<void>;
  getDocumentForNonprofit: (
    _nonprofitId: string
  ) => AdminNonprofitDocument | undefined;
  downloadDocument: (_doc: AdminNonprofitDocument) => void;
  fetchDocuments: () => Promise<void>;
}

const NonprofitsTab = ({
  nonprofits,
  approvalConfirm,
  setApprovalConfirm,
  handleApproval,
  getDocumentForNonprofit,
  downloadDocument,
  fetchDocuments,
}: NonprofitsTabProps) => {
  const pendingNonprofits = nonprofits.filter(
    (n) => n.nonprofitDocumentApproval === null && n.users.length > 0
  );
  const processedNonprofits = nonprofits.filter(
    (n) => n.nonprofitDocumentApproval !== null && n.users.length > 0
  );

  const closePopup = () =>
    setApprovalConfirm((prev) => ({ ...prev, open: false }));

  const DocumentCell = ({ nonprofitId }: { nonprofitId: string }) => {
    const document = getDocumentForNonprofit(nonprofitId);
    if (!document) return <span className='text-slate-500'>No Document</span>;
    return (
      <button
        onClick={() =>
          document.fileData ? downloadDocument(document) : fetchDocuments()
        }
        className='flex items-center text-blue-600 transition-colors hover:text-blue-800'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='mr-1 h-4 w-4'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'
          />
        </svg>
        {document.fileName}
      </button>
    );
  };

  return (
    <>
      <div className='mt-6 space-y-4'>
        <div className='flex items-center'>
          <h2 className='text-2xl font-bold capitalize text-slate-800'>
            Nonprofits
          </h2>
          <div className='ml-4 h-px flex-grow bg-slate-200'></div>
        </div>

        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-slate-50 text-left'>
                  {[
                    'Nonprofit Name',
                    'Organization Type',
                    'Document',
                    'Actions',
                    'Status',
                  ].map((header) => (
                    <th
                      key={header}
                      className='border-b border-slate-200 px-6 py-3 text-sm font-medium text-slate-700'
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Pending Approvals Section */}
                <tr>
                  <td
                    colSpan={5}
                    className='border-b border-slate-200 px-6 py-4'
                  >
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-slate-800'>
                      Pending Approvals
                      <span className='inline-flex items-center justify-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-sm font-bold text-yellow-800'>
                        {pendingNonprofits.length}
                      </span>
                    </h3>
                  </td>
                </tr>
                {pendingNonprofits.map((nonprofit, index) => (
                  <tr
                    key={nonprofit.id}
                    className={`hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                      {nonprofit.name}
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                        {nonprofit.organizationType}
                      </span>
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <DocumentCell nonprofitId={nonprofit.id} />
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() =>
                            setApprovalConfirm({
                              open: true,
                              nonprofitId: nonprofit.id,
                              nonprofitName: nonprofit.name,
                              mode: 'approve',
                            })
                          }
                          className='inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='mr-1 h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setApprovalConfirm({
                              open: true,
                              nonprofitId: nonprofit.id,
                              nonprofitName: nonprofit.name,
                              mode: 'reject',
                            })
                          }
                          className='inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='mr-1 h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'>
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Processed Approvals Section */}
                <tr>
                  <td
                    colSpan={5}
                    className='border-b border-slate-200 px-6 py-4'
                  >
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-slate-800'>
                      Processed Approvals
                      <span className='inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-bold text-slate-700'>
                        {processedNonprofits.length}
                      </span>
                    </h3>
                  </td>
                </tr>
                {processedNonprofits.map((nonprofit, index) => (
                  <tr
                    key={nonprofit.id}
                    className={`hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                      {nonprofit.name}
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                        {nonprofit.organizationType}
                      </span>
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <DocumentCell nonprofitId={nonprofit.id} />
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() =>
                            setApprovalConfirm({
                              open: true,
                              nonprofitId: nonprofit.id,
                              nonprofitName: nonprofit.name,
                              mode: nonprofit.nonprofitDocumentApproval
                                ? 'reverse-reject'
                                : 'reverse-approve',
                            })
                          }
                          className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='mr-1 h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                            />
                          </svg>
                          Reverse Status
                        </button>
                      </div>
                    </td>
                    <td className='border-b border-slate-200 px-6 py-4'>
                      {nonprofit.nonprofitDocumentApproval ? (
                        <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                          Approved
                        </span>
                      ) : (
                        <span className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'>
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ApprovalConfirmationPopup
        openPopup={approvalConfirm.open}
        closePopup={closePopup}
        nonprofitName={approvalConfirm.nonprofitName}
        mode={approvalConfirm.mode}
        onConfirm={() =>
          handleApproval(
            approvalConfirm.nonprofitId,
            approvalConfirm.mode === 'approve' ||
              approvalConfirm.mode === 'reverse-approve',
            closePopup,
            approvalConfirm.nonprofitName
          )
        }
      />
    </>
  );
};

export default NonprofitsTab;
