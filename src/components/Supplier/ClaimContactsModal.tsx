'use client';
import { X, User, Phone, CalendarDays, Clock, Package } from 'lucide-react';

export interface ClaimContact {
  nonprofitName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  pickupDate: Date | string | null;
  timeframe: string[];
  quantity: number;
  isPartial: boolean;
}

interface ClaimContactsModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  contacts: ClaimContact[];
}

const TIMEFRAME_LABELS: Record<string, string> = {
  MORNING: '7–10 AM',
  MID_DAY: '10 AM–2 PM',
  AFTERNOON: '2–5 PM',
};

export function ClaimContactsModal({
  open,
  onClose,
  productName,
  contacts,
}: ClaimContactsModalProps) {
  if (!open) return null;

  return (
    <div
      className='relative z-50'
      role='dialog'
      aria-modal='true'
      aria-labelledby='contacts-modal-title'
    >
      <div
        className='fixed inset-0 bg-black/50 transition-opacity dark:bg-black/70'
        aria-hidden='true'
        onClick={onClose}
      />
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div className='relative w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-card'>
          {/* Header */}
          <div className='flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-border'>
            <div>
              <h2
                id='contacts-modal-title'
                className='text-lg font-semibold text-slate-900 dark:text-foreground'
              >
                Claimant Contacts
              </h2>
              <p className='mt-0.5 text-sm text-slate-500 dark:text-muted-foreground'>
                {productName}
              </p>
            </div>
            <button
              onClick={onClose}
              className='ml-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-secondary dark:hover:text-foreground'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* Contact cards */}
          <div className='max-h-[60vh] space-y-3 overflow-y-auto px-6 py-4'>
            {contacts.length === 0 ? (
              <p className='py-6 text-center text-sm text-slate-400'>
                No contact information available.
              </p>
            ) : (
              contacts.map((c, i) => (
                <div
                  key={i}
                  className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-border dark:bg-secondary/40'
                >
                  {/* Org name + badge */}
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-medium text-slate-800 dark:text-foreground'>
                      {c.nonprofitName ?? 'Unknown Organization'}
                    </span>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                        c.isPartial
                          ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-800'
                          : 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                      }`}
                    >
                      {c.isPartial ? 'Partial Claim' : 'Full Claim'}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    {/* Contact name */}
                    <div className='flex items-start gap-2'>
                      <User className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-400 dark:text-muted-foreground'>
                          Contact Name
                        </p>
                        <p className='text-slate-700 dark:text-foreground'>
                          {c.contactName ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Contact phone */}
                    <div className='flex items-start gap-2'>
                      <Phone className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-400 dark:text-muted-foreground'>
                          Phone
                        </p>
                        <p className='text-slate-700 dark:text-foreground'>
                          {c.contactPhone ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className='flex items-start gap-2'>
                      <Package className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-400 dark:text-muted-foreground'>
                          Quantity Claimed
                        </p>
                        <p className='text-slate-700 dark:text-foreground'>
                          {c.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Pickup date */}
                    <div className='flex items-start gap-2'>
                      <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-400 dark:text-muted-foreground'>
                          Pickup Date
                        </p>
                        <p className='text-slate-700 dark:text-foreground'>
                          {c.pickupDate
                            ? new Date(c.pickupDate).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeframe */}
                  {c.timeframe.length > 0 && (
                    <div className='flex items-start gap-2 text-sm'>
                      <Clock className='mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-400 dark:text-muted-foreground'>
                          Time Window
                        </p>
                        <p className='text-slate-700 dark:text-foreground'>
                          {c.timeframe
                            .map((t) => TIMEFRAME_LABELS[t] ?? t)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className='flex justify-end border-t border-slate-200 px-6 py-3 dark:border-border'>
            <button
              onClick={onClose}
              className='rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:hover:bg-secondary/80'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
