'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SuccessPopup } from '@/components/Onboarding/SuccessPopup';
import {
  NonprofitOrganizationType,
  ProteinType,
} from '../../../../types/types';

interface ProductDetails {
  type: string;
  specifics: string;
  proteinTypes: string[];
}

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
  document?: File;
  productDetails: ProductDetails[];
  productCategory: string[];
  orgType: NonprofitOrganizationType;
}

interface UserRegistrationPayload {
  name: string;
  title: string;
  email: string;
  phoneNumber: string;
  website: string;
  role: 'NONPROFIT';
  nonprofit: {
    create: {
      name: string;
      organizationType: NonprofitOrganizationType;
      coldStorageSpace: boolean;
      shelfSpace: boolean;
      donationsOrPurchases: string[];
      transportationAvailable: boolean;
      nonprofitDocument: {
        create: {
          fileName?: string;
          fileType?: string;
          fileData?: Uint8Array;
        };
      };
      nonprofitDocumentApproval: boolean;
    };
  };
  productSurvey: {
    create: {
      protein: boolean;
      proteinTypes: ProteinType[];
      otherProteinType?: string;
      produce: boolean;
      produceType?: string;
      shelfStable: boolean;
      shelfStableType?: string;
      shelfStableIndividualServing: boolean;
      shelfStableIndividualServingType?: string;
      alreadyPreparedFood: boolean;
      alreadyPreparedFoodType?: string;
      other: boolean;
      otherType?: string;
    };
  };
}

export default function NonprofitOnboardingPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: session?.user?.name || '',
    title: '',
    email: session?.user?.email || '',
    phone: '',
    website: '',
    coldStorage: '',
    shelfSpace: '',
    budget: {
      donated: false,
      purchased: false,
    },
    transportation: '',
    productCategory: [],
    productDetails: [],
    orgType: NonprofitOrganizationType.PLACEHOLDER,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.push('/');
      return;
    }

    if (session?.user?.role) {
      if (session.user.role === 'NONPROFIT') {
        router.push('/nonprofit');
      } else if (session.user.role === 'SUPPLIER') {
        router.push('/supplier');
      } else if (session.user.role === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [status, router, session]);

  useEffect(() => {
    if (session) {
      setFormData((prevState) => ({
        ...prevState,
        contactName: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, type, files } = e.target as HTMLInputElement;
    const value = e.target.value;

    if (type === 'file' && files?.[0]) {
      const file = files[0];
      const validTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
      ];

      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setFormData((prevState) => ({
        ...prevState,
        [name]: file,
      }));
    } else if (name === 'phone') {
      // Phone validation: only allow digits and limit length to 10 digits
      const digitsOnly = value.replace(/\D/g, '');
      const limitedDigits = digitsOnly.slice(0, 10);

      setFormData((prevState) => ({
        ...prevState,
        [name]: limitedDigits,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleBudgetChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      budget: {
        ...formData.budget,
        [e.target.name]: e.target.checked,
      },
    });
  };

  const handleProductChoice = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      productCategory: checked
        ? [...prevState.productCategory, value]
        : prevState.productCategory.filter((item) => item !== value),
    }));
  };

  const handleOrgType = (e: ChangeEvent<HTMLSelectElement>): void => {
    const orgValue = e.target.value as NonprofitOrganizationType;
    setFormData((prevState) => ({
      ...prevState,
      orgType: orgValue,
    }));
  };

  const handleProductInfoChange = (
    category: string,
    key: 'type' | 'specifics' | 'proteinTypes',
    value: string
  ) => {
    setFormData((prevState) => {
      const updatedDetails = [...prevState.productDetails];
      const index = updatedDetails.findIndex((item) => item.type === category);

      if (index === -1) {
        updatedDetails.push({
          type: category,
          proteinTypes: key === 'proteinTypes' ? [value] : [],
          specifics: key === 'specifics' ? value : '',
        });
      } else {
        if (key === 'proteinTypes') {
          const updatedProteinTypes = updatedDetails[
            index
          ].proteinTypes.includes(value)
            ? updatedDetails[index].proteinTypes.filter(
                (protein) => protein !== value
              )
            : [...updatedDetails[index].proteinTypes, value];

          updatedDetails[index] = {
            ...updatedDetails[index],
            proteinTypes: updatedProteinTypes,
          };
        } else {
          updatedDetails[index] = { ...updatedDetails[index], [key]: value };
        }
      }
      return { ...prevState, productDetails: updatedDetails };
    });
  };

  const mapBudgetValues = (budgetDetails: {
    donated: boolean;
    purchased: boolean;
  }): string[] => {
    const result: string[] = [];
    if (budgetDetails.donated) {
      result.push('DONATIONS');
    }
    if (budgetDetails.purchased) {
      result.push('BUDGET_TO_PURCHASE');
    }
    return result;
  };

  const mapProteinTypes = (productDetails: ProductDetails[]): ProteinType[] => {
    const proteinItem = productDetails.find((item) => item.type === 'protein');
    const proteinTypes =
      proteinItem?.proteinTypes?.map((item) => {
        if (item === 'other-protein') {
          return 'OTHER' as ProteinType;
        }
        return item.toUpperCase() as ProteinType;
      }) || [];
    return proteinTypes;
  };

  const generateFileBufferData = async (file: File): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  const generateUserRegistrationPayload = async (
    formData: FormData
  ): Promise<UserRegistrationPayload> => {
    // Process file into bytes for storage
    const file = formData.document;
    let fileData: Uint8Array | undefined;
    try {
      if (file) {
        fileData = await generateFileBufferData(file);
      }
    } catch (error) {
      console.error('Error processing nonprofit document:', error);
    }

    // Generate PATCH /api/users payload
    const userRegistrationPayload = {
      name: formData.contactName,
      title: formData.title,
      email: formData.email,
      phoneNumber: formData.phone,
      website: formData.website,
      role: 'NONPROFIT' as const,
      nonprofit: {
        create: {
          name: formData.companyName,
          organizationType: formData.orgType,
          coldStorageSpace: formData.coldStorage === 'yes' ? true : false,
          shelfSpace: formData.shelfSpace === 'yes' ? true : false,
          donationsOrPurchases: mapBudgetValues(formData.budget),
          transportationAvailable:
            formData.transportation === 'yes' ? true : false,
          nonprofitDocument: {
            create: {
              fileName: formData.document?.name,
              fileType: formData.document?.type,
              fileData: fileData,
            },
          },
          nonprofitDocumentApproval: false,
        },
      },
      productSurvey: {
        create: {
          protein: formData.productCategory.includes('protein'),
          proteinTypes: mapProteinTypes(formData.productDetails),
          otherProteinType: formData.productDetails
            .find((item) => item.type === 'protein')
            ?.proteinTypes?.includes('other-protein')
            ? formData.productDetails.find((item) => item.type === 'protein')
                ?.specifics
            : undefined,
          produce: formData.productCategory.includes('produce'),
          produceType: formData.productDetails.find(
            (item) => item.type === 'produce'
          )?.specifics,
          shelfStable: formData.productCategory.includes('shelf-stable'),
          shelfStableType: formData.productDetails.find(
            (item) => item.type === 'shelf-stable'
          )?.specifics,
          shelfStableIndividualServing:
            formData.productCategory.includes('ind-shelf-stable'),
          shelfStableIndividualServingType: formData.productDetails.find(
            (item) => item.type === 'ind-shelf-stable'
          )?.specifics,
          alreadyPreparedFood: formData.productCategory.includes('prepared'),
          alreadyPreparedFoodType: formData.productDetails.find(
            (item) => item.type === 'prepared'
          )?.specifics,
          other: formData.productCategory.includes('other'),
          otherType: formData.productDetails.find(
            (item) => item.type === 'other'
          )?.specifics,
        },
      },
    };
    return userRegistrationPayload;
  };

  const onSubmit: SubmitHandler<FormData> = async () => {
    try {
      if (!formData.document) {
        alert(
          'Please upload your 501c3 document. This is required for nonprofit registration.'
        );
        return;
      }

      const userRegistrationPayload =
        await generateUserRegistrationPayload(formData);

      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRegistrationPayload),
      });

      if (!response.ok) {
        throw new Error(
          'Failed to register nonprofit, please refresh and try again'
        );
      }

      const responseData = await response.json();

      // Send admin notification email
      try {
        const adminEmailResponse = await fetch(
          '/api/nonprofit-registration-emails',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nonprofitName: responseData.nonprofit.name,
              organizationType: responseData.nonprofit.organizationType,
              nonprofitEmail: responseData.email,
              nonprofitPhone: responseData.phoneNumber,
              nonprofitWebsite: responseData.website,
            }),
          }
        );

        if (!adminEmailResponse.ok) {
          const errorText = await adminEmailResponse.text();
          console.error('Failed to send admin notification:', errorText);
          // Continue with registration success since email is secondary
        }
      } catch (error) {
        console.error('Error sending admin notification:', error);
        // Continue with registration success since email is secondary
      }

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after success message
      setTimeout(() => {
        router.push('/nonprofit');
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <div className='w-full max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-lg'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-900'>
            Nonprofit Registration
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            {/* Organization Information Section */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <h2 className='mb-4 text-xl font-semibold text-slate-800'>
                Organization Information
              </h2>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Organization Name *
                  </label>
                  <input
                    type='text'
                    id='companyName'
                    {...register('companyName', {
                      required: 'Please provide organization name',
                    })}
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.companyName ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter organization name'
                  />
                  {errors.companyName && (
                    <span className='text-red-500'>
                      {errors.companyName.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Website *
                  </label>
                  <input
                    type='text'
                    id='website'
                    {...register('website', {
                      required: 'Please provide a URL',
                    })}
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.website ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter website URL'
                  />
                  {errors.website && (
                    <span className='text-red-500'>
                      {errors.website.message}
                    </span>
                  )}
                </div>

                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Organization Type *
                  </label>
                  <select
                    id='orgType'
                    {...register('orgType', {
                      required: 'Please select a type',
                    })}
                    value={formData.orgType}
                    onChange={handleOrgType}
                    className={`w-full rounded-md border ${errors.orgType ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                  >
                    <option value=''>Select Organization Type</option>
                    <option value='FOOD_BANK'>Food Bank</option>
                    <option value='PANTRY'>Pantry</option>
                    <option value='FOOD_RESCUE'>Food Rescue</option>
                    <option value='AGRICULTURE'>Agriculture</option>
                    <option value='STUDENT_PANTRY'>Student Pantry</option>
                    <option value='OTHER'>Other</option>
                  </select>
                  {errors.orgType && (
                    <span className='text-red-500'>
                      {errors.orgType.message}
                    </span>
                  )}
                </div>

                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Upload 501c3 Document *
                  </label>
                  <input
                    type='file'
                    {...register('document', {
                      required: 'Please upload a 5013c document',
                    })}
                    name='document'
                    accept='.pdf,.png,.jpg,.jpeg'
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.document ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                  />
                  <p className='mt-1 text-sm text-slate-500'>
                    Accepted formats: PDF, PNG, JPG, JPEG (Max 5MB)
                  </p>

                  {errors.document && (
                    <span className='text-red-500'>
                      {errors.document.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <h2 className='mb-4 text-xl font-semibold text-slate-800'>
                Contact Information
              </h2>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Contact Name *
                  </label>
                  <input
                    type='text'
                    id='contactName'
                    {...register('contactName', {
                      required: 'Please provide a name',
                    })}
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.contactName ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter contact name'
                  />
                  {errors.contactName && (
                    <span className='text-red-500'>
                      {errors.contactName.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Title *
                  </label>
                  <input
                    type='text'
                    id='title'
                    {...register('title', {
                      required: 'Please provide a title',
                    })}
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter title'
                  />
                  {errors.title && (
                    <span className='text-red-500'>{errors.title.message}</span>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Email *
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={formData.email}
                    {...register('email', {
                      required: 'Please provide an email address',
                    })}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter email address'
                  />
                  {errors.email && (
                    <span className='text-red-500'>{errors.email.message}</span>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Phone Number *
                  </label>
                  <input
                    type='tel'
                    // name='phone'
                    id='phone'
                    value={formData.phone}
                    {...register('phone', {
                      required: 'Please provide a phone number',
                    })}
                    onChange={handleInputChange}
                    // className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
                    className={`w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter phone number (digits only)'
                    pattern='[0-9]{9,10}'
                    title='Phone number must be 9-10 digits'
                  />
                  {formData.phone &&
                    (formData.phone.length < 9 ||
                      formData.phone.length > 10) && (
                      <p className='mt-1 text-sm text-red-500'>
                        Phone number must be 9-10 digits
                      </p>
                    )}

                  {errors.phone && (
                    <span className='text-red-500'>{errors.phone.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Resources & Capabilities Section */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <h2 className='mb-4 text-xl font-semibold text-slate-800'>
                Resources & Capabilities
              </h2>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
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

                <div>
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

                <div>
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

                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Funding Sources (Check all that apply)
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
              </div>
            </div>

            {/* Product Interests Section */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <h2 className='mb-4 text-xl font-semibold text-slate-800'>
                Product Interests
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    What product categories are you interested in receiving?
                  </label>
                  <div className='grid gap-2 md:grid-cols-2'>
                    {[
                      ['protein', 'Protein'],
                      ['produce', 'Produce'],
                      ['shelf-stable', 'Shelf-Stable Food'],
                      ['ind-shelf-stable', 'Individual Shelf-Stable Food'],
                      ['prepared', 'Already Prepared Food'],
                      ['other', 'Other'],
                    ].map(([value, label]) => (
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

                {/* Render product interest details for selected categories */}
                {formData.productCategory.length > 0 && (
                  <div className='mt-4 rounded-md border border-slate-200 bg-white p-4'>
                    <h3 className='mb-3 text-lg font-medium text-slate-800'>
                      Specify Your Product Interests
                    </h3>

                    <div className='space-y-4'>
                      {formData.productCategory.map((category: string) => (
                        <div
                          key={category}
                          className='rounded-md border border-slate-100 bg-slate-50 p-3'
                        >
                          <label className='mb-2 block text-sm font-medium text-slate-700'>
                            {category === 'protein'
                              ? 'What types of protein are you interested in?'
                              : `What specific ${category.replace('-', ' ')} products are you interested in?`}
                          </label>
                          {category === 'protein' ? (
                            <div className='grid gap-2 text-slate-700 md:grid-cols-2'>
                              {[
                                'beef',
                                'poultry',
                                'seafood',
                                'other-protein',
                              ].map((protein: string) => (
                                <label
                                  key={protein}
                                  className='flex items-center'
                                >
                                  <input
                                    type='checkbox'
                                    checked={
                                      formData.productDetails
                                        .find(
                                          (item: ProductDetails) =>
                                            item.type === category
                                        )
                                        ?.proteinTypes.includes(protein) ||
                                      false
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
                                    : protein.charAt(0).toUpperCase() +
                                      protein.slice(1)}
                                </label>
                              ))}
                              {formData.productDetails
                                .find(
                                  (item: ProductDetails) =>
                                    item.type === category
                                )
                                ?.proteinTypes.includes('other-protein') && (
                                <div className='col-span-2 mt-2'>
                                  <label className='mb-1 block text-sm text-slate-700'>
                                    Please specify other protein type:
                                  </label>
                                  <input
                                    type='text'
                                    placeholder='Specify other protein type'
                                    value={
                                      formData.productDetails.find(
                                        (item: ProductDetails) =>
                                          item.type === category
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
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <input
                                type='text'
                                placeholder={`Please specify your ${category.replace('-', ' ')} interests...`}
                                value={
                                  formData.productDetails.find(
                                    (item: ProductDetails) =>
                                      item.type === category
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
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={() => router.push('/onboarding')}
                className='rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
              >
                Back
              </button>

              <button
                type='submit'
                className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Register as Nonprofit
              </button>
            </div>

            <SuccessPopup
              userType='nonprofit'
              openPopup={showSuccessMessage}
              closePopup={() => setShowSuccessMessage(false)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
