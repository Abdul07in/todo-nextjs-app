'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TodoCard } from '@/components/todos/todo-card';
import { CreateTodoDialog } from '@/components/todos/create-todo-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { todoQueries } from '@/lib/queries';
import { Todo } from '@/lib/supabase';
import { Search, Filter } from 'lucide-react';

export default function TodosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  useEffect(() => {
    filterTodos();
  }, [todos, searchQuery, priorityFilter, activeTab]);

  const loadTodos = async () => {
    if (!user) return;
    
    try {
      const data = await todoQueries.getTodos(user.id);
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTodos = () => {
    let filtered = todos;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(todo => todo.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    setFilteredTodos(filtered);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const todoCount = todos.filter(todo => todo.status === 'todo').length;
  const inProgressCount = todos.filter(todo => todo.status === 'in_progress').length;
  const completedCount = todos.filter(todo => todo.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Sidebar />
      <div className="md:pl-64">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Todos</h1>
                <p className="text-gray-600 mt-2">
                  Manage your tasks and stay organized
                </p>
              </div>
              <CreateTodoDialog onSuccess={loadTodos} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search todos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({todos.length})</TabsTrigger>
                <TabsTrigger value="todo">Todo ({todoCount})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredTodos.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTodos.map((todo) => (
                      <TodoCard key={todo.id} todo={todo} onUpdate={loadTodos} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      {searchQuery || priorityFilter !== 'all' ? (
                        <>
                          <Search className="h-12 w-12 mx-auto mb-4" />
                          <p>No todos match your filters</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Filter className="h-6 w-6" />
                          </div>
                          <p>No {activeTab === 'all' ? 'todos' : activeTab.replace('_', ' ')} found</p>
                          <p className="text-sm">Create your first todo to get started</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}