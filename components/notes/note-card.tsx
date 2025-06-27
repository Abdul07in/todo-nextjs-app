'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ShareDialog } from '@/components/shared/share-dialog';
import { Note } from '@/lib/supabase';
import { noteQueries } from '@/lib/queries';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MoreHorizontal, Trash, Edit, Share, FileText } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onUpdate: () => void;
}

export function NoteCard({ note, onUpdate }: NoteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const openEditDialog = () => {
    setEditTitle(note.title);
    setEditContent(note.content || '');
    setShowEditDialog(true);
  };

  const handleShare = async (userIds: string[]) => {
    setIsLoading(true);
    try {
      await noteQueries.shareNote(note.id, userIds);
      toast.success('Note shared!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to share note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await noteQueries.deleteNote(note.id);
      onUpdate();
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await noteQueries.updateNote(note.id, {
        title: editTitle,
        content: editContent,
      });
      toast.success('Note updated!');
      setShowEditDialog(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update note');
    } finally {
      setIsLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className='transition-all duration-200 hover:shadow-md cursor-pointer'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start space-x-3'>
            <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
              <FileText className='h-4 w-4 text-primary' />
            </div>
            <div className='flex-1 min-w-0'>
              <CardTitle className='text-base leading-tight truncate'>
                {note.title}
              </CardTitle>
              <CardDescription className='text-xs'>
                Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  openEditDialog();
                }}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowShareDialog(true);
                }}
              >
                <Share className='mr-2 h-4 w-4' />
                Share
              </DropdownMenuItem>
              <ShareDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                onShare={handleShare}
              />
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <form
                  onSubmit={handleEdit}
                  className='p-6 flex flex-col gap-4 min-w-[320px]'
                >
                  <h2 className='text-lg font-semibold'>Edit Note</h2>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Title
                    </label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Content
                    </label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      disabled={isLoading}
                    />
                  </div>
                  <div className='flex justify-end gap-2 mt-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowEditDialog(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              </Dialog>
              <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title='Delete Note'
                description='Are you sure you want to delete this note? This action cannot be undone.'
                confirmLabel={isLoading ? 'Deleting...' : 'Delete'}
                cancelLabel='Cancel'
                onConfirm={handleDelete}
                loading={isLoading}
                trigger={
                  <DropdownMenuItem
                    className='text-destructive'
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {note.content && (
        <CardContent>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {truncateContent(note.content)}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
