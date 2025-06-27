import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Todo, Note } from '../supabase';

export function useRealtimeTodos(userId: string) {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to todos changes
    const subscription = supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos(prev => [payload.new as Todo, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTodos(prev => prev.map(todo => 
              todo.id === payload.new.id ? payload.new as Todo : todo
            ));
          } else if (payload.eventType === 'DELETE') {
            setTodos(prev => prev.filter(todo => todo.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return todos;
}

export function useRealtimeNotes(userId: string) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to notes changes
    const subscription = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new as Note, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev => prev.map(note => 
              note.id === payload.new.id ? payload.new as Note : note
            ));
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(note => note.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return notes;
}