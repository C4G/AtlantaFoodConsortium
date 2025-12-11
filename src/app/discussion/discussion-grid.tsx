'use client';

import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  themeAlpine,
  colorSchemeDark,
} from 'ag-grid-community';
import { GroupType, type Thread, type Comment } from '@prisma/client';
import { useIsDarkTheme } from '@/hooks/use-is-dark-theme';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  fetchThreads,
  fetchThreadById,
  createThread,
  deleteThread,
  postComment,
  patchComment,
  fetchComments,
} from './actions';
import { useSession } from 'next-auth/react';
import { UserRole } from '../../../types/types';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  editable: false,
  flex: 1,
  minWidth: 150,
};

type AuthorInfo = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type CommentWithAuthor = Comment & { author: AuthorInfo };

type ThreadWithAuthor = Thread & {
  author: AuthorInfo;
  comments: CommentWithAuthor[];
};

export function DiscussionThreadsGrid() {
  const isDarkTheme = useIsDarkTheme();
  const agGridTheme = useMemo(
    () => (isDarkTheme ? themeAlpine.withPart(colorSchemeDark) : themeAlpine),
    [isDarkTheme]
  );

  const THREAD_LIMIT = 20;
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const COMMENT_LIMIT = 10;
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);

  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [selected, setSelected] = useState<ThreadWithAuthor | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<Partial<Thread>>({});
  const [commentText, setCommentText] = useState('');
  const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.STAFF;

  const loadThreads = async () => {
    setLoading(true);
    try {
      const result = await fetchThreads(page, THREAD_LIMIT);
      setThreads(result.threads);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadThread = async (id: string) => {
    try {
      const thread = await fetchThreadById(id);
      setSelected({ ...thread, comments: [] });
      await loadComments(id, 0);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  const loadComments = async (threadId: string, page = 0) => {
    try {
      const res = await fetchComments(threadId, page, COMMENT_LIMIT);
      setSelected((prev) =>
        prev ? { ...prev, comments: res.comments } : null
      );
      setCommentTotal(res.total);
      setCommentTotalPages(res.totalPages);
      setCommentPage(page);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleCreateThread = async () => {
    if (!form.title || !form.title.trim()) {
      alert('Thread title is required.');
      return;
    }

    if (!form.content || !form.content.trim()) {
      alert('Thread content is required.');
      return;
    }

    try {
      await createThread({
        title: form.title,
        content: form.content ?? '',
        groupType: form.groupType ?? GroupType.ADMIN,
      });
      setOpenDialog(false);
      setForm({});
      loadThreads();
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  const handleAddComment = async () => {
    if (!selected || !commentText.trim()) {
      alert('Comment content is required.');
      return;
    }

    try {
      await postComment(selected.id, {
        content: commentText.trim(),
      });

      // After posting, go to the last page where the new comment is
      const lastPage = commentTotalPages;
      // Reload the correct page
      await loadComments(selected.id, lastPage);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleDeleteThread = async () => {
    if (!selected) return;

    try {
      await deleteThread(selected.id);
      setConfirmDeleteThread(false);
      setSelected(null);
      loadThreads();
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selected) return;
    try {
      await patchComment(selected.id, commentId, {
        content: '[deleted]',
      });

      await loadComments(selected.id, commentPage);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const gridColumnDefs: ColDef[] = [
    { field: 'title', headerName: 'Thread' },
    {
      field: 'createdBy',
      headerName: 'Posted By',
      valueGetter: (params) => params.data.author.name ?? 'Unknown',
      width: 180,
    },
    {
      field: 'createdAt',
      headerName: 'Posted',
      valueFormatter: (p) => new Date(p.value).toLocaleDateString(),
      width: 140,
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h5 className='text-xl'>Stay connected with community discussions</h5>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className='mr-1 h-4 w-4' />
          New Thread
        </Button>
      </div>

      <AgGridReact<ThreadWithAuthor>
        theme={agGridTheme}
        rowData={threads}
        columnDefs={gridColumnDefs}
        defaultColDef={defaultColDef}
        domLayout='autoHeight'
        loading={loading}
        onCellClicked={(e) => {
          if (e.data) loadThread(e.data.id);
        }}
      />

      <div className='mt-4 flex items-center justify-center gap-3'>
        <Button
          variant='outline'
          disabled={page <= 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <span className='text-sm text-muted-foreground'>
          Page {page + 1} of {totalPages}
        </span>

        <Button
          variant='outline'
          disabled={page >= totalPages - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>

        <div className='mt-1 text-center text-sm text-muted-foreground'>
          Showing {page * THREAD_LIMIT + 1}–
          {Math.min((page + 1) * THREAD_LIMIT, total)} of {total} threads
        </div>
      </div>

      {/* Create Thread Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Start a new discussion with your user group.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <Input
              placeholder='Thread Title'
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <p className='text-sm text-muted-foreground'>
              Select Targeted Group
            </p>
            <Select
              value={form.groupType ?? GroupType.ADMIN}
              onValueChange={(v) =>
                setForm({ ...form, groupType: v as GroupType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select Targeted Group' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GroupType.ADMIN}>Admin</SelectItem>
                <SelectItem value={GroupType.SUPPLIER}>Supplier</SelectItem>
                <SelectItem value={GroupType.NONPROFIT}>Non-Profit</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder='Share your thoughts, questions, or ideas...'
              value={form.content ?? ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread}>Create Thread</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Thread + Comments Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader className='flex items-start justify-between'>
            <div className='flex flex-col space-y-1'>
              <DialogTitle className='text-lg font-semibold'>
                {selected?.title}
              </DialogTitle>
              <DialogDescription>
                Discussion thread for {selected?.groupType}
                {isAdmin && (
                  <button
                    onClick={() => setConfirmDeleteThread(true)}
                    className='rounded-md p-1 transition hover:bg-muted'
                    aria-label='Delete thread'
                  >
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </button>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Thread Content */}
          {selected && (
            <div className='space-y-6'>
              {/* Thread Info */}
              <div className='border-b pb-2'>
                <p className='text-sm text-muted-foreground'>
                  <strong>{selected.author.name}</strong> •{' '}
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
                <p className='mt-2'>{selected.content}</p>
              </div>

              {/* Comments Section */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>
                  Comments ({commentTotal})
                </h4>

                {selected.comments.map((c) => (
                  <div
                    key={c.id}
                    className='relative rounded-md border bg-muted/40 p-3'
                  >
                    <p className='text-sm font-medium'>
                      {c.content === '[deleted]' ? '[deleted]' : c.author.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                    <p className='mt-1 text-sm'>{c.content}</p>

                    {/* Delete Comment Icon */}
                    {isAdmin && c.content !== '[deleted]' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent dialog close
                          handleDeleteComment(c.id);
                        }}
                        className='absolute right-2 top-2 rounded-md p-1 hover:bg-muted'
                      >
                        <Trash2 className='h-3 w-3 text-red-500' />
                      </button>
                    )}
                  </div>
                ))}

                <div className='flex items-center justify-between border-t pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={commentPage <= 0}
                    onClick={() => loadComments(selected.id, commentPage - 1)}
                  >
                    Prev
                  </Button>

                  <p className='text-xs text-muted-foreground'>
                    Page {commentPage + 1} of {commentTotalPages} — showing{' '}
                    {commentPage * COMMENT_LIMIT + 1}–
                    {Math.min((commentPage + 1) * COMMENT_LIMIT, commentTotal)}{' '}
                    of {commentTotal}
                  </p>

                  <Button
                    variant='outline'
                    size='sm'
                    disabled={commentPage >= commentTotalPages - 1}
                    onClick={() => loadComments(selected.id, commentPage + 1)}
                  >
                    Next
                  </Button>
                </div>

                {/* Add Comment */}
                <div className='border-t pt-3'>
                  <Textarea
                    placeholder='Add a comment...'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className='mt-2 flex justify-end'>
                    <Button size='sm' onClick={handleAddComment}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteThread} onOpenChange={setConfirmDeleteThread}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this thread? This will also delete
              all comments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmDeleteThread(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteThread}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
