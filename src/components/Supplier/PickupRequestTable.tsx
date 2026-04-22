'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Copy,
  Users,
} from 'lucide-react';
import { DeletionConfirmationPopup } from '@/components/Supplier/DeletionConfirmationPopup';
import { CopyRequestForm } from '@/components/Supplier/CopyRequestForm';
import {
  ClaimContactsModal,
  type ClaimContact,
} from '@/components/Supplier/ClaimContactsModal';
import { SupplierRowData } from '@/app/supplier/_types';

type SortKey = 'foodName' | 'foodType' | 'foodStatus' | 'foodClaimer';
type SortDir = 'asc' | 'desc' | null;

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  activeSortDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey | null;
  activeSortDir: SortDir;
  onSort: (_key: SortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className='flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900'
    >
      {label}
      {isActive && activeSortDir === 'asc' ? (
        <ChevronUp className='h-3.5 w-3.5' />
      ) : isActive && activeSortDir === 'desc' ? (
        <ChevronDown className='h-3.5 w-3.5' />
      ) : (
        <ChevronsUpDown className='h-3.5 w-3.5 text-slate-400' />
      )}
    </button>
  );
}

function rowToContact(row: SupplierRowData): ClaimContact {
  return {
    nonprofitName: row.prod.claimingNonprofit?.name ?? null,
    contactName: row.prod.nonprofitPickupContactName,
    contactPhone: row.prod.nonprofitPickupContactPhone,
    pickupDate: row.prod.nonprofitPickupDate,
    timeframe: row.prod.nonprofitPickupTimeframe as string[],
    quantity: row.prod.quantity,
    isPartial: !!row.prod.originalProductId,
  };
}

export function PickupRequestTable({
  rowData,
  deleteProductRequest,
}: {
  rowData: SupplierRowData[];
  deleteProductRequest: (_prodId: string) => void;
}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCopyRequestForm, setShowCopyRequestForm] = useState(false);
  const [foodId, setFoodId] = useState('');
  const [foodInfo, setFoodInfo] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsModalProduct, setContactsModalProduct] = useState('');
  const [contactsModalData, setContactsModalData] = useState<ClaimContact[]>(
    []
  );

  const confirmDeletion = (prodId: string) => {
    setShowDeleteConfirmation(true);
    setFoodId(prodId);
  };

  const duplicateRequest = (prodInfo: object) => {
    setShowCopyRequestForm(true);
    setFoodInfo(prodInfo);
  };

  // Map originalProductId → partial-claim child rows
  const partialClaimsMap = useMemo(() => {
    const map = new Map<string, SupplierRowData[]>();
    for (const row of rowData) {
      if (row.prod.originalProductId) {
        if (!map.has(row.prod.originalProductId)) {
          map.set(row.prod.originalProductId, []);
        }
        map.get(row.prod.originalProductId)!.push(row);
      }
    }
    return map;
  }, [rowData]);

  // Only show parent rows in the table
  const displayRows = useMemo(
    () => rowData.filter((r) => !r.prod.originalProductId),
    [rowData]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let rows = displayRows.filter(
      (r) =>
        r.foodName.toLowerCase().includes(q) ||
        r.foodType.toLowerCase().includes(q) ||
        r.foodStatus.toLowerCase().includes(q)
    );
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        const av = (a[sortKey] ?? '').toLowerCase();
        const bv = (b[sortKey] ?? '').toLowerCase();
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [displayRows, searchQuery, sortKey, sortDir]);

  const openContactsModal = (row: SupplierRowData) => {
    const partials = partialClaimsMap.get(row.foodId) ?? [];
    let contacts: ClaimContact[];
    if (partials.length > 0) {
      contacts = partials.map(rowToContact);
      // If the parent itself was also claimed (last chunk taken as a direct claim)
      if (row.prod.claimedById) {
        contacts.push({ ...rowToContact(row), isPartial: true });
      }
    } else {
      contacts = [rowToContact(row)];
    }
    setContactsModalProduct(row.foodName);
    setContactsModalData(contacts);
    setShowContactsModal(true);
  };

  return (
    <div className='h-full w-full'>
      <div className='mb-8 rounded-lg bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-black'>
            Pickup Request History
          </h2>
          <div className='relative max-w-xs flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Search requests…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 text-left text-xs text-slate-500'>
                <th className='py-3 pr-4'>
                  <SortableHeader
                    label='Food Item'
                    sortKey='foodName'
                    activeSortKey={sortKey}
                    activeSortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className='py-3 pr-4'>
                  <SortableHeader
                    label='Type'
                    sortKey='foodType'
                    activeSortKey={sortKey}
                    activeSortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className='py-3 pr-4'>
                  <SortableHeader
                    label='Status'
                    sortKey='foodStatus'
                    activeSortKey={sortKey}
                    activeSortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className='py-3 pr-4'>
                  <SortableHeader
                    label='Recipient'
                    sortKey='foodClaimer'
                    activeSortKey={sortKey}
                    activeSortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className='py-3 pr-4 font-medium text-slate-700'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredAndSorted.map((row) => {
                const status = row.prod.status;
                const hasPartials = partialClaimsMap.has(row.foodId);
                const fullyClaimedViaPartials =
                  hasPartials && status === 'RESERVED';
                const showContactButton = status === 'RESERVED' || hasPartials;

                return (
                  <tr key={row.foodId} className='hover:bg-slate-50'>
                    {/* Food Item */}
                    <td className='py-3 pr-4 font-medium text-slate-800'>
                      {row.foodName}
                    </td>

                    {/* Type */}
                    <td className='py-3 pr-4 text-slate-600'>{row.foodType}</td>

                    {/* Status badge */}
                    <td className='py-3 pr-4'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                          status === 'AVAILABLE'
                            ? 'bg-green-50 text-green-700 ring-green-200'
                            : status === 'RESERVED'
                              ? 'bg-blue-50 text-blue-700 ring-blue-200'
                              : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Recipient badge */}
                    <td className='py-3 pr-4'>
                      {fullyClaimedViaPartials ? (
                        <span className='inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200'>
                          Claimed
                        </span>
                      ) : hasPartials ? (
                        <span className='inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200'>
                          Partially Claimed
                        </span>
                      ) : status === 'RESERVED' ? (
                        <span className='inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200'>
                          Claimed
                        </span>
                      ) : (
                        <span className='inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200'>
                          Not claimed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className='py-3 pr-4'>
                      <div className='flex items-center gap-3'>
                        {showContactButton && (
                          <button
                            onClick={() => openContactsModal(row)}
                            title='View claimant contacts'
                            className='flex items-center gap-1 text-blue-600 hover:text-blue-800'
                          >
                            <Users className='h-3.5 w-3.5' />
                            Contacts
                          </button>
                        )}
                        <button
                          onClick={() => duplicateRequest(row.prod)}
                          className='flex items-center gap-1 text-slate-600 hover:text-slate-900'
                        >
                          <Copy className='h-3.5 w-3.5' />
                          Copy
                        </button>
                        <button
                          onClick={() => confirmDeletion(row.foodId)}
                          className='flex items-center gap-1 text-red-400 hover:text-red-600'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAndSorted.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='py-10 text-center text-sm text-slate-400'
                  >
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className='mt-4 text-xs text-slate-400'>
          Showing {filteredAndSorted.length} of {displayRows.length} requests
        </p>
      </div>

      <DeletionConfirmationPopup
        openPopup={showDeleteConfirmation}
        closePopup={() => setShowDeleteConfirmation(false)}
        foodId={foodId}
        deleteProductRequest={deleteProductRequest}
      />
      <CopyRequestForm
        showCopyRequestForm={showCopyRequestForm}
        closeRequestForm={() => setShowCopyRequestForm(false)}
        productInfo={foodInfo}
      />
      <ClaimContactsModal
        open={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        productName={contactsModalProduct}
        contacts={contactsModalData}
      />
    </div>
  );
}
