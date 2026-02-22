'use client';
import {
  UseFormHandleSubmit,
  UseFormRegister,
  FieldErrors,
  SubmitHandler,
} from 'react-hook-form';
import { ItemType } from '../../../../types/types';
import { PickupRequestTable } from '@/components/Supplier/PickupRequestTable';
import ProductDetailsInputs from './ProductDetailsInputs';
import { FormData, SupplierRowData } from '../_types';

interface ProductsTabProps {
  rowData: SupplierRowData[];
  deleteProductRequest: (_prodId: string) => Promise<void>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: SubmitHandler<FormData>;
  formData: FormData;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  handleInputChange: (
    _e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleProductTypeToggle: (_type: ItemType) => void;
  handleProductDetailsChange: (
    _e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    _type: string
  ) => void;
  formatSnakeCase: (_text: string) => string;
}

const ProductsTab = ({
  rowData,
  deleteProductRequest,
  handleSubmit,
  onSubmit,
  formData,
  register,
  errors,
  handleInputChange,
  handleProductTypeToggle,
  handleProductDetailsChange,
  formatSnakeCase,
}: ProductsTabProps) => {
  return (
    <>
      <div className='mb-8 rounded-lg bg-white p-6 shadow-sm'>
        <h2 className='mb-6 text-2xl font-semibold text-black'>
          New Food Pick Up Request
        </h2>
        <p className='mb-6 text-black'>
          Please fill out all fields to submit a new food pick up request.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          {/* Product Info Section */}
          <fieldset className='rounded-md border p-4'>
            <legend className='px-2 text-lg font-semibold text-black'>
              Product Information
            </legend>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-black'>
                  Product Category (Select one or more)
                </label>
                <div className='space-y-2'>
                  {[
                    [ItemType.PROTEIN, 'Protein'],
                    [ItemType.PRODUCE, 'Produce'],
                    [ItemType.SHELF_STABLE, 'Shelf-Stable Food'],
                    [
                      ItemType.SHELF_STABLE_INDIVIDUAL_SERVING,
                      'Individual Shelf-Stable Food',
                    ],
                    [ItemType.ALREADY_PREPARED_FOOD, 'Already Prepared Food'],
                    [ItemType.OTHER, 'Other'],
                  ].map(([value, label]) => (
                    <label key={value} className='flex items-center text-black'>
                      <input
                        type='checkbox'
                        {...register('productTypes', {
                          required: 'Please select a category',
                        })}
                        name='productTypes'
                        id='productTypes'
                        value={value}
                        checked={formData.productTypes.includes(value)}
                        onChange={() =>
                          handleProductTypeToggle(value as ItemType)
                        }
                        className='mr-2'
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <ProductDetailsInputs
                formData={formData}
                register={register}
                errors={errors}
                handleProductDetailsChange={handleProductDetailsChange}
                formatSnakeCase={formatSnakeCase}
              />
              {errors.productTypes && (
                <span className='text-red-500'>
                  {errors.productTypes.message}
                </span>
              )}
            </div>
          </fieldset>

          {/* Pickup Details Section */}
          <fieldset className='rounded-md border p-4'>
            <legend className='px-2 text-lg font-semibold text-black'>
              Pickup Details
            </legend>
            <div>
              <label className='mb-2 block text-sm font-medium text-black'>
                Pick Up By
              </label>
              <input
                type='date'
                id='pickupDate'
                {...register('pickupDate', {
                  required: 'Please provide a pickup date',
                })}
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`max-w-md rounded-md border ${errors.pickupDate ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black`}
              />
              {errors.pickupDate && (
                <span className='block text-red-500'>
                  {errors.pickupDate.message}
                </span>
              )}
            </div>

            <div className='mt-6 space-y-4'>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  What is the timeframe the product is available?
                </label>
                <div className='space-y-2'>
                  {[
                    { value: 'MORNING', label: '7 AM - 10 AM' },
                    { value: 'MID_DAY', label: '10 AM - 2 PM' },
                    { value: 'AFTERNOON', label: '2 PM - 5 PM' },
                  ].map(({ value, label }) => (
                    <div key={value} className='flex items-center'>
                      <input
                        type='radio'
                        {...register('availabilityTimeframe', {
                          required: 'Please select a timeframe',
                        })}
                        id={value}
                        name='availabilityTimeframe'
                        value={value}
                        checked={formData.availabilityTimeframe === value}
                        onChange={handleInputChange}
                        className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                      />
                      <label
                        htmlFor={value}
                        className='ml-2 text-sm text-slate-700'
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.availabilityTimeframe && (
                  <span className='text-red-500'>
                    {errors.availabilityTimeframe.message}
                  </span>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Where does the product need to be picked up?
                </label>
                <input
                  type='text'
                  {...register('pickupLocation', {
                    required: 'Please provide a pickup address',
                  })}
                  id='pickupLocation'
                  name='pickupLocation'
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border ${errors.pickupLocation ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black`}
                  placeholder='Enter pickup address'
                />
              </div>
              {errors.pickupLocation && (
                <span className='text-red-500'>
                  {errors.pickupLocation.message}
                </span>
              )}
            </div>
          </fieldset>

          {/* Contact Info Section */}
          <fieldset className='rounded-md border p-4'>
            <legend className='px-2 text-lg font-semibold text-black'>
              Contact Information
            </legend>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Main Contact Person&apos;s Name
                </label>
                <input
                  type='text'
                  {...register('mainContactName', {
                    required: 'Please provide a name',
                  })}
                  id='mainContactName'
                  name='mainContactName'
                  value={formData.mainContactName}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border ${errors.mainContactName ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black`}
                  placeholder='Enter name'
                />
                {errors.mainContactName && (
                  <span className='text-red-500'>
                    {errors.mainContactName.message}
                  </span>
                )}
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Main Contact Person&apos;s Phone Number
                </label>
                <input
                  type='tel'
                  {...register('mainContactNumber', {
                    required: 'Please provide a phone number',
                  })}
                  id='mainContactNumber'
                  name='mainContactNumber'
                  value={formData.mainContactNumber}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern='\d{10}'
                  inputMode='numeric'
                  className={`w-full rounded-md border ${errors.mainContactNumber ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-black`}
                  placeholder='Enter phone number'
                />
                {errors.mainContactNumber && (
                  <span className='text-red-500'>
                    {errors.mainContactNumber.message}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Additional Info Section */}
          <fieldset className='rounded-md border p-4'>
            <legend className='px-2 text-lg font-semibold text-black'>
              Additional Information
            </legend>
            <div>
              <label className='mb-2 block text-sm font-medium text-black'>
                Pick up instructions or other details
              </label>
              <textarea
                name='instructions'
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter instructions...'
              />
            </div>
          </fieldset>

          <div>
            <button
              type='submit'
              className='rounded-md bg-yellow-400 px-4 py-2 font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <PickupRequestTable
        rowData={rowData}
        deleteProductRequest={deleteProductRequest}
      />
    </>
  );
};

export default ProductsTab;
