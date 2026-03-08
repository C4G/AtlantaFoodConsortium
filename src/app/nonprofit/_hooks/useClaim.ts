'use client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Nonprofit, ProductRequest } from '../_types';

interface UseClaimOptions {
  nonprofit: Nonprofit | null;
  setNonprofit: React.Dispatch<React.SetStateAction<Nonprofit | null>>;
  setAvailableProducts: React.Dispatch<React.SetStateAction<ProductRequest[]>>;
  refreshMetrics: (_nonprofitId: string) => Promise<void>;
}

const useClaim = ({
  nonprofit,
  setNonprofit,
  setAvailableProducts,
  refreshMetrics,
}: UseClaimOptions) => {
  const { toast } = useToast();

  const [claimConfirm, setClaimConfirm] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({ open: false, productId: '', productName: '' });

  const [unclaimConfirm, setUnclaimConfirm] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    pickupDate: string;
  }>({ open: false, productId: '', productName: '', pickupDate: '' });

  const handleClaimProduct = async (productId: string) => {
    try {
      const response = await fetch('/api/item-availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error('Failed to claim product');

      const claimedProduct = await response.json();

      try {
        const emailResponse = await fetch(
          '/api/product-request-claimed-emails',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          }
        );
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Failed to send product claimed email:', errorText);
        }
      } catch (error) {
        console.error('Error sending product claimed email:', error);
      }

      setAvailableProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );

      if (nonprofit) {
        setNonprofit((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            productsClaimed: [
              ...prev.productsClaimed,
              {
                id: claimedProduct.id,
                name: claimedProduct.name,
                quantity: claimedProduct.quantity,
                status: claimedProduct.status,
                productType: claimedProduct.productType,
                pickupInfo: claimedProduct.pickupInfo,
              },
            ],
          };
        });
      }

      toast({
        title: '✓ Product Claimed Successfully!',
        description: `"${claimedProduct.name}" has been claimed. Please pick it up by the specified date.`,
        variant: 'success',
        duration: 3000,
      });

      if (nonprofit?.id) {
        await refreshMetrics(nonprofit.id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnclaimProduct = async (
    productId: string,
    pickupDate: string
  ) => {
    const productPickupDate = new Date(pickupDate);
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    if (productPickupDate < todaysDate) {
      toast({
        title: 'Cannot Unclaim',
        description:
          'You can no longer unclaim this product because the pickup date has passed.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch('/api/item-availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'unclaim' }),
      });

      if (!response.ok) throw new Error('Failed to unclaim product');

      const unclaimedProduct = await response.json();

      setNonprofit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          productsClaimed: prev.productsClaimed.filter(
            (product) => product.id !== productId
          ),
        };
      });

      setAvailableProducts((prev) => [...prev, unclaimedProduct]);

      if (nonprofit?.id) {
        await refreshMetrics(nonprofit.id);
      }

      toast({
        title: '✓ Product Unclaimed',
        description: `"${unclaimedProduct.name}" has been released and is now available again.`,
        variant: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    claimConfirm,
    setClaimConfirm,
    unclaimConfirm,
    setUnclaimConfirm,
    handleClaimProduct,
    handleUnclaimProduct,
  };
};

export { useClaim };
