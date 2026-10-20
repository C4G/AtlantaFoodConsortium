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

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-border bg-slate-50 dark:bg-secondary px-3 py-2 text-sm text-slate-700 dark:text-muted-foreground shadow-sm focus:border-blue-300 focus:bg-white dark:focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800';

const readonlyClass =
  'w-full rounded-md border border-slate-200 dark:border-border bg-slate-100 dark:bg-secondary/50 px-3 py-2 text-sm text-slate-500 dark:text-muted-foreground shadow-sm';

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
              <div>
                <div className='mt-3 sm:ml-4 sm:mt-0'>
                  <h2 className='mb-2 text-lg font-semibold text-slate-900 dark:text-foreground'>
                    Copy Pickup Request
                  </h2>
                  <p className='mb-6 text-sm text-slate-500 dark:text-muted-foreground'>
                    Please provide new pickup details for the food pick up
                    request you want to copy.
                  </p>
                  <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Product info (read-only) */}
                    <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
                      <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
                        Product Information
                      </legend>
                      <div className='space-y-3'>
                        <div>
                          <label className='mb-1 block text-xs font-medium text-slate-500 dark:text-muted-foreground'>
                            Product Category
                          </label>
                          <input
                            type='text'
                            readOnly
                            value={productCategory}
                            className={readonlyClass}
                          />
                        </div>
                        <div>
                          <label className='mb-1 block text-xs font-medium text-slate-500 dark:text-muted-foreground'>
                            Item Name
                          </label>
                          <input
                            type='text'
                            readOnly
                            value={productInfo.name}
                            className={readonlyClass}
                          />
                        </div>
                        <div>
                          <label className='mb-1 block text-xs font-medium text-slate-500 dark:text-muted-foreground'>
                            Description
                          </label>
                          <input
                            type='text'
                            readOnly
                            value={productInfo.description}
                            className={readonlyClass}
                          />
                        </div>
                        <div>
                          <label className='mb-1 block text-xs font-medium text-slate-500 dark:text-muted-foreground'>
                            Quantity
                          </label>
                          <input
                            type='text'
                            readOnly
                            value={`${productInfo.quantity} ${productInfo.unit}`}
                            className={readonlyClass}
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* Pickup details (editable) */}
                    <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
                      <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
                        Pickup Details
                      </legend>
                      <div className='space-y-4'>
                        <div>
                          <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                            Pick Up By
                          </label>
                          <input
                            type='date'
                            name='pickupDate'
                            value={formData.pickupDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                            Timeframe
                          </label>
                          <div className='flex flex-wrap gap-2'>
                            {[
                              { value: 'MORNING', label: '7 AM - 10 AM' },
                              { value: 'MID_DAY', label: '10 AM - 2 PM' },
                              { value: 'AFTERNOON', label: '2 PM - 5 PM' },
                            ].map(({ value, label }) => {
                              const isSelected =
                                formData.availabilityTimeframe === value;
                              return (
                                <label
                                  key={value}
                                  htmlFor={`copy-${value}`}
                                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                    isSelected
                                      ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-slate-600 dark:hover:bg-secondary'
                                  }`}
                                >
                                  <input
                                    type='radio'
                                    id={`copy-${value}`}
                                    name='availabilityTimeframe'
                                    value={value}
                                    checked={isSelected}
                                    onChange={handleInputChange}
                                    className='h-4 w-4 border-slate-300 bg-white text-blue-600 focus:ring-blue-200 dark:border-slate-500 dark:bg-secondary'
                                  />
                                  {label}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                            Pickup Location
                          </label>
                          <input
                            type='text'
                            name='pickupLocation'
                            value={formData.pickupLocation}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder='Enter pickup address'
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* Contact info (read-only) */}
                    <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
                      <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
                        Contact Information
                      </legend>
                      <div className='space-y-3'>
                        <div>
                          <label className='mb-1 block text-xs font-medium text-slate-500 dark:text-muted-foreground'>
                            Contact Name
                          </label>
                          <input
                            type='text'
                            readOnly
                            value={productInfo.pickupInfo?.contactName}
                            className={readonlyClass}
                          />
                        </div>
                        <div>
                          <label className='mb-1 block text-xs font-medium text-slate-500 dark:text-muted-foreground'>
                            Contact Phone
                          </label>
                          <input
                            type='tel'
                            readOnly
                            value={productInfo.pickupInfo?.contactPhone}
                            className={readonlyClass}
                          />
                        </div>
                      </div>
                    </fieldset>

                    <div className='flex justify-between'>
                      <button
                        type='button'
                        className='rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:hover:bg-secondary'
                        onClick={closeRequestForm}
                      >
                        Cancel
                      </button>
                      <button
                        className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        type='submit'
                      >
                        Save Copy
                      </button>
                      <FormSuccessPopup
                        openPopup={showSuccessMessage}
                        closePopup={() => setShowSuccessMessage(false)}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Nonprofit Pickup Contact — shown only when the product is already claimed */}
            {productInfo.nonprofitPickupContactName && (
              <div className='px-4 pb-4 sm:px-6'>
                <fieldset className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
                  <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400'>
                    Nonprofit Pickup Contact
                  </legend>

                  <div className='mt-2 grid grid-cols-2 gap-4'>
                    <div className='flex items-start gap-3'>
                      <User className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                      <div>
                        <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                          Name
                        </p>
                        <p className='font-medium text-slate-800 dark:text-foreground'>
                          {productInfo.nonprofitPickupContactName}
                        </p>
                      </div>
                    </div>

                    {productInfo.nonprofitPickupContactPhone && (
                      <div className='flex items-start gap-3'>
                        <Phone className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                        <div>
                          <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                            Phone
                          </p>
                          <p className='font-medium text-slate-800 dark:text-foreground'>
                            {productInfo.nonprofitPickupContactPhone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {productInfo.nonprofitPickupDate && (
                    <div className='mt-3 flex items-start gap-3'>
                      <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                      <div>
                        <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                          Pickup Date
                        </p>
                        <p className='font-medium text-slate-800 dark:text-foreground'>
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
                      <Clock className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                      <div>
                        <p className='text-xs text-slate-500 dark:text-muted-foreground'>
                          Time Window
                        </p>
                        <p className='font-medium text-slate-800 dark:text-foreground'>
                          {productInfo.nonprofitPickupTimeframe
                            .map((t: string) =>
                              t === 'MORNING'
                                ? '7–10 AM'
                                : t === 'MID_DAY'
                                  ? '10 AM–2 PM'
                                  : t === 'AFTERNOON'
                                    ? '2–5 PM'
                                    : t
                            )
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </fieldset>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
