'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SuccessPopup } from '@/components/Onboarding/SuccessPopup';
import { ProteinType } from '../../../../types/types';

interface ProductOffering {
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
  frequency: string;
  productOfferings: ProductOffering[];
  offeringCategories: string[];
}

interface UserRegistrationPayload {
  name: string;
  title: string;
  email: string;
  phoneNumber: string;
  website: string;
  role: string;
  supplier: {
    create: {
      name: string;
      cadence: string;
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

export default function SupplierOnboardingPage() {
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
    frequency: '',
    productOfferings: [],
    offeringCategories: [],
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
    const { name, value } = e.target;

    if (name === 'phone') {
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

  const mapProteinTypes = (
    productOfferings: ProductOffering[]
  ): ProteinType[] => {
    const proteinItem = productOfferings.find(
      (item) => item.type === 'protein'
    );
    const proteinTypes =
      proteinItem?.proteinTypes?.map((item) => {
        if (item === 'other-protein') {
          return 'OTHER' as ProteinType;
        }
        return item.toUpperCase() as ProteinType;
      }) || [];
    return proteinTypes;
  };

  const generateUserRegistrationPayload = async (
    formData: FormData
  ): Promise<UserRegistrationPayload> => {
    // Generate PATCH /api/users payload
    const userRegistrationPayload: UserRegistrationPayload = {
      name: formData.contactName,
      title: formData.title,
      email: formData.email,
      phoneNumber: formData.phone,
      website: formData.website,
      role: 'SUPPLIER',
      supplier: {
        create: {
          name: formData.companyName,
          cadence: formData.frequency.toUpperCase(),
        },
      },
      productSurvey: {
        create: {
          protein: formData.offeringCategories.includes('protein'),
          proteinTypes: mapProteinTypes(formData.productOfferings),
          otherProteinType: formData.productOfferings
            .find((item) => item.type === 'protein')
            ?.proteinTypes?.includes('other-protein')
            ? formData.productOfferings.find((item) => item.type === 'protein')
                ?.specifics
            : undefined,
          produce: formData.offeringCategories.includes('produce'),
          produceType: formData.productOfferings.find(
            (item) => item.type === 'produce'
          )?.specifics,
          shelfStable: formData.offeringCategories.includes('shelf-stable'),
          shelfStableType: formData.productOfferings.find(
            (item) => item.type === 'shelf-stable'
          )?.specifics,
          shelfStableIndividualServing:
            formData.offeringCategories.includes('ind-shelf-stable'),
          shelfStableIndividualServingType: formData.productOfferings.find(
            (item) => item.type === 'ind-shelf-stable'
          )?.specifics,
          alreadyPreparedFood: formData.offeringCategories.includes('prepared'),
          alreadyPreparedFoodType: formData.productOfferings.find(
            (item) => item.type === 'prepared'
          )?.specifics,
          other: formData.offeringCategories.includes('other'),
          otherType: formData.productOfferings.find(
            (item) => item.type === 'other'
          )?.specifics,
        },
      },
    };
    return userRegistrationPayload;
  };

  const onSubmit: SubmitHandler<FormData> = async () => {
    try {
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
          'Failed to register supplier, please refresh and try again'
        );
      }

      setShowSuccessMessage(true);

      // Force a session refresh before redirecting
      await fetch('/api/auth/session');

      setTimeout(() => {
        // Redirect directly to supplier dashboard
        window.location.href = '/supplier';
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleProductOfferingChoice = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      offeringCategories: checked
        ? [...prevState.offeringCategories, value]
        : prevState.offeringCategories.filter((item) => item !== value),
    }));
  };

  const handleProductInfoChange = (
    category: string,
    key: 'type' | 'specifics' | 'proteinTypes',
    value: string
  ) => {
    setFormData((prevState) => {
      const updatedOfferings = [...prevState.productOfferings];
      const index = updatedOfferings.findIndex(
        (item) => item.type === category
      );

      if (index === -1) {
        updatedOfferings.push({
          type: category,
          proteinTypes: key === 'proteinTypes' ? [value] : [],
          specifics: key === 'specifics' ? value : '',
        });
      } else {
        if (key === 'proteinTypes') {
          const updatedProteinTypes = updatedOfferings[
            index
          ].proteinTypes.includes(value)
            ? updatedOfferings[index].proteinTypes.filter(
                (protein) => protein !== value
              )
            : [...updatedOfferings[index].proteinTypes, value];

          updatedOfferings[index] = {
            ...updatedOfferings[index],
            proteinTypes: updatedProteinTypes,
          };
        } else {
          updatedOfferings[index] = {
            ...updatedOfferings[index],
            [key]: value,
          };
        }
      }
      return { ...prevState, productOfferings: updatedOfferings };
    });
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <div className='w-full max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-lg'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-900'>
            Supplier Registration
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            {/* Company Information Section */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <h2 className='mb-4 text-xl font-semibold text-slate-800'>
                Company Information
              </h2>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Company Name *
                  </label>
                  <input
                    type='text'
                    id='companyName'
                    {...register('companyName', {
                      required: 'Please provide company name',
                    })}
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.companyName ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400`}
                    placeholder='Enter company name'
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
                    Contact Name
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

                    id='phone'
                    value={formData.phone}
                    {...register('phone', {
                      required: 'Please provide a phone number',
                    })}
                    onChange={handleInputChange}
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

            {/* Product Offerings Section */}
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <h2 className='mb-4 text-xl font-semibold text-slate-800'>
                Product Offerings
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-700'>
                    What products are you able to provide?
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
                          name='offeringCategories'
                          value={value}
                          checked={formData.offeringCategories.includes(value)}
                          onChange={handleProductOfferingChoice}
                          className='mr-2'
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Render product offering details for selected categories */}
                {formData.offeringCategories.length > 0 && (
                  <div className='mt-4 rounded-md border border-slate-200 bg-white p-4'>
                    <h3 className='mb-3 text-lg font-medium text-slate-800'>
                      Specify Your Product Offerings
                    </h3>

                    <div className='space-y-4'>
                      {formData.offeringCategories.map((category: string) => (
                        <div
                          key={category}
                          className='rounded-md border border-slate-100 bg-slate-50 p-3'
                        >
                          <label className='mb-2 block text-sm font-medium text-slate-700'>
                            {category === 'protein'
                              ? 'What types of protein can you provide?'
                              : `What specific ${category.replace('-', ' ')} products can you provide?`}
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
                                      formData.productOfferings
                                        .find(
                                          (item: ProductOffering) =>
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
                              {formData.productOfferings
                                .find(
                                  (item: ProductOffering) =>
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
                                      formData.productOfferings.find(
                                        (item: ProductOffering) =>
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
                                placeholder={`Please specify your ${category.replace('-', ' ')} offerings...`}
                                value={
                                  formData.productOfferings.find(
                                    (item: ProductOffering) =>
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

                <div className='mt-4'>
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
                Register as Supplier
              </button>
            </div>

            <SuccessPopup
              userType='supplier'
              openPopup={showSuccessMessage}
              closePopup={() => setShowSuccessMessage(false)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
