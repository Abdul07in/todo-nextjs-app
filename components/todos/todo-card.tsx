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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ShareDialog } from '@/components/shared/share-dialog';
import { Todo } from '@/lib/supabase';
import { todoQueries, userQueries } from '@/lib/queries';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Trash,
  Edit,
  Share,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoCardProps {
  todo: Todo;
  onUpdate: () => void;
}

import { CreateTodoDialog } from './create-todo-dialog';
import { useEffect } from 'react';

export function TodoCard({ todo, onUpdate }: TodoCardProps) {
  const [ownerName, setOwnerName] = useState<string>('');
  useEffect(() => {
    async function fetchOwner() {
      if (todo.owner_id) {
        const profile = await userQueries.getProfile(todo.owner_id);
        setOwnerName(profile?.full_name || profile?.username || 'Unknown');
      }
    }
    fetchOwner();
  }, [todo.owner_id]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editDefaultValues, setEditDefaultValues] = useState<any>(null);
  const openEditDialog = () => {
    setEditDefaultValues({
      title: todo.title,
      description: todo.description || '',
      due_date: todo.due_date ? new Date(todo.due_date) : undefined,
      priority: todo.priority,
      status: todo.status,
    });
    setShowEditDialog(true);
  };
  const handleEdit = async (data: any) => {
    setIsLoading(true);
    try {
      await todoQueries.updateTodo(todo.id, {
        title: data.title,
        description: data.description,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        priority: data.priority,
        status: data.status,
      });
      toast.success('Todo updated!');
      setShowEditDialog(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update todo');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
  };
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const handleShare = async (userIds: string[]) => {
    setIsLoading(true);
    try {
      await todoQueries.shareTodo(todo.id, userIds);
      toast.success('Todo shared!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to share todo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (completed: boolean) => {
    setIsLoading(true);
    try {
      await todoQueries.updateTodo(todo.id, {
        status: completed ? 'completed' : 'todo',
      });
      onUpdate();
      toast.success(
        completed ? 'Todo completed!' : 'Todo marked as incomplete'
      );
    } catch (error) {
      toast.error('Failed to update todo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await todoQueries.deleteTodo(todo.id);
      onUpdate();
      toast.success('Todo deleted');
    } catch (error) {
      toast.error('Failed to delete todo');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const isOverdue =
    todo.due_date &&
    new Date(todo.due_date) < new Date() &&
    todo.status !== 'completed';

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        todo.status === 'completed' && 'opacity-75',
        isOverdue && 'border-red-200 bg-red-50/50'
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start space-x-3'>
            <div className='flex flex-col items-start justify-center mr-2'>
              <span className='text-xs text-muted-foreground'>Created by</span>
              <span className='text-xs font-medium'>{ownerName}</span>
            </div>
            <Checkbox
              checked={todo.status === 'completed'}
              onCheckedChange={handleStatusChange}
              disabled={isLoading}
              className='mt-1'
            />
            <div className='flex-1 min-w-0'>
              <CardTitle
                className={cn(
                  'text-base leading-tight',
                  todo.status === 'completed' &&
                    'line-through text-muted-foreground'
                )}
              >
                {todo.title}
              </CardTitle>
              {todo.description && (
                <CardDescription className='mt-1'>
                  {todo.description}
                </CardDescription>
              )}
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
              {showEditDialog && (
                <CreateTodoDialog
                  open={showEditDialog}
                  onOpenChange={setShowEditDialog}
                  onSuccess={() => {
                    setShowEditDialog(false);
                    onUpdate();
                  }}
                  initialValues={editDefaultValues}
                  onSubmit={handleEdit}
                  isLoading={isLoading}
                  isEdit
                />
              )}
              <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title='Delete Todo'
                description='Are you sure you want to delete this todo? This action cannot be undone.'
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
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Badge variant='outline' className={priorityColors[todo.priority]}>
              {todo.priority}
            </Badge>
            <Badge variant='outline' className={statusColors[todo.status]}>
              {todo.status.replace('_', ' ')}
            </Badge>
          </div>
          {todo.due_date && (
            <div
              className={cn(
                'flex items-center space-x-1 text-sm',
                isOverdue ? 'text-red-600' : 'text-muted-foreground'
              )}
            >
              {isOverdue ? (
                <Clock className='h-3 w-3' />
              ) : (
                <Calendar className='h-3 w-3' />
              )}
              <span>{format(new Date(todo.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
