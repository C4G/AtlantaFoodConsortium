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
    <th
      onClick={() => onSort(sortKey)}
      className='cursor-pointer select-none px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-800 dark:text-muted-foreground dark:hover:text-foreground'
    >
      <div className='flex items-center gap-1'>
        {label}
        <span className='inline-flex flex-col'>
          {isActive && activeSortDir === 'asc' ? (
            <ChevronUp className='h-3.5 w-3.5 text-blue-600' />
          ) : isActive && activeSortDir === 'desc' ? (
            <ChevronDown className='h-3.5 w-3.5 text-blue-600' />
          ) : (
            <ChevronsUpDown className='h-3.5 w-3.5 text-slate-300' />
          )}
        </span>
      </div>
    </th>
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
      <div className='mb-8 rounded-lg border border-slate-200 bg-white shadow-md dark:border-border dark:bg-card'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-border sm:px-6'>
          <h2 className='font-semibold text-slate-800 dark:text-foreground'>
            Pickup Request History
          </h2>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-muted-foreground' />
            <input
              type='text'
              placeholder='Search requests…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:placeholder:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800'
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='border-b border-slate-100 bg-slate-50/60 dark:border-border dark:bg-card/60'>
              <tr>
                <SortableHeader
                  label='Food Item'
                  sortKey='foodName'
                  activeSortKey={sortKey}
                  activeSortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Type'
                  sortKey='foodType'
                  activeSortKey={sortKey}
                  activeSortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Status'
                  sortKey='foodStatus'
                  activeSortKey={sortKey}
                  activeSortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Recipient'
                  sortKey='foodClaimer'
                  activeSortKey={sortKey}
                  activeSortDir={sortDir}
                  onSort={handleSort}
                />
                <th className='px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-border'>
              {filteredAndSorted.map((row) => {
                const status = row.prod.status;
                const hasPartials = partialClaimsMap.has(row.foodId);
                const fullyClaimedViaPartials =
                  hasPartials && status === 'RESERVED';
                const showContactButton = status === 'RESERVED' || hasPartials;

                return (
                  <tr
                    key={row.foodId}
                    className='transition-colors hover:bg-slate-50 dark:hover:bg-secondary'
                  >
                    {/* Food Item */}
                    <td className='px-4 py-3 font-medium text-slate-900 dark:text-foreground'>
                      {row.foodName}
                    </td>

                    {/* Type badge */}
                    <td className='px-4 py-3'>
                      <span className='inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-secondary dark:text-muted-foreground'>
                        {row.foodType}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                          status === 'AVAILABLE'
                            ? 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-900/40 dark:text-green-400 dark:ring-green-800'
                            : status === 'RESERVED'
                              ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                              : 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-800'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Recipient badge */}
                    <td className='px-4 py-3'>
                      {fullyClaimedViaPartials ? (
                        <span className='inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'>
                          Claimed
                        </span>
                      ) : hasPartials ? (
                        <span className='inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-800'>
                          Partially Claimed
                        </span>
                      ) : status === 'RESERVED' ? (
                        <span className='inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'>
                          Claimed
                        </span>
                      ) : (
                        <span className='inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-secondary dark:text-muted-foreground dark:ring-border'>
                          Not claimed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        {showContactButton && (
                          <button
                            onClick={() => openContactsModal(row)}
                            title='View claimant contacts'
                            className='flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                          >
                            <Users className='h-3.5 w-3.5' />
                            Contacts
                          </button>
                        )}
                        <button
                          onClick={() => duplicateRequest(row.prod)}
                          className='flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground'
                        >
                          <Copy className='h-3.5 w-3.5' />
                          Copy
                        </button>
                        <button
                          onClick={() => confirmDeletion(row.foodId)}
                          className='flex items-center gap-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'
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
                    className='px-4 py-10 text-center text-sm text-slate-400 dark:text-muted-foreground'
                  >
                    {searchQuery
                      ? 'No requests match your search.'
                      : 'No requests found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length > 0 && (
          <div className='border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 dark:border-border dark:text-muted-foreground'>
            Showing {filteredAndSorted.length} of {displayRows.length} requests
          </div>
        )}
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
