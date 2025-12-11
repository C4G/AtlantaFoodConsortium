'use client';

import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  themeAlpine,
  colorSchemeDark,
  ICellRendererParams,
} from 'ag-grid-community';
import { GroupType, type Announcement } from '@prisma/client';
import { useIsDarkTheme } from '@/hooks/use-is-dark-theme';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from './actions';
import { UserRole } from '../../../types/types';
import { useSession } from 'next-auth/react';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  editable: false,
  flex: 1,
  minWidth: 150,
};

export type DialogMode = 'create' | 'edit';

type AnnouncementWithAuthor = Announcement & {
  author: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
};

type DeleteModal = {
  open: boolean;
  id: string | null;
};

export function AnnouncementsGrid() {
  const isDarkTheme = useIsDarkTheme();
  const agGridTheme = useMemo(
    () => (isDarkTheme ? themeAlpine.withPart(colorSchemeDark) : themeAlpine),
    [isDarkTheme]
  );

  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>(
    []
  );
  const [selected, setSelected] = useState<AnnouncementWithAuthor | null>(null);
  const [editMode, setEditMode] = useState<DialogMode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteModal>({
    open: false,
    id: null,
  });
  const [form, setForm] = useState<Partial<Announcement>>({});
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.STAFF;

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (e) {
        console.error('Failed to load announcements:', e);
      }
      setLoading(false);
    };

    loadAnnouncements();
  }, []);

  const openCreateAnnouncementDialog = () => {
    setForm({
      title: '',
      content: '',
      createdBy: '',
      groupType: GroupType.ADMIN,
    });
    setEditMode('create');
  };

  const openEditAnnouncementDialog = (row: AnnouncementWithAuthor) => {
    setForm(row);
    setEditMode('edit');
  };

  const handleSaveAnnouncement = async () => {
    if (!form.title || !form.content || !form.groupType) {
      alert('All fields are required');
      return;
    }

    try {
      if (editMode === 'create') {
        const newItem = await createAnnouncement(form);
        setAnnouncements((prev) => [newItem, ...prev]);
      } else if (editMode === 'edit' && form.id) {
        const updated = await updateAnnouncement(form.id, form);
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === updated.id ? { ...updated, author: a.author } : a
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert('Error saving announcement');
    }
    setEditMode(null);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting announcement');
    }
  };

  const gridColumnDefs: ColDef[] = [
    { field: 'title', headerName: 'Title' },
    {
      field: 'createdBy',
      headerName: 'Posted By',
      valueGetter: (params) => params.data?.author?.name ?? 'Unknown',
    },
    {
      field: 'groupType',
      headerName: 'Targeted User Group',
      valueFormatter: (p) => p.value ?? '',
    },
    {
      field: 'createdAt',
      headerName: 'Posted On',
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleDateString() : '',
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      minWidth: 120,
      filter: false,
      sortable: false,
      pinned: 'right',
      cellStyle: { padding: '0 8px' },
      cellRenderer: (params: ICellRendererParams<AnnouncementWithAuthor>) => {
        const row = params.data as AnnouncementWithAuthor;
        return (
          <div className='flex h-full items-center justify-center gap-3'>
            <button
              className='rounded-md p-1 transition hover:bg-accent'
              onClick={() => openEditAnnouncementDialog(row)}
            >
              <Pencil className='h-4 w-4 text-muted-foreground' />
            </button>
            <button
              className='rounded-md p-1 transition hover:bg-accent'
              onClick={() => setConfirmDelete({ open: true, id: row.id })}
            >
              <Trash2 className='h-4 w-4 text-red-500' />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Manage Announcements</h2>
        {isAdmin && (
          <Button onClick={openCreateAnnouncementDialog}>
            <Plus className='mr-1 h-4 w-4' /> New Announcement
          </Button>
        )}
      </div>

      <AgGridReact<AnnouncementWithAuthor>
        rowData={announcements}
        theme={agGridTheme}
        gridOptions={{
          columnDefs: gridColumnDefs,
          defaultColDef,
          domLayout: 'autoHeight',
          suppressHorizontalScroll: true,
          pagination: true,
          paginationPageSize: 20,
          onCellClicked: (e) => {
            if (!e.event) return;
            if (e.column?.getColId() === 'actions') return;
            const target = e.event.target as HTMLElement;
            if (target.closest('button, svg, path')) return; // prevent dialog on icon clicks
            if (e.data) setSelected(e.data);
          },
        }}
        loading={loading}
      />

      {/* Read-only Dialog when clicking a row */}
      <Dialog
        open={!!selected && !editMode}
        onOpenChange={() => setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <p className='mt-2 text-sm text-muted-foreground'>
            {selected?.content}
          </p>
          <p className='mt-4 text-xs'>
            Posted by <strong>{selected?.author?.name}</strong> on{' '}
            {selected ? new Date(selected.createdAt).toLocaleDateString() : ''}
          </p>
        </DialogContent>
      </Dialog>

      {/* Editable Dialog when clicking a row */}
      <Dialog
        open={!!editMode}
        onOpenChange={(open) => {
          if (!open) setEditMode(null);
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editMode === 'create'
                ? 'Create New Announcement'
                : 'Edit Announcement'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3'>
            <div className='grid gap-1.5'>
              <Label>Title</Label>
              <Input
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder='Enter announcement title'
              />
            </div>

            <div className='grid gap-1.5'>
              <Label>Content</Label>
              <Textarea
                value={form.content || ''}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder='Enter announcement content'
              />
            </div>

            <div className='grid gap-1.5'>
              <Label>Target User Group</Label>
              <Select
                value={form.groupType || GroupType.ADMIN}
                onValueChange={(v) =>
                  setForm({ ...form, groupType: v as GroupType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select user group' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GroupType.ADMIN}>Admin</SelectItem>
                  <SelectItem value={GroupType.SUPPLIER}>Supplier</SelectItem>
                  <SelectItem value={GroupType.NONPROFIT}>
                    {' '}
                    Non-Profit
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={() => setEditMode(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAnnouncement}>
              {editMode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deletable Dialog when clicking a row */}
      <Dialog
        open={confirmDelete.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete({ open: false, id: null });
        }}
      >
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Announcement?</DialogTitle>
          </DialogHeader>

          <p className='text-sm text-muted-foreground'>
            This action cannot be undone. Are you sure you want to remove this
            announcement?
          </p>

          <DialogFooter className='mt-4'>
            <Button
              variant='outline'
              onClick={() => setConfirmDelete({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={async () => {
                if (!confirmDelete.id) return;
                await handleDeleteAnnouncement(confirmDelete.id);
                setConfirmDelete({ open: false, id: null });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
