'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { todoQueries } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional(),
});

type TodoForm = z.infer<typeof todoSchema>;

interface CreateTodoDialogProps {
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isEdit?: boolean;
  initialValues?: any;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export function CreateTodoDialog({ onSuccess, open: controlledOpen, onOpenChange, isEdit, initialValues, onSubmit: onEditSubmit, isLoading: editLoading }: CreateTodoDialogProps) {
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? onOpenChange : setOpen;
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TodoForm>({
    resolver: zodResolver(todoSchema),
    defaultValues: initialValues || { priority: 'medium' },
    values: initialValues,
  });

  const dueDate = watch('due_date');

  const onSubmit = async (data: TodoForm) => {
    if (isEdit && onEditSubmit) {
      await onEditSubmit(data);
      reset();
      return;
    }
    if (!user) return;
    setIsLoading(true);
    try {
      await todoQueries.createTodo({
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        status: 'todo',
        owner_id: user.id,
        shared_with: [],
      });
      toast.success('Todo created successfully');
      setDialogOpen(false);
      reset();
      onSuccess();
    } catch (error) {
      toast.error('Failed to create todo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            New Todo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your todo details' : 'Add a new task to your todo list'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              placeholder='Enter todo title'
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Enter description (optional)'
              {...register('description')}
              rows={3}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Priority</Label>
              <Select
                defaultValue='medium'
                onValueChange={(value) =>
                  setValue('priority', value as 'low' | 'medium' | 'high')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>Low</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={dueDate}
                    onSelect={(date) => setValue('due_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isEdit ? editLoading : isLoading}>
              {isEdit ? (editLoading ? 'Saving...' : 'Save') : (isLoading ? 'Creating...' : 'Create Todo')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
