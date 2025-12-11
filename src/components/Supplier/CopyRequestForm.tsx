'use client';
import { useState } from 'react';
import { FormSuccessPopup } from '@/components/Supplier/FormSuccessPopup';

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
    <div>
      <div
        className='relative z-10'
        aria-labelledby='modal-title'
        role='dialog'
        aria-modal='true'
      >
        <div
          className='fixed inset-0 bg-gray-500/75 transition-opacity'
          aria-hidden='true'
        ></div>
        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0'>
            <div className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
              <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                <div>
                  <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                    <h2 className='mb-6 text-2xl font-semibold text-black'></h2>
                    <p className='mb-6 text-black'>
                      Please provide new pickup details for the food pick up
                      request you want to copy.
                    </p>
                    <form onSubmit={handleSubmit} className='space-y-8'>
                      <div className='mt-2'>
                        <fieldset className='mt-4 rounded-md border p-4'>
                          <legend className='px-2 text-lg font-semibold text-black'>
                            Product Information
                          </legend>
                          <div className='space-y-4'>
                            <div className='space-y-2'>
                              <label className='block text-sm font-medium text-black'>
                                Product Category
                              </label>
                              <input
                                type='text'
                                name='productCategory'
                                className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                                readOnly
                                value={productCategory}
                              />
                              <label className='block text-sm font-medium text-black'>
                                Item Name
                              </label>
                              <input
                                type='text'
                                name='name'
                                className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                                readOnly
                                value={productInfo.name}
                              />
                              <label className='block text-sm font-medium text-black'>
                                Item Description
                              </label>
                              <input
                                type='text'
                                name='description'
                                className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                                readOnly
                                value={productInfo.description}
                              />
                              <label className='block text-sm font-medium text-black'>
                                Quantity
                              </label>
                              <input
                                type='text'
                                name='mainContactName'
                                className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                                readOnly
                                value={`${productInfo.quantity} ${productInfo.unit}`}
                              />
                            </div>
                          </div>
                        </fieldset>

                        <fieldset className='mt-4 rounded-md border p-4'>
                          <legend className='px-2 text-lg font-semibold text-black'>
                            Pickup Details
                          </legend>
                          <div>
                            <label className='mb-2 block text-sm font-medium text-black'>
                              Pick Up By
                            </label>
                            <input
                              type='date'
                              name='pickupDate'
                              value={formData.pickupDate}
                              onChange={handleInputChange}
                              min={new Date().toISOString().split('T')[0]}
                              className='max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                            />
                          </div>

                          <div className='mt-6 space-y-4'>
                            <div>
                              <label className='mb-2 block text-sm font-medium text-slate-700'>
                                What is the timeframe the product is available?
                              </label>
                              <div className='space-y-2'>
                                <div className='flex items-center'>
                                  <input
                                    type='radio'
                                    id='MORNING'
                                    name='availabilityTimeframe'
                                    value='MORNING'
                                    checked={
                                      formData.availabilityTimeframe ===
                                      'MORNING'
                                    }
                                    onChange={handleInputChange}
                                    className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                                  />
                                  <label
                                    htmlFor='MORNING'
                                    className='ml-2 text-sm text-slate-700'
                                  >
                                    7 AM - 10 AM
                                  </label>
                                </div>
                                <div className='flex items-center'>
                                  <input
                                    type='radio'
                                    id='MID_DAY'
                                    name='availabilityTimeframe'
                                    value='MID_DAY'
                                    checked={
                                      formData.availabilityTimeframe ===
                                      'MID_DAY'
                                    }
                                    onChange={handleInputChange}
                                    className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                                  />
                                  <label
                                    htmlFor='MID_DAY'
                                    className='ml-2 text-sm text-slate-700'
                                  >
                                    10 AM - 2 PM
                                  </label>
                                </div>
                                <div className='flex items-center'>
                                  <input
                                    type='radio'
                                    id='AFTERNOON'
                                    name='availabilityTimeframe'
                                    value='AFTERNOON'
                                    checked={
                                      formData.availabilityTimeframe ===
                                      'AFTERNOON'
                                    }
                                    onChange={handleInputChange}
                                    className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                                  />
                                  <label
                                    htmlFor='AFTERNOON'
                                    className='ml-2 text-sm text-slate-700'
                                  >
                                    2 PM - 5 PM
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className='mb-2 block text-sm font-medium text-slate-700'>
                                Where does the product need to be picked up?
                              </label>
                              <input
                                type='text'
                                name='pickupLocation'
                                value={formData.pickupLocation}
                                onChange={handleInputChange}
                                className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                                placeholder='Enter pickup address'
                              />
                            </div>
                          </div>
                        </fieldset>

                        <fieldset className='mt-4 rounded-md border p-4'>
                          <legend className='px-2 text-lg font-semibold text-black'>
                            Contact Information
                          </legend>

                          <label className='mb-2 block text-sm font-medium text-slate-700'>
                            Main Contact Person&apos;s Name
                          </label>
                          <input
                            type='text'
                            name='mainContactName'
                            readOnly
                            value={productInfo.pickupInfo.contactName}
                            className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black'
                          />

                          <label className='mb-2 block text-sm font-medium text-slate-700'>
                            Main Contact Person&apos;s Phone Number
                          </label>
                          <input
                            type='tel'
                            name='mainContactNumber'
                            readOnly
                            value={productInfo.pickupInfo.contactPhone}
                            maxLength={10}
                            pattern='\d{10}'
                            inputMode='numeric'
                            className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
                          />
                        </fieldset>
                      </div>
                      <div className='mt-4 flex justify-between'>
                        <button
                          className='bg-gray-50 px-4 py-2'
                          onClick={closeRequestForm}
                        >
                          Cancel
                        </button>
                        <button
                          className='bg-green-800 px-4 py-2 text-white'
                          type='submit'
                        >
                          Save
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
