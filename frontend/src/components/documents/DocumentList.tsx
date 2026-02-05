import { useState } from 'react';
import { Document } from '@/types/dlms';

import { FileText, Mail, MoreVertical, Paperclip, User, Building2, Briefcase, Globe, Eye, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveOptionsModal } from './SaveOptionsModal';

interface DocumentListProps {
  documents: Document[];
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onDocumentClick: (document: Document) => void;
  onView?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onSaveToLibrary?: (document: Document) => void;
  showStatusColumn?: boolean;
}

export function DocumentList({ documents, onDocumentClick, onView, onDelete, onDownload, onSaveToLibrary, showStatusColumn = false }: DocumentListProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  return (
    <div className="panel-section overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="flex-1 min-w-0">Title</div>
        <div className="w-24 hidden md:block">Type</div>
        <div className="w-40 hidden lg:block">Sender</div>
        <div className="w-28 hidden md:block">Date</div>

        {showStatusColumn && (
          <div className="w-36 hidden md:block">Status</div>
        )}

        <div className="w-20 hidden sm:block">Size (MB)</div>
        <div className="w-10"></div>
      </div>

      {/* Document Rows */}
      <div className="divide-y divide-border">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="document-row group cursor-pointer"
            onClick={() => onDocumentClick(doc)}
          >
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                doc.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
              )}>
                {doc.type === 'letter' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="font-medium text-foreground truncate hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const filename = doc.file_path ? doc.file_path.split(/[\\/]/).pop() : doc.original_name;
                      window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
                    }}
                  >
                    {doc.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-24 hidden md:block">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded capitalize",
                doc.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
              )}>
                {doc.type}
              </span>
            </div>

            <div className="w-40 hidden lg:block">
              <p className="text-sm text-foreground truncate">{doc.sender?.name || 'System'}</p>
              <p className="text-xs text-muted-foreground truncate">{doc.sender?.department || 'Admin'}</p>
            </div>

            <div className="w-28 hidden md:block text-sm text-muted-foreground">
              {new Date(doc.date || doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            {showStatusColumn && (
              <div className="w-36 hidden md:block">
                <StatusBadge status={doc.status} />
              </div>
            )}

            <div className="w-20 hidden sm:block text-sm text-muted-foreground">
              {doc.size ? `${(Number(doc.size) / (1024 * 1024)).toFixed(2)} MB` : '0 MB'}
            </div>

            <div className="w-10">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {/* View / Open */}
                    <DropdownMenuItem onClick={() => {
                      // Construct URL - assuming backend is localhost:5000 and file_path is stored relative or absolute
                      // We need to handle how path is stored. 
                      // If stored as 'uploads\file.pdf', we need to clean it.
                      const filename = doc.file_path ? doc.file_path.split(/[\\/]/).pop() : doc.original_name;
                      window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Open
                    </DropdownMenuItem>

                    {/* Download */}
                    <DropdownMenuItem onClick={() => {
                      if (onDownload) {
                        onDownload(doc);
                      } else {
                        // Fallback default download
                        const filename = doc.file_path ? doc.file_path.split(/[\\/]/).pop() : doc.original_name;
                        const link = document.createElement('a');
                        link.href = `http://localhost:5000/uploads/${filename}`;
                        link.download = doc.original_name || filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}>
                      <Save className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>

                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(doc)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {
        documents.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No documents found</p>
            <p className="text-sm">Documents and letters will appear here</p>
          </div>
        )
      }

      {selectedDocument && (
        <SaveOptionsModal
          isOpen={saveModalOpen}
          onClose={() => {
            setSaveModalOpen(false);
            setSelectedDocument(null);
          }}
          onSaveToLibrary={() => {
            if (onSaveToLibrary && selectedDocument) {
              onSaveToLibrary(selectedDocument);
            }
          }}
          onSaveToPC={() => {
            if (onDownload && selectedDocument) {
              onDownload(selectedDocument);
            }
          }}
        />
      )}
    </div>
  );
}
