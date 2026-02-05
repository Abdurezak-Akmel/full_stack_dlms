import { useState, useEffect } from 'react';
import { Document } from '@/types/dlms';
import { X, Save, Share2, Trash2, MessageSquare, Shield, Clock, User, Building, Pencil, Check, X as XIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { SaveOptionsModal } from './SaveOptionsModal';
import { cn } from '@/lib/utils';

interface ItemDetailModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  source: 'archive' | 'inbox' | 'sent';
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onSaveToLibrary?: (document: Document) => void;
}

export function ItemDetailModal({ document, isOpen, onClose, source, onView, onDownload, onSaveToLibrary }: ItemDetailModalProps) {
  const isEditable = source === 'archive';
  const isLibrary = source === 'archive'; // Library content uses "Notes" instead of "Comments"

  // Edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTitle, setEditedTitle] = useState(document.title);
  const [editedTags, setEditedTags] = useState<string[]>(document.tags);
  const [newTagInput, setNewTagInput] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);



  // Reset edit state when document changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedTitle(document.title);
      setEditedTags(document.tags);
      setIsEditingTitle(false);
      setIsEditingTags(false);
      setNewTagInput('');
    }
  }, [document.id, isOpen]);

  const handleSaveTitle = () => {
    // In a real app, this would save to backend
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditedTitle(document.title);
    setIsEditingTitle(false);
  };

  const handleSaveTags = () => {
    // In a real app, this would save to backend
    setIsEditingTags(false);
    setNewTagInput('');
  };

  const handleCancelTags = () => {
    setEditedTags(document.tags);
    setIsEditingTags(false);
    setNewTagInput('');
  };

  const addTag = () => {
    if (newTagInput.trim() && !editedTags.includes(newTagInput.trim())) {
      setEditedTags([...editedTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 [&>button]:hidden"
        overlayClassName="backdrop-blur-sm"
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex-1 min-w-0">
              {isEditable && isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleSaveTitle)}
                    className="flex-1 h-9"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveTitle}
                    className="h-9 w-9"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelTitle}
                    className="h-9 w-9"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">{document.title}</h2>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingTitle(true)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={document.status} />
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded capitalize",
                  document.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                )}>
                  {document.type}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-sm font-medium truncate">{document.sender.name}</p>
                {source === 'inbox' && document.sender.department && (
                  <p className="text-xs text-muted-foreground truncate">{document.sender.department}</p>
                )}
              </div>
            </div>

            {document.department && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Building className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium truncate">{document.department}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {new Date(document.date).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Security</p>
                <p className="text-sm font-medium capitalize">{document.securityLevel}</p>
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Size:</span> {document.size}
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Tags</p>
              {isEditable && !isEditingTags && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTags(true)}
                  className="h-7"
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {isEditable && isEditingTags ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editedTags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="h-8 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    className="h-8"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveTags}
                    className="h-8"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelTags}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(isEditable ? editedTags : document.tags).length > 0 ? (
                  (isEditable ? editedTags : document.tags).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Comments/Notes */}
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" />
              {isLibrary ? 'Notes' : 'Comments'} ({document.comments.length})
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
        <div className="p-6 pt-4 border-t flex items-center gap-2">
          {onView && (
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" size="sm" onClick={() => onView(document)}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          )}
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
          {isEditable && (
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>

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
    </Dialog>
  );
}
