'use client';

import { useMemo, useState } from 'react';
import {
  Trash2,
  Copy,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
} from 'lucide-react';
import { DeletionConfirmationPopup } from '@/components/Supplier/DeletionConfirmationPopup';
import { CopyRequestForm } from '@/components/Supplier/CopyRequestForm';
import {
  ClaimContactsModal,
  ClaimContact,
} from '@/components/Supplier/ClaimContactsModal';
import { SupplierRowData } from '@/app/supplier/_types';

type SortKey = 'foodName' | 'foodType' | 'foodStatus' | 'foodClaimer';
type SortDir = 'asc' | 'desc';

function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (_key: SortKey) => void;
}) {
  const isActive = currentKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className='cursor-pointer select-none px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-800 dark:text-muted-foreground dark:hover:text-foreground'
    >
      <div className='flex items-center gap-1'>
        {label}
        <span className='inline-flex flex-col'>
          {isActive ? (
            currentDir === 'asc' ? (
              <ChevronUp className='h-3.5 w-3.5 text-blue-600' />
            ) : (
              <ChevronDown className='h-3.5 w-3.5 text-blue-600' />
            )
          ) : (
            <ChevronsUpDown className='h-3.5 w-3.5 text-slate-300' />
          )}
        </span>
      </div>
    </th>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function PickupRequestTable({
  rowData,
  deleteProductRequest,
}: {
  rowData: SupplierRowData[];
  deleteProductRequest: (_prodId: string) => void;
}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCopyRequestForm, setShowCopyRequestForm] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsModalProduct, setContactsModalProduct] = useState('');
  const [contactsModalData, setContactsModalData] = useState<ClaimContact[]>(
    []
  );
  const [foodId, setFoodId] = useState('');
  const [foodInfo, setFoodInfo] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('foodName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Map each original product ID → its partial claim rows
  const partialClaimsMap = useMemo(() => {
    const map = new Map<string, SupplierRowData[]>();
    for (const row of rowData) {
      const origId = row.prod.originalProductId;
      if (origId) {
        if (!map.has(origId)) map.set(origId, []);
        map.get(origId)!.push(row);
      }
    }
    return map;
  }, [rowData]);

  const rowToContact = (row: SupplierRowData): ClaimContact => ({
    nonprofitName: row.prod.claimingNonprofit?.name ?? null,
    contactName: row.prod.nonprofitPickupContactName,
    contactPhone: row.prod.nonprofitPickupContactPhone,
    pickupDate: row.prod.nonprofitPickupDate,
    timeframe: row.prod.nonprofitPickupTimeframe as string[],
    quantity: row.prod.quantity,
    isPartial: !!row.prod.originalProductId,
  });

  const openContactsModal = (row: SupplierRowData) => {
    const partials = partialClaimsMap.get(row.foodId);
    const contacts: ClaimContact[] =
      partials && partials.length > 0
        ? partials.map(rowToContact)
        : [rowToContact(row)];
    setContactsModalProduct(row.foodName);
    setContactsModalData(contacts);
    setShowContactsModal(true);
  };

  const confirmDeletion = (prodId: string) => {
    setShowDeleteConfirmation(true);
    setFoodId(prodId);
  };

  const duplicateRequest = (prodInfo: any) => {
    setShowCopyRequestForm(true);
    setFoodInfo(prodInfo);
  };

  const displayRows = useMemo(
    () => rowData.filter((r) => !r.prod.originalProductId),
    [rowData]
  );

  const filteredAndSorted = useMemo(() => {
    let list = displayRows;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.foodName.toLowerCase().includes(q) ||
          r.foodType.toLowerCase().includes(q) ||
          r.foodStatus.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey]);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [displayRows, searchQuery, sortKey, sortDir]);

  return (
    <div className='h-full w-full'>
      <div className='rounded-lg border border-slate-200 bg-white shadow-md dark:border-border dark:bg-card'>
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-border sm:px-6'>
          <h3 className='text-lg font-semibold text-slate-800 dark:text-foreground'>
            Pickup Request History
          </h3>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Search requests...'
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
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Type'
                  sortKey='foodType'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Status'
                  sortKey='foodStatus'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Recipient'
                  sortKey='foodClaimer'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <th className='px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-border'>
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-10 text-center text-slate-400'
                  >
                    {searchQuery
                      ? 'No requests match your search.'
                      : 'No pickup requests yet.'}
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((row) => (
                  <tr
                    key={row.foodId}
                    className='transition-colors hover:bg-slate-50 dark:hover:bg-secondary'
                  >
                    <td className='px-4 py-3 font-medium text-slate-900 dark:text-foreground'>
                      {row.foodName}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-secondary dark:text-muted-foreground'>
                        {row.foodType}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.foodStatus === 'AVAILABLE'
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-400 dark:ring-green-800'
                            : row.foodStatus === 'RESERVED'
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-800'
                        }`}
                      >
                        {row.foodStatus}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          row.foodClaimer === 'Claimed'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-secondary dark:text-muted-foreground'
                        }`}
                      >
                        {row.foodClaimer}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        {/* Contact button — visible when the product has been claimed
                            (full RESERVED, partial RESERVED row, or AVAILABLE with
                             partial claims pointing to it) */}
                        {(row.prod.status === 'RESERVED' ||
                          partialClaimsMap.has(row.foodId)) && (
                          <button
                            onClick={() => openContactsModal(row)}
                            className='flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300'
                          >
                            <Users className='h-3.5 w-3.5' />
                            Contact
                          </button>
                        )}
                        <button
                          onClick={() => duplicateRequest(row.prod)}
                          className='flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-foreground'
                        >
                          <Copy className='h-3.5 w-3.5' />
                          Copy
                        </button>
                        <button
                          onClick={() => confirmDeletion(row.foodId)}
                          className='flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length > 0 && (
          <div className='border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 dark:border-border'>
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
