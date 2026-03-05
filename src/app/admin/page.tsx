'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Supplier,
  Nonprofit,
  ProductRequest,
  NonprofitDocument,
} from '../../../types/types';

// Extend the existing NonprofitDocument type just for this component
interface AdminNonprofitDocument extends NonprofitDocument {
  nonprofit?: { id: string; name: string; organizationType: string };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') router.replace('/');
  }, [session, status, router]);

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [documents, setDocuments] = useState<AdminNonprofitDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers/all');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch suppliers');
      }
      if (data) {
        setSuppliers(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchNonprofits = async () => {
    try {
      const response = await fetch('/api/nonprofits/all');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch nonprofits');
      }
      if (data) {
        setNonprofits(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchProductRequests = async () => {
    try {
      const response = await fetch('/api/product-requests/multiple');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product requests');
      }
      if (data) {
        setProductRequests(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/nonprofit-documents');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }
      if (data) {
        setDocuments(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchNonprofits();
    fetchProductRequests();
    fetchDocuments();
  }, []);

  const getDocumentForNonprofit = (
    nonprofitId: string
  ): AdminNonprofitDocument | undefined => {
    return documents.find((doc) => doc.nonprofit?.id === nonprofitId);
  };

  const countActiveSuppliers = (suppliers: Supplier[]): number => {
    let totalSupplierCount = 0;
    suppliers.forEach((supplier) => {
      if (supplier.users.length > 0) {
        totalSupplierCount += 1;
      }
    });
    return totalSupplierCount;
  };

  const countActiveNonprofits = (nonprofits: Nonprofit[]): number => {
    let totalNonprofitCount = 0;
    nonprofits.forEach((nonprofit) => {
      if (nonprofit.users.length > 0) {
        totalNonprofitCount += 1;
      }
    });
    return totalNonprofitCount;
  };

  const downloadDocument = (doc: AdminNonprofitDocument) => {
    const a = document.createElement('a');
    a.href = `/api/nonprofit-documents/download?id=${doc.id}`;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApproval = async (nonprofitId: string, approved: boolean) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to ${approved ? 'approve' : 'reject'} this nonprofit?`
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch('/api/nonprofits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonprofitId, approved }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
        throw new Error(errorData?.error || 'Failed to update approval status');
      } else {
        const approvalStatusResponse = await fetch(
          '/api/nonprofit-approval-status-emails',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nonprofitId, approved }),
          }
        );

        if (!approvalStatusResponse.ok) {
          const errorData = await approvalStatusResponse
            .json()
            .catch(() => null);
          console.error('Server response:', errorData);
          throw new Error(
            errorData?.error || 'Failed to update nonprofit approval status'
          );
        }
      }

      // Refresh the list to ensure we have the latest data
      await fetchNonprofits();
    } catch (error) {
      console.error('Error updating nonprofit status:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update nonprofit status'
      );
    }
  };

  // Helper function to get supplier name by ID
  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  // Helper function to get nonprofit name by ID
  const getNonprofitName = (nonprofitId: string | null): string => {
    if (!nonprofitId) return 'Not claimed';
    const nonprofit = nonprofits.find((n) => n.id === nonprofitId);
    return nonprofit ? nonprofit.name : 'Unknown';
  };

  return (
    <div className='flex min-h-screen flex-col bg-slate-50 p-6'>
      <div className='mx-auto w-full max-w-7xl'>
        <h1 className='mb-6 text-center text-3xl font-bold text-slate-900'>
          Admin Dashboard
        </h1>

        {error && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600'>
            <div className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='mr-2 h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className='sticky top-0 z-10 bg-slate-50 p-2'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {[
              {
                label: 'Suppliers',
                count: countActiveSuppliers(suppliers),
                tab: 'suppliers',
                icon: (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='mb-1 h-6 w-6 text-blue-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                ),
              },
              {
                label: 'Nonprofits',
                count: countActiveNonprofits(nonprofits),
                tab: 'nonprofits',
                icon: (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='mb-1 h-6 w-6 text-blue-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                ),
              },
              {
                label: 'Product Requests',
                count: productRequests.length,
                tab: 'productRequests',
                icon: (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='mb-1 h-6 w-6 text-blue-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                    />
                  </svg>
                ),
              },
            ].map(({ label, count, tab, icon }) => (
              <div
                key={tab}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg p-6 shadow-md transition duration-200 ${
                  activeTab === tab
                    ? 'border border-blue-200 bg-blue-50'
                    : 'border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {icon}
                <p className='text-lg font-semibold text-slate-700'>{label}</p>
                <p className='text-3xl font-bold text-slate-900'>{count}</p>
              </div>
            ))}
          </div>
        </div>
        {activeTab && (
          <div className='mt-6 space-y-4'>
            <div className='flex items-center'>
              <h2 className='text-2xl font-bold capitalize text-slate-800'>
                {activeTab}
              </h2>
              <div className='ml-4 h-px flex-grow bg-slate-200'></div>
            </div>

            <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-slate-50 text-left'>
                      {activeTab === 'suppliers' &&
                        ['Supplier Name', 'Phone', 'Email', 'Cadence'].map(
                          (header) => (
                            <th
                              key={header}
                              className='border-b border-slate-200 px-6 py-3 text-sm font-medium text-slate-700'
                            >
                              {header}
                            </th>
                          )
                        )}
                      {activeTab === 'nonprofits' &&
                        [
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
                      {activeTab === 'productRequests' &&
                        [
                          'Name',
                          'Unit',
                          'Quantity',
                          'Description',
                          'Status',
                          'Supplier',
                          'Nonprofit',
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
                    {activeTab === 'suppliers' &&
                      suppliers
                        .filter((supplier) => supplier.users.length > 0)
                        .map((supplier, index) => (
                          <tr
                            key={supplier.id}
                            className={`hover:bg-slate-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                              {supplier.name}
                            </td>
                            <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                              {supplier.users[0]?.phoneNumber || 'N/A'}
                            </td>
                            <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                              {supplier.users[0]?.email || 'N/A'}
                            </td>
                            <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                              {supplier.cadence}
                            </td>
                          </tr>
                        ))}
                    {activeTab === 'nonprofits' && (
                      <>
                        <tr>
                          <td
                            colSpan={5}
                            className='border-b border-slate-200 px-6 py-4'
                          >
                            <h3 className='text-lg font-semibold text-slate-800'>
                              Pending Approvals
                            </h3>
                          </td>
                        </tr>
                        {nonprofits
                          .filter(
                            (nonprofit) =>
                              nonprofit.nonprofitDocumentApproval === null &&
                              nonprofit.users.length > 0
                          )
                          .map((nonprofit, index) => {
                            const document = getDocumentForNonprofit(
                              nonprofit.id
                            );
                            return (
                              <tr
                                key={nonprofit.id}
                                className={`hover:bg-slate-50 ${
                                  index % 2 === 0
                                    ? 'bg-white'
                                    : 'bg-slate-50/30'
                                }`}
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
                                  {document ? (
                                    <button
                                      onClick={() => downloadDocument(document)}
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
                                  ) : (
                                    <span className='text-slate-500'>
                                      No Document
                                    </span>
                                  )}
                                </td>
                                <td className='border-b border-slate-200 px-6 py-4'>
                                  <div className='flex space-x-2'>
                                    {!nonprofit.nonprofitDocumentApproval && (
                                      <button
                                        onClick={() =>
                                          handleApproval(nonprofit.id, true)
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
                                    )}
                                    <button
                                      onClick={() =>
                                        handleApproval(nonprofit.id, false)
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
                            );
                          })}

                        {/* Processed Section */}
                        <tr>
                          <td
                            colSpan={5}
                            className='border-b border-slate-200 px-6 py-4'
                          >
                            <h3 className='text-lg font-semibold text-slate-800'>
                              Processed Approvals
                            </h3>
                          </td>
                        </tr>
                        {nonprofits
                          .filter(
                            (nonprofit) =>
                              nonprofit.nonprofitDocumentApproval !== null &&
                              nonprofit.users.length > 0
                          )
                          .map((nonprofit, index) => {
                            const document = getDocumentForNonprofit(
                              nonprofit.id
                            );
                            return (
                              <tr
                                key={nonprofit.id}
                                className={`hover:bg-slate-50 ${
                                  index % 2 === 0
                                    ? 'bg-white'
                                    : 'bg-slate-50/30'
                                }`}
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
                                  {document ? (
                                    <button
                                      onClick={() => downloadDocument(document)}
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
                                  ) : (
                                    <span className='text-slate-500'>
                                      No Document
                                    </span>
                                  )}
                                </td>
                                <td className='border-b border-slate-200 px-6 py-4'>
                                  <div className='flex space-x-2'>
                                    <button
                                      onClick={() =>
                                        handleApproval(
                                          nonprofit.id,
                                          !nonprofit.nonprofitDocumentApproval
                                        )
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
                            );
                          })}
                      </>
                    )}

                    {activeTab === 'productRequests' &&
                      productRequests.map((product, index) => (
                        <tr
                          key={product.id}
                          className={`hover:bg-slate-50 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                            <span className='inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800'>
                              {product.name}
                            </span>
                          </td>
                          <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                            {product.unit}
                          </td>
                          <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                            {product.quantity}
                          </td>
                          <td className='max-w-xs truncate border-b border-slate-200 px-6 py-4 text-slate-800'>
                            {product.description}
                          </td>
                          <td className='border-b border-slate-200 px-6 py-4'>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                String(product.status) === 'AVAILABLE'
                                  ? 'bg-green-100 text-green-800'
                                  : String(product.status) === 'RESERVED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : String(product.status) === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                            {getSupplierName(product.supplierId)}
                          </td>
                          <td className='border-b border-slate-200 px-6 py-4 text-slate-800'>
                            {getNonprofitName(product.claimedById)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
