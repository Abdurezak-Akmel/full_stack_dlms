import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// User type that can be imported by other components
export interface User {
  id: string | number;
  name: string;
  email?: string;
  department?: string;
  avatar?: string;
}

interface PersonSearchProps {
  onSelect: (user: User | null) => void;
  selectedUser: User | null;
  users: User[];
  placeholder?: string;
  className?: string;
}

export function PersonSearch({
  onSelect,
  selectedUser,
  users,
  placeholder = 'Search by name or email...',
  className = ''
}: PersonSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    department?: string;
    workspace?: string;
  }>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim() && !filters.department && !filters.workspace) {
        setFilteredUsers([]);
        return;
      }

      const filtered = users.filter(user => {
        const matchesSearch = !searchTerm.trim() ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = !filters.department ||
          user.department?.toLowerCase() === filters.department.toLowerCase();

        // Note: Workspace filtering would require workspace data in the User object

        return matchesSearch && matchesDepartment;
      });

      setFilteredUsers(filtered.slice(0, 8)); // Limit to 8 results for performance
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, users, filters]);

  const handleSelect = useCallback((user: User | null) => {
    onSelect(user);
    setSearchTerm('');
    setFilteredUsers([]);
    setIsFocused(false);
  }, [onSelect]);

  const clearSelection = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm('');
    setFilteredUsers([]);
  }, [onSelect]);

  // Get unique departments for filter
  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={selectedUser?.name || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') {
                onSelect(null);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={selectedUser ? '' : placeholder}
            className="pl-10 pr-10 w-full"
            disabled={!!selectedUser}
          />
          {selectedUser && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!selectedUser && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={(e) => {
                e.preventDefault();
                setShowFilters(!showFilters);
              }}
              title="Filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && !selectedUser && (
          <div className="mt-2 p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="space-y-3">
              <div>
                <Label htmlFor="department-filter" className="text-xs font-medium">Department</Label>
                <select
                  id="department-filter"
                  value={filters.department || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    department: e.target.value || undefined
                  }))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:text-sm"
                >
                  <option value="">All departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workspace filter can be added here when workspace data is available */}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setSearchTerm('');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      {isFocused && filteredUsers.length > 0 && !selectedUser && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-popover text-popover-foreground shadow-lg border">
          <div className="max-h-60 overflow-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-3"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur before selection
                  handleSelect(user);
                }}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <div className="flex items-center gap-2">
                    {user.email && (
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    )}
                    {user.department && (
                      <span className="text-xs text-muted-foreground">• {user.department}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFocused && searchTerm && filteredUsers.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-popover text-popover-foreground p-4 text-sm text-muted-foreground">
          No people found. Try a different search term or adjust your filters.
        </div>
      )}
    </div>
  );
}
