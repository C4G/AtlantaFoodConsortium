'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import {
  ItemType,
  MeasurementUnit,
  PickupTimeframe,
  ProteinType,
  ProductRequest,
  Supplier,
} from '../../../../types/types';
import { FormData, ProductDetails, initialFormState } from '../_types';

interface UseSupplierFormOptions {
  supplierDetails: Supplier | null;
  setProductRequests: React.Dispatch<React.SetStateAction<ProductRequest[]>>;
  refreshMetrics: (_supplierId: string) => Promise<void>;
  setActiveTab: (_tab: 'overview' | 'products') => void;
}

const useSupplierForm = ({
  supplierDetails,
  setProductRequests,
  refreshMetrics,
  setActiveTab,
}: UseSupplierFormOptions) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [formData, setFormData] = useState<FormData>(initialFormState);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            } as ProductDetails,
          },
        };
      }
    });
  };

  const handleProductDetailsChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    type: string
  ) => {
    const { name, value } = e.target;
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

  const formatSnakeCase = (text: string): string => {
    return text
      .split('_')
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(' ');
  };

  const formatPayload = (data: FormData, supplierId: string | undefined) => {
    const pickupTimeframe =
      data.availabilityTimeframe.toUpperCase() as PickupTimeframe;

    return data.productTypes.map((type) => {
      const proteinTypes =
        type === ItemType.PROTEIN
          ? [
              data.productDetails[type].specifics.toUpperCase() as ProteinType,
              data.productDetails[type].condition?.toUpperCase() as ProteinType,
            ].filter(Boolean)
          : [];

      return {
        name: data.productDetails[type].name,
        unit: data.productDetails[type].units,
        quantity: parseInt(data.productDetails[type].quantity, 10),
        description: data.productDetails[type].description,
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
        supplier: { connect: { id: supplierId } },
        pickupInfo: {
          create: {
            pickupDate: new Date(data.pickupDate).toISOString(),
            pickupTimeframe: [pickupTimeframe],
            pickupLocation: data.pickupLocation,
            pickupInstructions: data.instructions,
            contactName: data.mainContactName,
            contactPhone: data.mainContactNumber,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create product request');

      const createdProducts = await response.json();

      for (const product of createdProducts) {
        try {
          const emailResponse = await fetch(
            '/api/product-availability-emails',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id }),
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
        }
      }

      setProductRequests((prev) => [...prev, ...createdProducts]);
      if (supplierDetails?.id) {
        await refreshMetrics(supplierDetails.id);
      }
      setActiveTab('products');
      toast({
        title: '✓ Products Listed Successfully!',
        description: `${createdProducts.length} product${createdProducts.length > 1 ? 's are' : ' is'} now visible to nonprofits.`,
        variant: 'success',
        duration: 3000,
      });
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error creating product requests:', error);
      alert('Error creating product requests');
    }
  };

  return {
    formData,
    register,
    handleSubmit,
    errors,
    handleInputChange,
    handleProductTypeToggle,
    handleProductDetailsChange,
    formatSnakeCase,
    formatPayload,
    onSubmit,
  };
};

export { useSupplierForm };
