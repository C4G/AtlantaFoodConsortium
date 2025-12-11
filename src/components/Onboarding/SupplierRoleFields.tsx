'use client';

import { ChangeEvent } from 'react';

interface ProductDetails {
  type: string;
  specifics: string;
  proteinTypes: string[];
}

// Update FormData to match the one in page.tsx
interface FormData {
  companyName: string;
  contactName: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  coldStorage: string;
  shelfSpace: string;
  budget: {
    donated: boolean;
    purchased: boolean;
  };
  transportation: string;
  frequency: string;
  document?: File;
  productDetails: ProductDetails[];
  productCategory: string[];
  orgType: string;
  productType: string;
}

interface SupplierRoleFieldsProps {
  formData: FormData;
  handleInputChange: (_e: ChangeEvent<HTMLInputElement>) => void;
  handleProductChoice: (_e: ChangeEvent<HTMLInputElement>) => void;
  handleProductInfoChange: (
    _category: string,
    _key: 'type' | 'specifics' | 'proteinTypes',
    _value: string
  ) => void;
}

const productCategories: [string, string][] = [
  ['protein', 'Protein'],
  ['produce', 'Produce'],
  ['shelf-stable', 'Shelf-Stable Food'],
  ['ind-shelf-stable', 'Individual Shelf-Stable Food'],
  ['prepared', 'Already Prepared Food'],
  ['other', 'Other'],
];

const productCategoryLabels = new Map<string, string>(productCategories);

export function SupplierRoleFields({
  formData,
  handleInputChange,
  handleProductChoice,
  handleProductInfoChange,
}: SupplierRoleFieldsProps) {
  return (
    <div className='pt-6'>
      <h2 className='mb-4 text-lg font-semibold text-slate-900'>
        Product Questions
      </h2>

      <div className='space-y-4'>
        <div>
          <label className='mb-2 block text-sm font-medium text-slate-700'>
            What products are you able to provide?
          </label>
          <div className='space-x-6'>
            <div className='flex flex-col space-y-3'>
              {productCategories.map(([value, label]) => (
                <label
                  key={value}
                  className='flex items-center whitespace-nowrap text-black'
                >
                  <input
                    type='checkbox'
                    name='productCategory'
                    value={value}
                    checked={formData.productCategory.includes(value)}
                    onChange={handleProductChoice}
                    className='mr-2'
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Render product details for selected categories */}
        {formData.productCategory.map((category: string) => (
          <div key={category} className='mt-4'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              {category === 'protein'
                ? 'Specify protein type:'
                : `Details for ${productCategoryLabels.get(category)}:`}
            </label>
            {category === 'protein' ? (
              <div>
                {['beef', 'poultry', 'seafood', 'other-protein'].map(
                  (protein: string) => (
                    <label
                      key={protein}
                      className='mb-2 mr-4 flex items-center text-slate-700'
                    >
                      <input
                        type='checkbox'
                        checked={
                          formData.productDetails
                            .find(
                              (item: ProductDetails) => item.type === category
                            )
                            ?.proteinTypes.includes(protein) || false
                        }
                        onChange={() =>
                          handleProductInfoChange(
                            category,
                            'proteinTypes',
                            protein
                          )
                        }
                        className='mr-2'
                      />
                      {protein === 'other-protein'
                        ? 'Other'
                        : protein.charAt(0).toUpperCase() + protein.slice(1)}
                    </label>
                  )
                )}
                {formData.productDetails
                  .find((item: ProductDetails) => item.type === category)
                  ?.proteinTypes.includes('other-protein') && (
                  <input
                    type='text'
                    placeholder='Specify other protein type'
                    value={
                      formData.productDetails.find(
                        (item: ProductDetails) => item.type === category
                      )?.specifics || ''
                    }
                    onChange={(e) =>
                      handleProductInfoChange(
                        category,
                        'specifics',
                        e.target.value
                      )
                    }
                    className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
                  />
                )}
              </div>
            ) : (
              <input
                type='text'
                placeholder={`Specify ${category} details`}
                value={
                  formData.productDetails.find(
                    (item: ProductDetails) => item.type === category
                  )?.specifics || ''
                }
                onChange={(e) =>
                  handleProductInfoChange(category, 'specifics', e.target.value)
                }
                className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
              />
            )}
          </div>
        ))}

        <div>
          <label className='mb-2 block text-sm font-medium text-slate-700'>
            How often can you provide products?
          </label>
          <div className='space-y-2'>
            <div className='flex items-center'>
              <input
                type='radio'
                id='dailyFrequency'
                name='frequency'
                value='daily'
                checked={formData.frequency === 'daily'}
                onChange={handleInputChange}
                className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='dailyFrequency'
                className='ml-2 text-sm text-slate-700'
              >
                Daily
              </label>
            </div>

            <div className='flex items-center'>
              <input
                type='radio'
                id='weeklyFrequency'
                name='frequency'
                value='weekly'
                checked={formData.frequency === 'weekly'}
                onChange={handleInputChange}
                className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='weeklyFrequency'
                className='ml-2 text-sm text-slate-700'
              >
                Weekly
              </label>
            </div>

            <div className='flex items-center'>
              <input
                type='radio'
                id='biweeklyFrequency'
                name='frequency'
                value='biweekly'
                checked={formData.frequency === 'biweekly'}
                onChange={handleInputChange}
                className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='biweeklyFrequency'
                className='ml-2 text-sm text-slate-700'
              >
                Biweekly
              </label>
            </div>

            <div className='flex items-center'>
              <input
                type='radio'
                id='monthlyFrequency'
                name='frequency'
                value='monthly'
                checked={formData.frequency === 'monthly'}
                onChange={handleInputChange}
                className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='monthlyFrequency'
                className='ml-2 text-sm text-slate-700'
              >
                Monthly
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
