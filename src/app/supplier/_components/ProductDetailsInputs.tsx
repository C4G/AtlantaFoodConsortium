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
      <h2 className='mb-4 text-xl font-semibold text-black'>Product Details</h2>
      {formData.productTypes.map((type) => (
        <div key={type} className='space-y-4 rounded-md border p-4'>
          <h3 className='text-lg font-medium text-black'>
            {formatSnakeCase(type)} Details
          </h3>

          <div>
            <label className='mb-2 block text-sm font-medium text-black'>
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
              className={`w-full rounded-md border ${errors?.productDetails?.[type]?.name ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder='Enter item name'
            />
            {errors?.productDetails?.[type]?.name && (
              <span className='text-red-500'>
                {errors?.productDetails?.[type]?.name.message}
              </span>
            )}
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-black'>
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
              className={`w-full rounded-md border ${errors?.productDetails?.[type]?.description ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder='Enter item description'
            />
            {errors?.productDetails?.[type]?.description && (
              <span className='text-red-500'>
                {errors?.productDetails?.[type]?.description.message}
              </span>
            )}
          </div>

          {type === ItemType.PROTEIN ? (
            <>
              <div>
                <label className='mb-2 block text-sm font-medium text-black'>
                  Protein Type
                </label>
                <select
                  name={`productDetails.${type}.specifics`}
                  value={formData.productDetails[type]?.specifics || ''}
                  onChange={(e) => handleProductDetailsChange(e, type)}
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Select type</option>
                  <option value='beef'>Beef</option>
                  <option value='seafood'>Seafood</option>
                  <option value='poultry'>Poultry</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className='flex gap-4'>
                <label className='flex items-center text-black'>
                  <input
                    type='radio'
                    name={`productDetails.${type}.condition`}
                    value='fresh'
                    checked={
                      formData.productDetails[type]?.condition === 'fresh'
                    }
                    onChange={(e) => handleProductDetailsChange(e, type)}
                    className='mr-2'
                  />
                  Fresh
                </label>
                <label className='flex items-center text-black'>
                  <input
                    type='radio'
                    name={`productDetails.${type}.condition`}
                    value='frozen'
                    checked={
                      formData.productDetails[type]?.condition === 'frozen'
                    }
                    onChange={(e) => handleProductDetailsChange(e, type)}
                    className='mr-2'
                  />
                  Frozen
                </label>
              </div>
            </>
          ) : (
            <div>
              <label className='mb-2 block text-sm font-medium text-black'>
                Specify {formatSnakeCase(type)} Type
              </label>
              <input
                type='text'
                name={`productDetails.${type}.specifics`}
                value={formData.productDetails[type]?.specifics || ''}
                onChange={(e) => handleProductDetailsChange(e, type)}
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter details...'
              />
            </div>
          )}

          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-black'>
                Measurement Units
              </label>
              <select
                name={`productDetails.${type}.units`}
                value={formData.productDetails[type]?.units || ''}
                onChange={(e) => handleProductDetailsChange(e, type)}
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {Object.values(MeasurementUnit).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-black'>
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
                className={`w-full rounded-md border ${errors?.productDetails?.[type]?.quantity ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder='Enter quantity'
              />
              {errors?.productDetails?.[type]?.quantity && (
                <span className='text-red-500'>
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
