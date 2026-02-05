import { Document } from '@/types/dlms';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, Mail, MoreVertical, Trash2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DraftListProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  onDelete?: (document: Document) => void;
}

export function DraftList({ documents, onDocumentClick, onDelete }: DraftListProps) {
  return (
    <div className="panel-section overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="flex-1 min-w-0">Draft Name</div>
        <div className="w-32 hidden md:block">Contents</div>
        <div className="w-40 hidden lg:block">Receiver</div>
        <div className="w-28 hidden md:block">Date</div>
        <div className="w-10"></div>
      </div>

      {/* Draft Rows */}
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
                  <p className="font-medium text-foreground truncate">{doc.title}</p>
                </div>
              </div>
            </div>

            <div className="w-32 hidden md:block">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{doc.attachments?.length || 0} items</span>
              </div>
            </div>

            <div className="w-40 hidden lg:block">
              <p className="text-sm text-foreground truncate">{doc.sender.name}</p>
              <p className="text-xs text-muted-foreground truncate">{doc.sender.department || 'Draft'}</p>
            </div>

            <div className="w-28 hidden md:block text-sm text-muted-foreground">
              {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            <p className="font-medium">No drafts found</p>
            <p className="text-sm">Drafts will appear here when you save incomplete compose sessions</p>
          </div>
        )
      }
    </div>
  );
}
