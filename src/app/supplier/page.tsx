'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  ProductRequest,
  Supplier,
  PickupTimeframe,
  MeasurementUnit,
  ItemType,
  ProteinType,
  ProductType,
} from '../../../types/types';
import { FormSuccessPopup } from '@/components/Supplier/FormSuccessPopup';
import { PickupRequestTable } from '@/components/Supplier/PickupRequestTable';

interface ProductDetails {
  specifics: string;
  condition?: 'frozen' | 'fresh' | '';
  units: MeasurementUnit;
  quantity: string;
  name: string;
  description: string;
}

interface FormData {
  productTypes: string[];
  productDetails: {
    [key: string]: ProductDetails;
  };
  pickupDate: string;
  pickupLocation: string;
  availabilityTimeframe: string;
  mainContactName: string;
  mainContactNumber: string;
  instructions: string;
}

const initialFormState: FormData = {
  productTypes: [],
  productDetails: {},
  pickupDate: '',
  pickupLocation: '',
  availabilityTimeframe: '',
  mainContactName: '',
  mainContactNumber: '',
  instructions: '',
};

export default function SupplierDashboard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [supplierDetails, setSupplierDetails] = useState<Supplier | null>(null);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session || session.user.role !== 'SUPPLIER') {
      router.replace('/');
      return;
    }

    const loadSupplierData = async () => {
      try {
        const res = await fetch(`/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await res.json();
        setSupplierDetails(userData.supplier);

        const productRes = await fetch(
          `/api/product-requests?supplierId=${userData.supplier.id}`
        );
        if (!productRes.ok) {
          throw new Error('Failed to fetch product requests');
        }
        const productData = await productRes.json();
        setProductRequests(productData);
      } catch (error) {
        console.error('Error loading supplier data:', error);
      }
    };
    loadSupplierData();
  }, [session, status, router]);

  //find the type of food based on what's set to true
  const findFoodType = (productType: ProductType): string => {
    if (productType.protein) return 'PROTEIN';
    if (productType.produce) return 'PRODUCE';
    if (productType.shelfStable) return 'SHELF_STABLE';
    if (productType.shelfStableIndividualServing)
      return 'SHELF_STABLE_INDIVIDUAL_SERVING';
    if (productType.alreadyPreparedFood) return 'ALREADY_PREPARED_FOOD';
    if (productType.other) return 'OTHER';
    return '';
  };

  const neededData = useMemo(() => {
    return productRequests.map((item) => ({
      foodName: item.name,
      foodType: findFoodType(item.productType),
      foodStatus: item.status,

      foodClaimer: item.claimedById ? 'Claimed' : 'Not claimed',
      foodId: item.id,
      supplierId: item.supplierId,
      prod: item,
    }));
  }, [productRequests]);

  useEffect(() => {
    setRowData(neededData);
  }, [neededData]);
  // deleting product request based on id

  const deleteProductRequest = async (prodId: string) => {
    try {
      const deletionResponse = await fetch(`/api/product-requests`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            id: prodId,
          },
        }),
      });
      if (!deletionResponse.ok) {
        throw new Error('Failed to delete product requests');
      }
      window.location.reload();
    } catch (error) {
      console.error('Error loading supplier data:', error);
    }
  };

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

  const handleProductTypeToggle = (type: ItemType) => {
    setFormData((prev) => {
      const exists = prev.productTypes.includes(type);
      if (exists) {
        const newProductTypes = prev.productTypes.filter((t) => t !== type);
        const newProductDetails = { ...prev.productDetails };
        delete newProductDetails[type];
        return {
          ...prev,
          productTypes: newProductTypes,
          productDetails: newProductDetails,
        };
      } else {
        return {
          ...prev,
          productTypes: [...prev.productTypes, type],
          productDetails: {
            ...prev.productDetails,
            [type]: {
              specifics: '',
              condition: type === ItemType.PROTEIN ? 'fresh' : '',
              units: MeasurementUnit.POUNDS,
              quantity: '',
              name: '',
              description: '',
            },
          },
        };
      }
    });
  };

  // Handle changes in the product details inputs
  const handleProductDetailsChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    type: string
  ) => {
    const { name, value } = e.target;
    // The key is the last part of the input name (e.g., 'specifics', 'condition', 'units', or 'quantity')
    const key = name.split('.').pop() as
      | 'specifics'
      | 'condition'
      | 'units'
      | 'quantity'
      | 'name'
      | 'description';
    setFormData((prev) => ({
      ...prev,
      productDetails: {
        ...prev.productDetails,
        [type]: {
          ...prev.productDetails[type],
          [key]: key === 'units' ? (value as MeasurementUnit) : value,
        },
      },
    }));
  };

  const formatPayload = (
    formData: FormData,
    supplierId: string | undefined
  ) => {
    const pickupTimeframe =
      formData.availabilityTimeframe.toUpperCase() as PickupTimeframe;

    return formData.productTypes.map((type) => {
      const proteinTypes =
        type === ItemType.PROTEIN
          ? [
              formData.productDetails[
                type
              ].specifics.toUpperCase() as ProteinType,
              formData.productDetails[
                type
              ].condition?.toUpperCase() as ProteinType,
            ].filter(Boolean)
          : [];

      return {
        name: formData.productDetails[type].name,
        unit: formData.productDetails[type].units,
        quantity: parseInt(formData.productDetails[type].quantity, 10),
        description: formData.productDetails[type].description,
        productType: {
          create: {
            protein: type === ItemType.PROTEIN,
            produce: type === ItemType.PRODUCE,
            shelfStable: type === ItemType.SHELF_STABLE,
            shelfStableIndividualServing:
              type === ItemType.SHELF_STABLE_INDIVIDUAL_SERVING,
            alreadyPreparedFood: type === ItemType.ALREADY_PREPARED_FOOD,
            other: type === ItemType.OTHER,
            proteinTypes: proteinTypes,
          },
        },
        status: 'AVAILABLE',
        supplier: {
          connect: {
            id: supplierId,
          },
        },
        pickupInfo: {
          create: {
            pickupDate: new Date(formData.pickupDate).toISOString(),
            pickupTimeframe: [pickupTimeframe],
            pickupLocation: formData.pickupLocation,
            pickupInstructions: formData.instructions,
            contactName: formData.mainContactName,
            contactPhone: formData.mainContactNumber,
          },
        },
      };
    });
  };

  const onSubmit: SubmitHandler<FormData> = async () => {
    const payload = formatPayload(formData, supplierDetails?.id);

    try {
      const response = await fetch('/api/product-requests/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create product request');
      }

      const createdProducts = await response.json();

      // Send product availability emails for each created product
      for (const product of createdProducts) {
        try {
          const emailResponse = await fetch(
            '/api/product-availability-emails',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId: product.id,
              }),
            }
          );

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error(
              'Failed to send product availability emails:',
              errorText
            );
          }
        } catch (error) {
          console.error('Error in product availability email process:', error);
          // Continue with success message since email is secondary
        }
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        window.location.reload();
      }, 3000);
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating product requests:', error);
      alert('Error creating product requests');
    }
  };

  const formatSnakeCase = (text: string): string => {
    return text
      .split('_')
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(' ');
  };

  // Render details inputs for each selected product category
  const renderProductDetailsInputs = () => {
    if (formData.productTypes.length === 0) return null;
    return (
      <div className='space-y-6'>
        <h2 className='mb-4 text-xl font-semibold text-black'>
          Product Details
        </h2>
        {formData.productTypes.map((type) => {
          return (
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
              {type === 'PROTEIN' ? (
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

              {/* Measurement Units and Quantity Fields */}
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
                        {unit.charAt(0).toUpperCase() +
                          unit.slice(1).toLowerCase()}
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
          );
        })}
      </div>
    );
  };

  return (
    <div className='light min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4'>
          <div className='text-xl font-semibold text-black'>MAFC</div>
          {/* <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-semibold text-white'></div> */}
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8 rounded-lg bg-white p-6 shadow-sm'>
          <h2 className='mb-6 text-2xl font-semibold text-black'>
            New Food Pick Up Request
          </h2>
          <p className='mb-6 text-black'>
            Please fill out all fields to submit a new food pick up request.
          </p>
          {/* <form onSubmit={handleSubmit} className='space-y-8'> */}
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
                      <label
                        key={value}
                        className='flex items-center text-black'
                      >
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
                {renderProductDetailsInputs()}
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
                    <div className='flex items-center'>
                      <input
                        type='radio'
                        {...register('availabilityTimeframe', {
                          required: 'Please select a timeframe',
                        })}
                        id='MORNING'
                        name='availabilityTimeframe'
                        value='MORNING'
                        checked={formData.availabilityTimeframe === 'MORNING'}
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
                        {...register('availabilityTimeframe', {
                          required: 'Please select a timeframe',
                        })}
                        id='MID_DAY'
                        name='availabilityTimeframe'
                        value='MID_DAY'
                        checked={formData.availabilityTimeframe === 'MID_DAY'}
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
                        {...register('availabilityTimeframe', {
                          required: 'Please select a timeframe',
                        })}
                        id='AFTERNOON'
                        name='availabilityTimeframe'
                        value='AFTERNOON'
                        checked={formData.availabilityTimeframe === 'AFTERNOON'}
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
              <FormSuccessPopup
                openPopup={showSuccessMessage}
                closePopup={() => setShowSuccessMessage(false)}
              />
            </div>
          </form>
        </div>
        <PickupRequestTable
          rowData={rowData}
          deleteProductRequest={deleteProductRequest}
        />
      </main>
    </div>
  );
}
