'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share, Users } from 'lucide-react';
import { todoQueries, noteQueries } from '@/lib/queries';
import { TodoCard } from '@/components/todos/todo-card';
import { NoteCard } from '@/components/notes/note-card';

export default function SharedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [todos, setTodos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      Promise.all([
        todoQueries.getTodos(user.id),
        noteQueries.getNotes(user.id),
      ]).then(([todos, notes]) => {
        setTodos(todos.filter((t: any) => t.owner_id !== user.id));
        setNotes(notes.filter((n: any) => n.owner_id !== user.id));
        setLoadingData(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className='min-h-screen bg-gray-50/30'>
      <Sidebar />
      <div className='md:pl-64'>
        <main className='p-6'>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900'>
                Shared Content
              </h1>
              <p className='text-gray-600 mt-2'>
                View and manage content shared with you
              </p>
            </div>

            {loadingData ? (
              <div className='flex justify-center items-center min-h-[200px]'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            ) : (
              <>
                <div className='mb-8'>
                  <h2 className='text-xl font-semibold mb-2'>Shared Todos</h2>
                  {todos.length === 0 ? (
                    <p className='text-muted-foreground'>
                      No todos shared with you yet.
                    </p>
                  ) : (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {todos.map((todo: any) => (
                        <TodoCard
                          key={todo.id}
                          todo={todo}
                          onUpdate={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className='text-xl font-semibold mb-2'>Shared Notes</h2>
                  {notes.length === 0 ? (
                    <p className='text-muted-foreground'>
                      No notes shared with you yet.
                    </p>
                  ) : (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {notes.map((note: any) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onUpdate={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
