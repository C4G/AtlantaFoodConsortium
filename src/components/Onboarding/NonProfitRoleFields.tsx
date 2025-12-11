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

interface NonProfitRoleFieldsProps {
  formData: FormData;
  handleInputChange: (_e: ChangeEvent<HTMLInputElement>) => void;
  handleBudgetChange: (_e: ChangeEvent<HTMLInputElement>) => void;
  handleProductChoice: (_e: ChangeEvent<HTMLInputElement>) => void;
  handleProductInfoChange: (
    _category: string,
    _key: 'type' | 'specifics' | 'proteinTypes',
    _value: string
  ) => void;
  handleOrgType: (_e: ChangeEvent<HTMLSelectElement>) => void;
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

export function NonProfitRoleFields({
  formData,
  handleInputChange,
  handleBudgetChange,
  handleProductChoice,
  handleProductInfoChange,
  handleOrgType,
}: NonProfitRoleFieldsProps) {
  return (
    <div>
      <div className='mt-4'>
        <label className='mb-2 block text-sm font-medium text-slate-700'>
          Upload 501c3
        </label>
        <input
          type='file'
          name='document'
          accept='.pdf,.png,.jpg,.jpeg'
          onChange={handleInputChange}
          className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
        />
        <p className='mt-1 text-sm text-slate-500'>
          Accepted formats: PDF, PNG, JPG, JPEG
        </p>
      </div>

      <div className='mt-4'>
        <label className='mb-2 block text-sm font-medium text-slate-700'>
          Organization Type
        </label>
        <select
          name='orgType'
          value={formData.orgType}
          onChange={handleOrgType}
          className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
        >
          <option value=''>Select Organization Type</option>
          <option value='FOOD_BANK'>Food Bank</option>
          <option value='PANTRY'>Pantry</option>
          <option value='FOOD_RESCUE'>Food Rescue</option>
          <option value='AGRICULTURE'>Agriculture</option>
          <option value='STUDENT_PANTRY'>Student Pantry</option>
          <option value='OTHER'>Other</option>
        </select>
      </div>

      <div className='pt-6'>
        <h2 className='mb-4 text-lg font-semibold text-slate-900'>
          Product Questions
        </h2>

        <div>
          <label className='mb-2 block text-sm font-medium text-slate-700'>
            What product category are you looking for?
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
          ))}

          <div className='mt-4'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Do you have cold storage space?
            </label>
            <div className='space-y-2'>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='coldStorageYes'
                  name='coldStorage'
                  value='yes'
                  checked={formData.coldStorage === 'yes'}
                  onChange={handleInputChange}
                  className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='coldStorageYes'
                  className='ml-2 text-sm text-slate-700'
                >
                  Yes
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='coldStorageNo'
                  name='coldStorage'
                  value='no'
                  checked={formData.coldStorage === 'no'}
                  onChange={handleInputChange}
                  className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='coldStorageNo'
                  className='ml-2 text-sm text-slate-700'
                >
                  No
                </label>
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Do you have shelf space?
            </label>
            <div className='space-y-2'>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='shelfSpaceYes'
                  name='shelfSpace'
                  value='yes'
                  checked={formData.shelfSpace === 'yes'}
                  onChange={handleInputChange}
                  className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='shelfSpaceYes'
                  className='ml-2 text-sm text-slate-700'
                >
                  Yes
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='shelfSpaceNo'
                  name='shelfSpace'
                  value='no'
                  checked={formData.shelfSpace === 'no'}
                  onChange={handleInputChange}
                  className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='shelfSpaceNo'
                  className='ml-2 text-sm text-slate-700'
                >
                  No
                </label>
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Donated goods only or a budget to purchase goods? (Check all that
              apply)
            </label>
            <div className='space-y-2'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='donated'
                  name='donated'
                  checked={formData.budget.donated}
                  onChange={handleBudgetChange}
                  className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='donated'
                  className='ml-2 text-sm text-slate-700'
                >
                  Donated goods only
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='purchased'
                  name='purchased'
                  checked={formData.budget.purchased}
                  onChange={handleBudgetChange}
                  className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='purchased'
                  className='ml-2 text-sm text-slate-700'
                >
                  Budget to purchase
                </label>
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Do you have transportation to pick up product?
            </label>
            <div className='space-y-2'>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='transportationYes'
                  name='transportation'
                  value='yes'
                  checked={formData.transportation === 'yes'}
                  onChange={handleInputChange}
                  className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='transportationYes'
                  className='ml-2 text-sm text-slate-700'
                >
                  Yes
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='radio'
                  id='transportationNo'
                  name='transportation'
                  value='no'
                  checked={formData.transportation === 'no'}
                  onChange={handleInputChange}
                  className='h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='transportationNo'
                  className='ml-2 text-sm text-slate-700'
                >
                  No
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
