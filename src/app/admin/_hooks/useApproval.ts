import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApprovalMode } from '../_types';

interface ApprovalConfirmState {
  open: boolean;
  nonprofitId: string;
  nonprofitName: string;
  mode: ApprovalMode;
}

interface UseApprovalOptions {
  fetchNonprofits: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

const useApproval = ({
  fetchNonprofits,
  fetchAnalytics,
}: UseApprovalOptions) => {
  const { toast } = useToast();

  const [approvalConfirm, setApprovalConfirm] = useState<ApprovalConfirmState>({
    open: false,
    nonprofitId: '',
    nonprofitName: '',
    mode: 'approve',
  });

  const handleApproval = useCallback(
    async (
      nonprofitId: string,
      approved: boolean,
      closePopup?: () => void,
      nonprofitName?: string
    ) => {
      try {
        const response = await fetch('/api/nonprofits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nonprofitId, approved }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || 'Failed to update approval status'
          );
        }

        const approvalStatusResponse = await fetch(
          '/api/nonprofit-approval-status-emails',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nonprofitId, approved }),
          }
        );

        if (!approvalStatusResponse.ok) {
          const errorData = await approvalStatusResponse
            .json()
            .catch(() => null);
          throw new Error(errorData?.error || 'Failed to send approval email');
        }

        await Promise.all([fetchNonprofits(), fetchAnalytics()]);

        toast({
          title: approved ? '✓ Nonprofit Approved' : '✓ Nonprofit Rejected',
          description: approved
            ? `${nonprofitName ? `"${nonprofitName}" has` : 'The nonprofit has'} been approved and notified via email.`
            : `${nonprofitName ? `"${nonprofitName}" has` : 'The nonprofit has'} been rejected and notified via email.`,
          variant: approved ? 'success' : 'destructive',
          duration: 3000,
        });

        closePopup?.();
      } catch (error) {
        console.error('Error updating nonprofit status:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update nonprofit status',
          variant: 'destructive',
          duration: 3000,
        });
        closePopup?.();
      }
    },
    [fetchNonprofits, fetchAnalytics, toast]
  );

  return { approvalConfirm, setApprovalConfirm, handleApproval };
};

export { useApproval };
