'use client';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ItemType, MeasurementUnit } from '../../../../types/types';
import { FormData } from '../_types';

interface ProductDetailsInputsProps {
  formData: FormData;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  handleProductDetailsChange: (
    _e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    _type: string
  ) => void;
  formatSnakeCase: (_text: string) => string;
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-md border ${hasError ? 'border-red-500' : 'border-slate-200 dark:border-border'} bg-slate-50 dark:bg-secondary px-3 py-2 text-sm text-slate-700 dark:text-muted-foreground shadow-sm focus:border-blue-300 focus:bg-white dark:focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800`;

const selectClass =
  'w-full rounded-md border border-slate-200 dark:border-border bg-slate-50 dark:bg-secondary px-3 py-2 text-sm text-slate-700 dark:text-muted-foreground shadow-sm focus:border-blue-300 focus:bg-white dark:focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800';

const ProductDetailsInputs = ({
  formData,
  register,
  errors,
  handleProductDetailsChange,
  formatSnakeCase,
}: ProductDetailsInputsProps) => {
  if (formData.productTypes.length === 0) return null;

  return (
    <div className='space-y-6'>
      <h2 className='mb-4 text-lg font-semibold text-slate-800 dark:text-foreground'>
        Product Details
      </h2>
      {formData.productTypes.map((type) => (
        <div
          key={type}
          className='space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-border dark:bg-card/50'
        >
          <h3 className='text-sm font-semibold text-slate-700 dark:text-muted-foreground'>
            {formatSnakeCase(type)} Details
          </h3>

          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
              Item Name
            </label>
            <input
              type='text'
              {...register(`productDetails.${type}.name`, {
                required: 'Please specify the name',
              })}
              id={`productDetails.${type}.name`}
              name={`productDetails.${type}.name`}
              value={formData.productDetails[type]?.name || ''}
              onChange={(e) => handleProductDetailsChange(e, type)}
              className={inputClass(!!errors?.productDetails?.[type]?.name)}
              placeholder='Enter item name'
            />
            {errors?.productDetails?.[type]?.name && (
              <span className='text-sm text-red-500'>
                {errors?.productDetails?.[type]?.name.message}
              </span>
            )}
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
              Item Description
            </label>
            <textarea
              {...register(`productDetails.${type}.description`, {
                required: 'Please provide a description',
              })}
              id={`productDetails.${type}.description`}
              name={`productDetails.${type}.description`}
              value={formData.productDetails[type]?.description || ''}
              onChange={(e) => handleProductDetailsChange(e, type)}
              rows={3}
              className={inputClass(
                !!errors?.productDetails?.[type]?.description
              )}
              placeholder='Enter item description'
            />
            {errors?.productDetails?.[type]?.description && (
              <span className='text-sm text-red-500'>
                {errors?.productDetails?.[type]?.description.message}
              </span>
            )}
          </div>

          {type === ItemType.PROTEIN ? (
            <>
              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                  Protein Type
                </label>
                <select
                  name={`productDetails.${type}.specifics`}
                  value={formData.productDetails[type]?.specifics || ''}
                  onChange={(e) => handleProductDetailsChange(e, type)}
                  className={selectClass}
                >
                  <option value=''>Select type</option>
                  <option value='beef'>Beef</option>
                  <option value='seafood'>Seafood</option>
                  <option value='poultry'>Poultry</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className='flex gap-2'>
                {(['fresh', 'frozen'] as const).map((condition) => {
                  const isSelected =
                    formData.productDetails[type]?.condition === condition;
                  return (
                    <label
                      key={condition}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-slate-600 dark:hover:bg-secondary'
                      }`}
                    >
                      <input
                        type='radio'
                        name={`productDetails.${type}.condition`}
                        value={condition}
                        checked={isSelected}
                        onChange={(e) => handleProductDetailsChange(e, type)}
                        className='h-4 w-4 border-slate-300 bg-white text-blue-600 focus:ring-blue-200 dark:border-slate-500 dark:bg-secondary'
                      />
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                Specify {formatSnakeCase(type)} Type
              </label>
              <input
                type='text'
                name={`productDetails.${type}.specifics`}
                value={formData.productDetails[type]?.specifics || ''}
                onChange={(e) => handleProductDetailsChange(e, type)}
                className={inputClass(false)}
                placeholder='Enter details...'
              />
            </div>
          )}

          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                Measurement Units
              </label>
              <select
                name={`productDetails.${type}.units`}
                value={formData.productDetails[type]?.units || ''}
                onChange={(e) => handleProductDetailsChange(e, type)}
                className={selectClass}
              >
                {Object.values(MeasurementUnit).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700 dark:text-muted-foreground'>
                Quantity
              </label>
              <input
                type='number'
                {...register(`productDetails.${type}.quantity`, {
                  required: 'Please specify the quantity',
                })}
                name={`productDetails.${type}.quantity`}
                id={`productDetails.${type}.quantity`}
                value={formData.productDetails[type]?.quantity || ''}
                onChange={(e) => handleProductDetailsChange(e, type)}
                min='0'
                step='1.00'
                inputMode='decimal'
                className={inputClass(
                  !!errors?.productDetails?.[type]?.quantity
                )}
                placeholder='Enter quantity'
              />
              {errors?.productDetails?.[type]?.quantity && (
                <span className='text-sm text-red-500'>
                  {errors?.productDetails?.[type]?.quantity.message}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductDetailsInputs;
