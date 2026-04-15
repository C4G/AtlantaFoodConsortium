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
    <div className='space-y-6'>
      <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md dark:border-border dark:bg-card'>
        <h2 className='mb-2 text-xl font-semibold text-slate-900 dark:text-foreground'>
          New Food Pick Up Request
        </h2>
        <p className='mb-6 text-sm text-slate-500 dark:text-muted-foreground'>
          Please fill out all fields to submit a new food pick up request.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          {/* Product Info Section */}
          <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
            <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
              Product Information
            </legend>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                  Product Category (Select one or more)
                </label>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
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
                  ].map(([value, label]) => {
                    const isChecked = formData.productTypes.includes(value);
                    return (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                          isChecked
                            ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-slate-600 dark:hover:bg-secondary'
                        }`}
                      >
                        <input
                          type='checkbox'
                          {...register('productTypes', {
                            required: 'Please select a category',
                          })}
                          name='productTypes'
                          id='productTypes'
                          value={value}
                          checked={isChecked}
                          onChange={() =>
                            handleProductTypeToggle(value as ItemType)
                          }
                          className='h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-200 dark:border-slate-500 dark:bg-secondary'
                        />
                        {label}
                      </label>
                    );
                  })}
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
                <span className='text-sm text-red-500'>
                  {errors.productTypes.message}
                </span>
              )}
            </div>
          </fieldset>

          {/* Pickup Details Section */}
          <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
            <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
              Pickup Details
            </legend>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
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
                className={`max-w-md rounded-md border ${errors.pickupDate ? 'border-red-500' : 'border-slate-200 dark:border-border'} bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:bg-secondary dark:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800`}
              />
              {errors.pickupDate && (
                <span className='block text-sm text-red-500'>
                  {errors.pickupDate.message}
                </span>
              )}
            </div>

            <div className='mt-6 space-y-4'>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                  What is the timeframe the product is available?
                </label>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { value: 'MORNING', label: '7 AM - 10 AM' },
                    { value: 'MID_DAY', label: '10 AM - 2 PM' },
                    { value: 'AFTERNOON', label: '2 PM - 5 PM' },
                  ].map(({ value, label }) => {
                    const isSelected = formData.availabilityTimeframe === value;
                    return (
                      <label
                        key={value}
                        htmlFor={value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-slate-600 dark:hover:bg-secondary'
                        }`}
                      >
                        <input
                          type='radio'
                          {...register('availabilityTimeframe', {
                            required: 'Please select a timeframe',
                          })}
                          id={value}
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
                {errors.availabilityTimeframe && (
                  <span className='text-sm text-red-500'>
                    {errors.availabilityTimeframe.message}
                  </span>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
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
                  className={`w-full rounded-md border ${errors.pickupLocation ? 'border-red-500' : 'border-slate-200 dark:border-border'} bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:bg-secondary dark:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800`}
                  placeholder='Enter pickup address'
                  style={{ colorScheme: 'inherit' }}
                />
              </div>
              {errors.pickupLocation && (
                <span className='text-sm text-red-500'>
                  {errors.pickupLocation.message}
                </span>
              )}
            </div>
          </fieldset>

          {/* Contact Info Section */}
          <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
            <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
              Contact Information
            </legend>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
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
                  className={`w-full rounded-md border ${errors.mainContactName ? 'border-red-500' : 'border-slate-200 dark:border-border'} bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:bg-secondary dark:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800`}
                  placeholder='Enter name'
                />
                {errors.mainContactName && (
                  <span className='text-sm text-red-500'>
                    {errors.mainContactName.message}
                  </span>
                )}
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
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
                  className={`w-full rounded-md border ${errors.mainContactNumber ? 'border-red-500' : 'border-slate-200 dark:border-border'} bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:bg-secondary dark:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800`}
                  placeholder='Enter phone number'
                />
                {errors.mainContactNumber && (
                  <span className='text-sm text-red-500'>
                    {errors.mainContactNumber.message}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Additional Info Section */}
          <fieldset className='rounded-lg border border-slate-200 p-4 dark:border-border'>
            <legend className='px-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground'>
              Additional Information
            </legend>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                Pick up instructions or other details
              </label>
              <textarea
                name='instructions'
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
                className='w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800'
                placeholder='Enter instructions...'
              />
            </div>
          </fieldset>

          <div>
            <button
              type='submit'
              className='rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-background'
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
      <PickupRequestTable
        rowData={rowData}
        deleteProductRequest={deleteProductRequest}
      />
    </div>
  );
};

export default ProductsTab;
