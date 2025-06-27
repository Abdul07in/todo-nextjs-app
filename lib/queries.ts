import { supabase } from './supabase';
import { Todo, Note, Profile } from './supabase';

export const todoQueries = {
  async getTodos(userId: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .or(`owner_id.eq.${userId},shared_with.cs.{${userId}}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
    return data || [];
  },

  async createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .insert([todo])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
    return data;
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating todo:', error);
      throw new Error('Failed to update todo');
    }
    return data;
  },

  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting todo:', error);
      throw new Error('Failed to delete todo');
    }
  },

  async shareTodo(todoId: string, userIds: string[]): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update({ shared_with: userIds })
      .eq('id', todoId)
      .select()
      .single();
    
    if (error) {
      console.error('Error sharing todo:', error);
      throw new Error('Failed to share todo');
    }
    return data;
  },
};

export const noteQueries = {
  async getNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`owner_id.eq.${userId},shared_with.cs.{${userId}}`)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
    return data || [];
  },

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
    return data;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
    return data;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  },

  async shareNote(noteId: string, userIds: string[]): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ shared_with: userIds })
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error sharing note:', error);
      throw new Error('Failed to share note');
    }
    return data;
  },
};

export const userQueries = {
  async searchUsers(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .rpc('search_users', { search_term: query });
    
    if (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
    return data || [];
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No profile found
      }
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
    return data;
  },
};