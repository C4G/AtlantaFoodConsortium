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
    maxQuantity: number;
    unit: string;
  }>({ open: false, productId: '', productName: '', maxQuantity: 0, unit: '' });

  const [unclaimConfirm, setUnclaimConfirm] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    pickupDate: string;
  }>({ open: false, productId: '', productName: '', pickupDate: '' });

  const handleClaimProduct = async (productId: string, quantity: number) => {
    try {
      const response = await fetch('/api/item-availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantityClaimed: quantity }),
      });

      if (!response.ok) throw new Error('Failed to claim product');

      const responseData = await response.json();

      // Partial claim returns { claimed, originalProductId, remainingQuantity }
      // Full claim returns the updated product directly
      const isPartial = !!responseData.originalProductId;
      const claimedProduct = isPartial ? responseData.claimed : responseData;

      // Send supplier email notification for both full and partial claims
      // (partial claims create a real RESERVED record with a supplier to notify)
      try {
        const emailResponse = await fetch(
          '/api/product-request-claimed-emails',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: claimedProduct.id }),
          }
        );
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Failed to send product claimed email:', errorText);
        }
      } catch (error) {
        console.error('Error sending product claimed email:', error);
      }

      if (isPartial && responseData.remainingQuantity > 0) {
        // Partial claim with quantity still available: update the displayed quantity
        setAvailableProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? { ...product, quantity: responseData.remainingQuantity }
              : product
          )
        );
      } else {
        // Full claim, or a partial claim that consumed all remaining quantity:
        // remove the product from the available list entirely.
        setAvailableProducts((prev) =>
          prev.filter((product) => product.id !== productId)
        );
      }

      // Both full and partial claims update My Claims.
      // For partial claims, merge quantity into the existing entry if this claim ID is already known.
      if (nonprofit) {
        setNonprofit((prev) => {
          if (!prev) return prev;
          if (isPartial) {
            const alreadyExists = prev.productsClaimed.some(
              (p) => p.id === claimedProduct.id
            );
            if (alreadyExists) {
              return {
                ...prev,
                productsClaimed: prev.productsClaimed.map((p) =>
                  p.id === claimedProduct.id
                    ? { ...p, quantity: claimedProduct.quantity }
                    : p
                ),
              };
            }
          }
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

      if (isPartial) {
        toast({
          title: '✓ Partial Claim Submitted!',
          description: `You claimed ${quantity} of "${claimedProduct.name}". The remaining ${responseData.remainingQuantity} ${claimedProduct.unit} are still available.`,
          variant: 'success',
          duration: 4000,
        });
      } else {
        toast({
          title: '✓ Product Claimed Successfully!',
          description: `"${claimedProduct.name}" has been fully claimed. Please pick it up by the specified date.`,
          variant: 'success',
          duration: 3000,
        });
      }

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

      const responseData = await response.json();

      // Remove the claimed record from My Claims regardless of claim type
      setNonprofit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          productsClaimed: prev.productsClaimed.filter(
            (product) => product.id !== productId
          ),
        };
      });

      if (responseData.merged) {
        // Partial unclaim: update the original product's displayed quantity in the available list
        setAvailableProducts((prev) =>
          prev.map((product) =>
            product.id === responseData.originalProductId
              ? { ...product, quantity: responseData.updatedQuantity }
              : product
          )
        );
      } else {
        // Full unclaim: add the restored product back to the available list
        setAvailableProducts((prev) => [...prev, responseData]);
      }

      if (nonprofit?.id) {
        await refreshMetrics(nonprofit.id);
      }

      toast({
        title: '✓ Product Unclaimed',
        description: responseData.merged
          ? `Your portion has been released back to the available pool.`
          : `"${responseData.name}" has been released and is now available again.`,
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
