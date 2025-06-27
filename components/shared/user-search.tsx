'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { userQueries } from '@/lib/queries';
import { Profile } from '@/lib/supabase';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface UserSearchProps {
  selectedUsers: Profile[];
  onUserSelect: (user: Profile) => void;
  onUserRemove: (userId: string) => void;
  placeholder?: string;
}

export function UserSearch({ 
  selectedUsers, 
  onUserSelect, 
  onUserRemove, 
  placeholder = "Search users..." 
}: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const users = await userQueries.searchUsers(debouncedQuery);
        // Filter out already selected users
        const filteredUsers = users.filter(
          user => !selectedUsers.some(selected => selected.id === user.id)
        );
        setResults(filteredUsers);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery, selectedUsers]);

  const handleUserSelect = (user: Profile) => {
    onUserSelect(user);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {user.username?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user.username || user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onUserRemove(user.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleUserSelect(user)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.username?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.username || user.email}
                </p>
                {user.full_name && (
                  <p className="text-sm text-gray-500 truncate">{user.full_name}</p>
                )}
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4 text-sm text-gray-500">
          Searching users...
        </div>
      )}

      {query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No users found matching "{query}"
        </div>
      )}
    </div>
  );
}