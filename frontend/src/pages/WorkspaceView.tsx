import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockUsers, mockWorkspaces, mockDocuments } from '@/data/mockData';
import type { Document, Workspace } from '@/types/dlms';
import { DocumentList } from '@/components/documents/DocumentList';
import { ItemDetailModal } from '@/components/documents/ItemDetailModal';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { WorkspaceDetailsModal } from '@/components/workspaces/WorkspaceDetailsModal';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Settings, Users } from 'lucide-react';

export default function WorkspaceView() {
  const { id } = useParams();

  const initialWorkspace = useMemo(() => {
    return mockWorkspaces.find((w) => w.id === id) ?? null;
  }, [id]);

  const [workspace, setWorkspace] = useState<Workspace | null>(initialWorkspace);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  const workspaceDocuments = useMemo(() => {
    if (!workspace) return [];
    return mockDocuments.filter((d) => d.workspace === workspace.name);
  }, [workspace]);

  const lastActivityLabel = useMemo(() => {
    if (!workspace) return '';
    const dates = workspaceDocuments.map((d) => new Date(d.date).getTime()).filter((t) => !Number.isNaN(t));
    if (dates.length === 0) return 'No recent activity';
    const latest = new Date(Math.max(...dates));
    return latest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [workspace, workspaceDocuments]);

  if (!workspace) {
    return (
      <AppLayout title="Workspace" subtitle="Workspace not found">
        <div className="panel-section py-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Workspace not found</p>
          <p className="text-sm">Please return to Workspaces</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={workspace.name} subtitle={workspace.description}>
      <div className="space-y-4 animate-fade-in">
        <button
          type="button"
          onClick={() => setIsDetailsOpen(true)}
          className="w-full panel-section p-4 hover:shadow-elevated transition-all text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">{workspace.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {workspace.description}
              </p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex -space-x-2">
                  {workspace.members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center"
                      title={member.name}
                    >
                      <span className="text-[10px] font-medium text-primary">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                  ))}
                  {workspace.members.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        +{workspace.members.length - 5}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{workspaceDocuments.length} docs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Last activity {lastActivityLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
              title="Workspace details"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </button>

        <div className="flex-1 overflow-hidden">
          <DocumentList
            documents={workspaceDocuments}
            onDocumentClick={setSelectedDocument}
            onView={(doc) => setViewingDocument(doc)}
            onDownload={(doc) => console.log('Downloading document:', doc.id)}
          />
        </div>

        {selectedDocument && (
          <ItemDetailModal
            document={selectedDocument}
            isOpen={!!selectedDocument}
            onClose={() => setSelectedDocument(null)}
            source="inbox"
            onView={(doc) => {
              setSelectedDocument(null);
              setViewingDocument(doc);
            }}
          />
        )}

        {viewingDocument && (
          <DocumentViewerModal
            document={viewingDocument}
            isOpen={!!viewingDocument}
            onClose={() => setViewingDocument(null)}
          />
        )}

        <WorkspaceDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          workspace={workspace}
          users={mockUsers}
          totalDocuments={workspaceDocuments.length}
          ownerName={workspace.members[0]?.name || 'Workspace Owner'}
          onSave={(next) => setWorkspace(next)}
        />
      </div>
    </AppLayout>
  );
}
