import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockWorkspaces } from '@/data/mockData';
import { Workspace } from '@/types/dlms';
import { Button } from '@/components/ui/button';
import { CreateWorkspaceModal } from '@/components/workspaces/CreateWorkspaceModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Users,
  FileText,
  Calendar,
  Settings,
  ChevronRight,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockUsers } from '@/data/mockData';

export default function Workspaces() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const navigate = useNavigate();

  const filteredWorkspaces = mockWorkspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout
      title="Workspaces"
      subtitle="Collaborate with teams on shared documents and projects"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => navigate(`/workspaces/${workspace.id}`)}
              className="panel-section p-5 hover:shadow-elevated transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="font-semibold text-foreground">{workspace.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {workspace.description}
              </p>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {workspace.members.length}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {workspace.documentsCount}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(workspace.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Members Preview */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  {workspace.members.slice(0, 4).map((member, index) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center"
                      title={member.name}
                    >
                      <span className="text-[10px] font-medium text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ))}
                  {workspace.members.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        +{workspace.members.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          ))}

          {/* New Workspace Card */}
          {!!user?.privileges?.workspace?.createWorkspace && (
            <button
              className="panel-section p-5 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[200px] text-muted-foreground hover:text-primary"
              onClick={() => setIsCreateWorkspaceOpen(true)}
            >
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-current flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Create Workspace</span>
              <span className="text-sm mt-1">Start a new collaboration</span>
            </button>
          )}
        </div>

        {filteredWorkspaces.length === 0 && searchQuery && (
          <div className="panel-section py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No workspaces found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        users={mockUsers}
      />
    </AppLayout>
  );
}
