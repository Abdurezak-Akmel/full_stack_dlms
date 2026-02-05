import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockTemplates } from '@/data/mockData';
import { Template } from '@/types/dlms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { mockUsers } from '@/data/mockData';
import type { Document, DocumentType } from '@/types/dlms';
import { 
  FileText, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  Scale, 
  Star, 
  Briefcase,
  Download,
  Eye,
  Search,
  Grid3X3,
  List,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  Scale,
  Star,
  Briefcase,
};

const categories = ['All', 'Internal Memo', 'HR', 'Finance', 'Legal', 'External', 'Custom'];

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [viewingDescription, setViewingDescription] = useState<string>('');

  const openTemplateViewer = (template: Template) => {
    const sender = mockUsers[0];
    const type: DocumentType = template.icon === 'Mail' ? 'letter' : 'document';

    setViewingDescription(template.description);
    setViewingDocument({
      id: `template-${template.id}`,
      title: template.name,
      type,
      sender,
      department: sender?.department,
      date: template.lastUpdated,
      size: '—',
      status: 'draft',
      tags: [template.category],
      securityLevel: 'internal',
      attachments: [],
      comments: [],
      version: 1,
      scope: 'organization',
    });
  };

  const filteredTemplates = mockTemplates.filter(template => {
    const categoryMatch = selectedCategory === 'All' || template.category === selectedCategory;
    const searchMatch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <AppLayout 
      title="Template Library"
      subtitle="Browse and download official document templates"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="h-9 w-9"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="h-9 w-9"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="flex gap-6 h-[calc(100vh-180px)] animate-fade-in">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="panel-section p-4">
            <h3 className="font-semibold text-sm mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedCategory === category 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="panel-section p-4 bg-info/5 border-info/20">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-info">
              <Info className="w-4 h-4" />
              How to Use
            </h3>
            <ol className="text-xs text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-info/20 text-info flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                <span>Download template</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-info/20 text-info flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                <span>Edit in Word/PDF editor</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-info/20 text-info flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                <span>Upload to DLMS</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-info/20 text-info flex items-center justify-center flex-shrink-0 text-[10px] font-bold">4</span>
                <span>Send for approval</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = iconMap[template.icon] || FileText;
                return (
                  <div
                    key={template.id}
                    className="panel-section p-5 hover:shadow-elevated transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{template.category}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download className="w-3 h-3" />
                        {template.downloads.toLocaleString()} downloads
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTemplateViewer(template);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="panel-section">
              <div className="divide-y divide-border">
                {filteredTemplates.map((template) => {
                  const IconComponent = iconMap[template.icon] || FileText;
                  return (
                    <div
                      key={template.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{template.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                        {template.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download className="w-3 h-3" />
                        {template.downloads.toLocaleString()}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTemplateViewer(template);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="panel-section py-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No templates found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>

      {viewingDocument && (
        <DocumentViewerModal
          document={viewingDocument}
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          rightPanelMode="description"
          description={viewingDescription}
        />
      )}
    </AppLayout>
  );
}
