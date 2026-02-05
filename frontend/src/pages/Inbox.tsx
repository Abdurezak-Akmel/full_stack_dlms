import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { ItemDetailModal } from '@/components/documents/ItemDetailModal';
import { Document } from '@/types/dlms';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, Filter, Building, Users } from 'lucide-react';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { toast } from 'sonner';

type InboxTab = 'all' | 'personal' | 'team' | 'workspace' | 'branch';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState<InboxTab>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  // Mock data for filters
  const branches = [
    'Mesob Head Quarter', 'Bole Mesob', 'Gullele Mesob', 'Lideta Mesob',
    'Addis Ketema Mesob', 'Kirkos Mesob', 'Yeka Mesob', 'Kolfe Mesob',
    'Lemi Kura Mesob', 'Kality Mesob', 'Nifas Silk Lafto Mesob'
  ];

  const departments = [
    'Network', 'Database and System Administration', 'Training and Maintenance',
    'Cyber-Security', 'Human Resource', 'Finance'
  ];

  const workspaces = [
    'Executive Team', 'Project Alpha', 'Customer Support'
  ];

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      let scope = activeTab;
      if (activeTab === 'team') scope = 'department' as InboxTab;
      if (activeTab === 'branch') scope = 'organization' as InboxTab;
      const query = activeTab === 'all' ? '' : `?scope=${scope}`;
      const res = await fetch(`http://localhost:5000/api/documents/inbox${query}`);
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery('');
    setFilterValue('all');
    fetchDocuments();
  }, [activeTab]);

  const handleRefresh = () => {
    fetchDocuments();
    toast.success('Inbox refreshed');
  };

  const handleDownload = (doc: Document) => {
    console.log('Downloading document:', doc.id);
  };

  const handleSaveToLibrary = (doc: Document) => {
    console.log('Saving document to library:', doc.id);
  };

  return (
    <AppLayout
      title="Inbox"
      subtitle="View and manage incoming documents and letters"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-180px)] animate-fade-in">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InboxTab)} className="mb-4">
            <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
              <TabsTrigger value="branch">Branch</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filters */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {activeTab === 'team' && (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {activeTab === 'workspace' && (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workspaces</SelectItem>
                    {workspaces.map(ws => (
                      <SelectItem key={ws} value={ws}>{ws}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {activeTab === 'branch' && (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Document List */}
          <DocumentList
            documents={documents}
            onDocumentClick={setSelectedDocument}
            onView={setViewingDocument}
            onDelete={() => { }}
            onDownload={handleDownload}
            onSaveToLibrary={handleSaveToLibrary}
          />
        </div>

        {/* Detail Modal */}
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
            onDownload={handleDownload}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {viewingDocument && (
          <DocumentViewerModal
            document={viewingDocument}
            isOpen={!!viewingDocument}
            onClose={() => setViewingDocument(null)}
            onDownload={handleDownload}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}
      </div>
    </AppLayout>
  );
}
