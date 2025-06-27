import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: 'todo' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          owner_id: string;
          shared_with: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          owner_id: string;
          shared_with?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          owner_id?: string;
          shared_with?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          owner_id: string;
          shared_with: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          owner_id: string;
          shared_with?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          owner_id?: string;
          shared_with?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Todo = Database['public']['Tables']['todos']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];