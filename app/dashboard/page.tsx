'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { todoQueries, noteQueries } from '@/lib/queries';
import { Todo, Note } from '@/lib/supabase';
import { CheckSquare, FileText, Clock, TrendingUp, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [todosData, notesData] = await Promise.all([
        todoQueries.getTodos(user.id),
        noteQueries.getNotes(user.id),
      ]);
      setTodos(todosData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const completedTodos = todos.filter(todo => todo.status === 'completed').length;
  const pendingTodos = todos.filter(todo => todo.status !== 'completed').length;
  const overdueTodos = todos.filter(todo => 
    todo.due_date && 
    new Date(todo.due_date) < new Date() && 
    todo.status !== 'completed'
  ).length;

  const recentTodos = todos.slice(0, 5);
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Sidebar />
      <div className="md:pl-64">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.user_metadata?.username || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your tasks and notes today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Todos"
                value={todos.length}
                description="All tasks"
                icon={CheckSquare}
              />
              <StatsCard
                title="Completed"
                value={completedTodos}
                description={`${todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0}% completion rate`}
                icon={TrendingUp}
              />
              <StatsCard
                title="Pending"
                value={pendingTodos}
                description="Tasks remaining"
                icon={Clock}
              />
              <StatsCard
                title="Notes"
                value={notes.length}
                description="Total notes"
                icon={FileText}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
              <Link href="/todos">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Todo
                </Button>
              </Link>
              <Link href="/notes">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Note
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Todos */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Todos
                      <Link href="/todos">
                        <Button variant="ghost" size="sm">View All</Button>
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Your latest tasks and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentTodos.length > 0 ? (
                      <div className="space-y-4">
                        {recentTodos.map((todo) => (
                          <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{todo.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline"
                                  className={
                                    todo.priority === 'high' ? 'border-red-200 text-red-800' : 
                                    todo.priority === 'medium' ? 'border-yellow-200 text-yellow-800' : 
                                    'border-blue-200 text-blue-800'
                                  }
                                >
                                  {todo.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {todo.status.replace('_', ' ')}
                                </Badge>
                                {todo.due_date && (
                                  <span className="text-sm text-muted-foreground">
                                    Due {format(new Date(todo.due_date), 'MMM d')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No todos yet. Create your first task!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Notes */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Notes
                      <Link href="/notes">
                        <Button variant="ghost" size="sm">View All</Button>
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Your latest notes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentNotes.length > 0 ? (
                      <div className="space-y-4">
                        {recentNotes.map((note) => (
                          <div key={note.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-1">{note.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {note.content.substring(0, 100)}...
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(note.updated_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No notes yet. Create your first note!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}