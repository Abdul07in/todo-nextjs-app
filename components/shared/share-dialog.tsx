import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { userQueries } from '@/lib/queries';
import { Input } from '@/components/ui/input';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (userIds: string[]) => Promise<void>;
}

export function ShareDialog({ open, onOpenChange, onShare }: ShareDialogProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const users = await userQueries.searchUsers(search);
    setResults(users);
    setLoading(false);
  };

  const handleSelect = (user: any) => {
    if (!selected.find((u) => u.id === user.id)) {
      setSelected([...selected, user]);
    }
  };

  const handleShare = async () => {
    await onShare(selected.map((u) => u.id));
    setSelected([]);
    setResults([]);
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Share with users</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className='space-y-2'>
          <Input
            placeholder='Search users by name or email'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <div className='space-y-1'>
            {results.map((user) => (
              <div key={user.id} className='flex items-center justify-between'>
                <span>{user.email || user.username}</span>
                <Button size='sm' onClick={() => handleSelect(user)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
          {selected.length > 0 && (
            <div className='mt-2'>
              <div className='font-semibold text-sm mb-1'>Selected:</div>
              <ul className='list-disc pl-5'>
                {selected.map((user) => (
                  <li key={user.id}>{user.email || user.username}</li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={handleShare} disabled={selected.length === 0}>
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
