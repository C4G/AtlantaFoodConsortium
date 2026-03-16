'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  themeAlpine,
  colorSchemeDark,
  type RowValueChangedEvent,
  type ICellRendererParams,
} from 'ag-grid-community';
import type { User } from '@prisma/client';
import { useIsDarkTheme } from '@/hooks/use-is-dark-theme';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { UserDeleteDialog } from './user-delete-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import * as usersApi from './api';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  editable: true,
  flex: 1,
  minWidth: 200,
};

const createColumnDefs = (currentUserId?: string): ColDef[] => [
  { field: 'name' },
  { field: 'email' },
  {
    field: 'role',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['ADMIN', 'STAFF', 'SUPPLIER', 'NONPROFIT', 'OTHER'],
    },
    editable: (params) => params.data?.id !== currentUserId,
  },
  { field: 'id', editable: false },
  {
    field: 'createdAt',
    editable: false,
    valueFormatter: (params) =>
      params.value ? new Date(params.value).toLocaleString() : '',
  },
  {
    field: 'updatedAt',
    editable: false,
    valueFormatter: (params) =>
      params.value ? new Date(params.value).toLocaleString() : '',
  },
  {
    headerName: 'Actions',
    field: 'actions',
    cellRenderer: 'deleteButtonRenderer',
    editable: false,
    sortable: false,
    filter: false,
    flex: 0,
    width: 100,
    minWidth: 100,
    pinned: 'right',
  },
];

const UsersGrid = () => {
  const [rowData, setRowData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [effectTrigger, setEffectTrigger] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { data: session } = useSession();
  const isDarkTheme = useIsDarkTheme();

  const currentUserId = session?.user?.id;
  const columnDefs = useMemo(
    () => createColumnDefs(currentUserId),
    [currentUserId]
  );

  const agGridTheme = useMemo(
    () => (isDarkTheme ? themeAlpine.withPart(colorSchemeDark) : themeAlpine),
    [isDarkTheme]
  );

  const handleDelete = async (userId: string) => {
    try {
      await usersApi.deleteUser(userId);

      toast({
        title: 'User Deleted',
        description: 'User has been successfully deleted',
      });

      setEffectTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      handleDelete(userToDelete.id);
    }
  };

  const DeleteButtonRenderer = useCallback(
    (params: ICellRendererParams<User>) => {
      if (!params.data) return null;

      const isCurrentUser = params.data.id === currentUserId;

      const handleClick = () => {
        setUserToDelete(params.data!);
        setDeleteDialogOpen(true);
      };

      return (
        <Button
          variant='ghost'
          size='icon'
          onClick={handleClick}
          disabled={isCurrentUser}
          className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      );
    },
    [currentUserId]
  );

  const handleUpdate = async (userData: User) => {
    try {
      const updatedUser = await usersApi.updateUser(userData);

      toast({
        title: 'User Updated',
        description: `Successfully updated user ${updatedUser.name}`,
      });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setEffectTrigger((prev) => prev + 1);
      setIsLoading(false);
    }
  };

  const onRowValueChanged = useCallback(
    (event: RowValueChangedEvent<User, unknown>) => {
      if (event.data) {
        setIsLoading(true);
        handleUpdate(event.data);
      }
    },
    []
  );

  useEffect(() => {
    usersApi
      .fetchUsers()
      .then((data) => {
        setRowData(data);
        setIsLoading(false);
      })
      .catch((error) => console.error('Error fetching users:', error));
  }, [effectTrigger]);

  return (
    <div className='h-full w-full'>
      <AgGridReact<User>
        gridOptions={{
          columnDefs,
          defaultColDef,
          domLayout: 'autoHeight',
          editType: 'fullRow',
          pagination: true,
          paginationPageSize: 20,
          components: {
            deleteButtonRenderer: DeleteButtonRenderer,
          },
        }}
        loading={isLoading}
        onRowValueChanged={onRowValueChanged}
        rowData={rowData}
        theme={agGridTheme}
      />
      <UserDeleteDialog
        user={userToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export { UsersGrid };
