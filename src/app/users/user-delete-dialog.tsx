'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { User } from '@prisma/client';

interface UserDeleteDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onConfirm: () => void;
}

export const UserDeleteDialog = ({
  user,
  open,
  onOpenChange,
  onConfirm,
}: UserDeleteDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong>{user.name || user.email}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <p className='font-medium text-destructive'>
            ⚠️ Warning: This action cannot be undone.
          </p>
          <p className='text-sm text-muted-foreground'>
            This will permanently delete the user and all associated data
            including:
          </p>
          <ul className='list-inside list-disc text-sm text-muted-foreground'>
            <li>Supplier information (if applicable)</li>
            <li>Nonprofit information (if applicable)</li>
            <li>Product surveys</li>
            <li>All associated records</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
