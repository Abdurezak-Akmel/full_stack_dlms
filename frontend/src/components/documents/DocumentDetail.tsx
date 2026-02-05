import { useState } from 'react';
import { Document } from '@/types/dlms';
import { X, Download, Save, Share2, Trash2, MessageSquare, Paperclip, Shield, Clock, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { SaveOptionsModal } from './SaveOptionsModal';

interface DocumentDetailProps {
  document: Document;
  onClose: () => void;
  onDownload?: (document: Document) => void;
  onSaveToLibrary?: (document: Document) => void;
}

export function DocumentDetail({ document, onClose, onDownload, onSaveToLibrary }: DocumentDetailProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  return (
    <div className="w-[480px] h-full bg-card border-l border-border flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-lg font-semibold text-foreground truncate">{document.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={document.status} />
            <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded">
              {document.type}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Meta Information */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-sm font-medium">{document.sender.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Building className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium">{document.department || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {new Date(document.date).toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Security</p>
                <p className="text-sm font-medium capitalize">{document.securityLevel}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Attachments */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({document.attachments.length})
            </h3>
          </div>
          
          {document.attachments.length > 0 ? (
            <div className="space-y-2">
              {document.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary uppercase">
                        {attachment.type}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{attachment.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>
          )}
        </div>

        <Separator />

        {/* Comments */}
        <div className="p-4">
          <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4" />
            Comments ({document.comments.length})
          </h3>
          
          {document.comments.length > 0 ? (
            <div className="space-y-3 mb-4">
              {document.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-primary">
                        {comment.user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 pl-8">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <Textarea 
              placeholder="Add a comment..." 
              className="min-h-[80px] resize-none"
            />
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border flex items-center gap-2">
        <Button variant="outline" className="flex-1" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        {(onDownload || onSaveToLibrary) && (
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            onClick={() => setSaveModalOpen(true)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <SaveOptionsModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSaveToLibrary={() => {
          if (onSaveToLibrary) {
            onSaveToLibrary(document);
          }
        }}
        onSaveToPC={() => {
          if (onDownload) {
            onDownload(document);
          }
        }}
      />
    </div>
  );
}
