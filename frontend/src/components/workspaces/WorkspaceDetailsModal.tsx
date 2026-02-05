import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Search, User as UserIcon, X } from 'lucide-react';
import { Workspace, User } from '@/types/dlms';

interface WorkspaceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  users: User[];
  totalDocuments: number;
  ownerName: string;
  onSave: (next: Workspace) => void;
}

export function WorkspaceDetailsModal({
  isOpen,
  onClose,
  workspace,
  users,
  totalDocuments,
  ownerName,
  onSave,
}: WorkspaceDetailsModalProps) {
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDepartmentFilter, setMemberDepartmentFilter] = useState<string>('all');
  const [pendingMember, setPendingMember] = useState<User | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDescription(workspace.description);
    setSelectedMembers(workspace.members);
    setMemberSearch('');
    setMemberDepartmentFilter('all');
    setPendingMember(null);
  }, [isOpen, workspace]);

  const availableDepartments = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.department).filter(Boolean))) as string[];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return [];

    return users
      .filter((u) => {
        const matchesDepartment = memberDepartmentFilter === 'all' || u.department === memberDepartmentFilter;
        const matchesSearch =
          u.name.toLowerCase().includes(q) || (u.email ? u.email.toLowerCase().includes(q) : false);
        const notSelected = !selectedMembers.some((m) => m.id === u.id);
        return matchesDepartment && matchesSearch && notSelected;
      })
      .slice(0, 8);
  }, [memberDepartmentFilter, memberSearch, selectedMembers, users]);

  const canSave = true;

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const addMember = (user: User) => {
    setSelectedMembers((prev) => [...prev, user]);
    setMemberSearch('');
    setPendingMember(null);
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...workspace,
      description,
      members: selectedMembers,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 [&>button]:hidden"
        overlayClassName="bg-black/50 backdrop-blur-sm"
      >
        <div className="p-6 pb-4 border-b relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="pr-8">
            <h2 className="text-xl font-semibold text-foreground">Workspace Details</h2>
            <p className="text-sm text-muted-foreground mt-1">View and edit workspace information</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Workspace Name</label>
                <span className="text-xs text-muted-foreground">Read-only</span>
              </div>
              <div className="h-10 rounded-md border bg-muted/30 px-3 flex items-center text-sm text-foreground">
                {workspace.name}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Description</label>
                <span className="text-xs text-muted-foreground">Editable</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Members</label>
                <span className="text-xs text-muted-foreground">Editable</span>
              </div>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((m) => (
                    <div
                      key={m.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                    >
                      <span className="max-w-[160px] truncate">{m.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(m.id)}
                        className="hover:text-destructive"
                        aria-label="Remove member"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members by name or email..."
                    className="pl-10 h-10"
                  />

                  {filteredUsers.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full rounded-md bg-popover text-popover-foreground shadow-lg border overflow-hidden">
                      <div className="max-h-56 overflow-auto">
                        {filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setPendingMember(u);
                              setMemberSearch('');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent hover:text-accent-foreground text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {u.role} • {u.department}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {memberSearch.trim() && filteredUsers.length === 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">No matching users</div>
                  )}
                </div>

                <Select value={memberDepartmentFilter} onValueChange={setMemberDepartmentFilter}>
                  <SelectTrigger className="h-10 w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Depts</SelectItem>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-xs text-muted-foreground">
                  {pendingMember ? (
                    <span>
                      Selected: <span className="text-foreground">{pendingMember.name}</span>
                    </span>
                  ) : (
                    <span>Select a user from search results to enable Add Member</span>
                  )}
                </div>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!pendingMember}
                  onClick={() => pendingMember && addMember(pendingMember)}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Metadata</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Created</span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {new Date(workspace.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-xs">Owner</span>
                </div>
                <p className="text-sm font-medium mt-1">{ownerName}</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Total documents</span>
                </div>
                <p className="text-sm font-medium mt-1">{totalDocuments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
            disabled={!canSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
