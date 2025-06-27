/*
  # Complete Database Schema for TodoApp

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `username` (text, unique)
      - `full_name` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `todos`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `due_date` (timestamp, optional)
      - `status` (enum: todo, in_progress, completed)
      - `priority` (enum: low, medium, high)
      - `owner_id` (uuid, references profiles)
      - `shared_with` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notes`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text)
      - `owner_id` (uuid, references profiles)
      - `shared_with` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for shared content access

  3. Functions and Triggers
    - Auto-update timestamps
    - Auto-create profiles on user signup
*/

-- Create custom types
CREATE TYPE todo_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create todos table
CREATE TABLE todos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    due_date timestamptz,
    status todo_status DEFAULT 'todo' NOT NULL,
    priority todo_priority DEFAULT 'medium' NOT NULL,
    owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    shared_with text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create notes table
CREATE TABLE notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text DEFAULT '' NOT NULL,
    owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    shared_with text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Todos policies
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id OR auth.uid()::text = ANY(shared_with));

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id OR auth.uid()::text = ANY(shared_with));

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 1️⃣ Create or replace the function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- 2️⃣ Drop trigger if exists (good practice during development)
drop trigger if exists on_auth_user_created on auth.users;

-- 3️⃣ Create the trigger
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

grant usage on schema public to postgres, anon, authenticated;
grant insert on public.profiles to postgres, anon, authenticated;


-- Create indexes for better performance
CREATE INDEX todos_owner_id_idx ON todos(owner_id);
CREATE INDEX todos_status_idx ON todos(status);
CREATE INDEX todos_priority_idx ON todos(priority);
CREATE INDEX todos_due_date_idx ON todos(due_date);
CREATE INDEX todos_created_at_idx ON todos(created_at);
CREATE INDEX notes_owner_id_idx ON notes(owner_id);
CREATE INDEX notes_created_at_idx ON notes(created_at);
CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_email_idx ON profiles(email);

-- Create function for searching users (for sharing functionality)
CREATE OR REPLACE FUNCTION search_users(search_term text)
RETURNS TABLE (
    id uuid,
    email text,
    username text,
    full_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.username, p.full_name
    FROM profiles p
    WHERE 
        p.username ILIKE '%' || search_term || '%' OR
        p.email ILIKE '%' || search_term || '%' OR
        p.full_name ILIKE '%' || search_term || '%'
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;