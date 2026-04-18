'use client';
import { useState } from 'react';
import { FormSuccessPopup } from '@/components/Supplier/FormSuccessPopup';
import { User, Phone, CalendarDays, Clock } from 'lucide-react';

interface CopyRequestFormProps {
  showCopyRequestForm: boolean;
  closeRequestForm: () => void;
  productInfo: { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface FormData {
  pickupDate: string;
  pickupLocation: string;
  availabilityTimeframe: string;
}

export const CopyRequestForm: React.FC<CopyRequestFormProps> = ({
  productInfo,
  showCopyRequestForm,
  closeRequestForm,
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const initialFormState: FormData = {
    pickupDate: '',
    pickupLocation: '',
    availabilityTimeframe: '',
  };
  const [formData, setFormData] = useState<FormData>(initialFormState);

  // finding product category
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const productCategory = productInfo.productType
    ? Object.entries(productInfo.productType)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .find(([_key, value]) => value === true)?.[0]
    : 'None';

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //save the copied request with new date and pickup info
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.pickupLocation ||
      !formData.pickupDate ||
      !formData.availabilityTimeframe
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const neededData = {
      name: productInfo.name,
      unit: productInfo.unit,
      quantity: productInfo.quantity,
      description: productInfo.description,
      productType: {
        create: {
          protein: productInfo.productType.protein,
          produce: productInfo.productType.produce,
          shelfStable: productInfo.productType.shelfStable,
          shelfStableIndividualServing:
            productInfo.productType.shelfStableIndividualServing,
          alreadyPreparedFood: productInfo.productType.alreadyPreparedFood,
          other: productInfo.productType.other,
          proteinTypes: productInfo.productType.proteinTypes,
        },
      },
      status: 'AVAILABLE',
      supplier: {
        connect: {
          id: productInfo.supplier.id,
        },
      },
      pickupInfo: {
        create: {
          pickupDate: new Date(formData.pickupDate).toISOString(),
          pickupTimeframe: [formData.availabilityTimeframe],
          pickupLocation: formData.pickupLocation,
          pickupInstructions: productInfo.pickupInfo.pickupInstructions,
          contactName: productInfo.pickupInfo.contactName,
          contactPhone: productInfo.pickupInfo.contactPhone,
        },
      },
    };

    const payload = [neededData];
    try {
      await fetch('/api/product-requests/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      alert('Product Successfully Copied!');
      // setShowSuccessMessage(true);
      setTimeout(() => {
        // setShowSuccessMessage(false);
        window.location.reload();
      }, 500);
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating product requests:', error);
      alert('Error creating product requests');
    }
  };

  if (!showCopyRequestForm) return null;

  return (
    <div
      className='relative z-10'
      aria-labelledby='modal-title'
      role='dialog'
      aria-modal='true'
    >
      <div
        className='fixed inset-0 bg-gray-500/75 transition-opacity dark:bg-black/60'
        aria-hidden='true'
      />
      <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4 sm:p-0'>
          <div className='relative w-full transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all dark:bg-card sm:my-8 sm:max-w-2xl'>
            {/* Header */}
            <div className='border-b border-slate-200 px-6 py-5 dark:border-border'>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-foreground'>
                Copy Pickup Request
              </h2>
              <p className='mt-1 text-sm text-slate-500 dark:text-muted-foreground'>
                Provide new pickup details for the listing you want to copy.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5'>
                <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
                  <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground'>
                    Product Information
                  </legend>
                  <div className='mt-2 grid grid-cols-2 gap-x-6 gap-y-3'>
                    <div>
                      <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                        Category
                      </p>
                      <p className='font-medium text-slate-800 dark:text-foreground'>
                        {productCategory ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                        Item Name
                      </p>
                      <p className='font-medium text-slate-800 dark:text-foreground'>
                        {productInfo.name}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                        Quantity
                      </p>
                      <p className='font-medium text-slate-800 dark:text-foreground'>
                        {productInfo.quantity} {productInfo.unit}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                        Description
                      </p>
                      <p className='break-words font-medium text-slate-800 dark:text-foreground'>
                        {productInfo.description}
                      </p>
                    </div>
                  </div>
                </fieldset>

                <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
                  <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground'>
                    Pickup Details
                  </legend>
                  <div className='mt-2 space-y-4'>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                        Pick Up By
                      </label>
                      <input
                        type='date'
                        name='pickupDate'
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className='rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:focus:ring-blue-800'
                      />
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                        Available Timeframe
                      </label>
                      <div className='flex gap-3'>
                        {(
                          [
                            { value: 'MORNING', label: '7–10 AM' },
                            { value: 'MID_DAY', label: '10 AM–2 PM' },
                            { value: 'AFTERNOON', label: '2–5 PM' },
                          ] as const
                        ).map(({ value, label }) => (
                          <label
                            key={value}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                              formData.availabilityTimeframe === value
                                ? 'border-green-700 bg-green-50 font-medium text-green-800 dark:border-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : 'border-slate-300 text-slate-700 hover:border-slate-400 dark:border-border dark:text-muted-foreground dark:hover:border-slate-500'
                            }`}
                          >
                            <input
                              type='radio'
                              name='availabilityTimeframe'
                              value={value}
                              checked={formData.availabilityTimeframe === value}
                              onChange={handleInputChange}
                              className='sr-only'
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='mb-1 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                        Pickup Location
                      </label>
                      <input
                        type='text'
                        name='pickupLocation'
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:focus:ring-blue-800'
                        placeholder='Enter pickup address'
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
                  <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground'>
                    Supplier Contact
                  </legend>
                  <div className='mt-2 grid grid-cols-2 gap-4'>
                    <div className='flex items-start gap-3'>
                      <User className='mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                          Name
                        </p>
                        <p className='font-medium text-slate-800 dark:text-foreground'>
                          {productInfo.pickupInfo?.contactName ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3'>
                      <Phone className='mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-muted-foreground' />
                      <div>
                        <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                          Phone
                        </p>
                        <p className='font-medium text-slate-800 dark:text-foreground'>
                          {productInfo.pickupInfo?.contactPhone ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Nonprofit Pickup Contact — shown only when the product is already claimed */}
                {productInfo.nonprofitPickupContactName && (
                  <fieldset className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                    <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-blue-700'>
                      Nonprofit Pickup Contact
                    </legend>

                    <div className='mt-2 grid grid-cols-2 gap-4'>
                      <div className='flex items-start gap-3'>
                        <User className='mt-0.5 h-4 w-4 shrink-0 text-blue-600' />
                        <div>
                          <p className='text-xs text-slate-500'>Name</p>
                          <p className='font-medium text-slate-800'>
                            {productInfo.nonprofitPickupContactName}
                          </p>
                        </div>
                      </div>

                      {productInfo.nonprofitPickupContactPhone && (
                        <div className='flex items-start gap-3'>
                          <Phone className='mt-0.5 h-4 w-4 shrink-0 text-blue-600' />
                          <div>
                            <p className='text-xs text-slate-500'>Phone</p>
                            <p className='font-medium text-slate-800'>
                              {productInfo.nonprofitPickupContactPhone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {productInfo.nonprofitPickupDate && (
                      <div className='mt-3 flex items-start gap-3'>
                        <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-blue-600' />
                        <div>
                          <p className='text-xs text-slate-500'>Pickup Date</p>
                          <p className='font-medium text-slate-800'>
                            {new Date(
                              productInfo.nonprofitPickupDate
                            ).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {productInfo.nonprofitPickupTimeframe?.length > 0 && (
                      <div className='mt-3 flex items-start gap-3'>
                        <Clock className='mt-0.5 h-4 w-4 shrink-0 text-blue-600' />
                        <div>
                          <p className='text-xs text-slate-500'>Time Window</p>
                          <p className='font-medium text-slate-800'>
                            {productInfo.nonprofitPickupTimeframe
                              .map((t: string) =>
                                t === 'MORNING'
                                  ? '7\u201310 AM'
                                  : t === 'MID_DAY'
                                    ? '10 AM\u20132 PM'
                                    : t === 'AFTERNOON'
                                      ? '2\u20135 PM'
                                      : t
                              )
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </fieldset>
                )}
              </div>

              {/* Footer */}
              <div className='flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-border'>
                <button
                  type='button'
                  onClick={closeRequestForm}
                  className='rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:hover:bg-secondary/80'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='rounded-md bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                >
                  Save Copy
                </button>
              </div>
            </form>

            <FormSuccessPopup
              openPopup={showSuccessMessage}
              closePopup={() => setShowSuccessMessage(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
