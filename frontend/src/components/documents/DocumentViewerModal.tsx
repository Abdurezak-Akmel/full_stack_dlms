import { useState } from 'react';
import { Document } from '@/types/dlms';
import { X, MessageSquare, User, Clock, FileText, Mail, Send, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SaveOptionsModal } from './SaveOptionsModal';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DocumentViewerModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  rightPanelMode?: 'comments' | 'description';
  description?: string;
  compactMetadata?: boolean;
  showDecisionNote?: boolean;
  onDownload?: (document: Document) => void;
  onSaveToLibrary?: (document: Document) => void;
  approvalContext?: {
    approvalType: 'content' | 'routing';
    onApprove: (note: string) => void;
    onReject: (note: string) => void;
    onTransfer: () => void;
  };
  completedApprovalContext?: {
    onSendBack: () => void;
    onSendToOthers: () => void;
    onSendToOthersModal?: (document: Document) => void;
  };
}

export function DocumentViewerModal({
  document,
  isOpen,
  onClose,
  rightPanelMode = 'comments',
  description,
  compactMetadata = false,
  showDecisionNote = false,
  onDownload,
  onSaveToLibrary,
  approvalContext,
  completedApprovalContext,
}: DocumentViewerModalProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [isNoteValid, setIsNoteValid] = useState(true);

  const openActionDialog = (type: 'approve' | 'reject') => {
    setActionType(type);
    setApprovalNote('');
    setIsNoteValid(true);
    setIsActionDialogOpen(true);
  };

  const handleAction = () => {
    if (!approvalContext || !actionType) return;
    if (!approvalNote.trim()) {
      setIsNoteValid(false);
      return;
    }

    if (actionType === 'approve') approvalContext.onApprove(approvalNote);
    if (actionType === 'reject') approvalContext.onReject(approvalNote);

    setIsActionDialogOpen(false);
    setActionType(null);
    setApprovalNote('');
  };

  const decisionStatus = document.approvalStatus;
  const shouldShowDecisionNote =
    showDecisionNote &&
    !!decisionStatus &&
    decisionStatus !== 'pending';

  const decisionLabel = decisionStatus === 'approved' ? 'Approval Note' : 'Rejection Note';
  const decisionText = document.approvalNote?.trim() || 'No note provided.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 bg-background/95 backdrop-blur-md flex flex-col overflow-hidden [&>button]:hidden"
        overlayClassName="bg-background/80 backdrop-blur-sm"
      >
        {/* Top Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              document.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
            )}>
              {document.type === 'letter' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-lg truncate max-w-xl">{document.title}</h2>
              {approvalContext && (
                <div className="mt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      approvalContext.approvalType === 'content'
                        ? "bg-primary/10 text-primary"
                        : "bg-purple-100 text-purple-700"
                    )}
                  >
                    {approvalContext.approvalType === 'content' ? 'Signature Request' : 'Transfer Approval'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Metadata */}
          <div className="w-72 border-r bg-background flex flex-col">
            {shouldShowDecisionNote && (
              <div className="p-4 border-b bg-background">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    {decisionStatus === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <h3 className="text-sm font-semibold">{decisionLabel}</h3>
                  </div>
                  <div className="max-h-28 overflow-y-auto">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {decisionText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              <div className={cn('space-y-4', compactMetadata ? 'space-y-3' : 'space-y-6')}>
                <div>
                  <h3 className={cn(
                    'font-medium text-muted-foreground uppercase tracking-wider',
                    compactMetadata ? 'text-xs mb-3' : 'text-sm mb-4'
                  )}>Details</h3>
                  <div className={cn(compactMetadata ? 'space-y-3' : 'space-y-4')}>
                    <div className="flex gap-3">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Sender</p>
                        <p className="text-sm font-medium truncate">{document.sender.name}</p>
                        {!!document.sender.department && (
                          <p className="text-xs text-muted-foreground truncate">{document.sender.department}</p>
                        )}
                      </div>
                    </div>

                    {document.type === 'letter' && (
                      <div className="flex gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Subject</p>
                          <p className="text-sm font-medium truncate">{document.title}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="text-sm font-medium">
                          {new Date(document.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">Size: {document.size}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {!shouldShowDecisionNote && document.approvalStatus && document.approvalStatus !== 'pending' && document.approvalNote && (
                  <div className={cn(
                    'p-4 bg-muted/20 rounded-lg border border-muted',
                    compactMetadata ? 'mt-4' : 'mt-6'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {document.approvalStatus === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <h3 className="text-sm font-medium">
                        {document.approvalStatus === 'approved' ? 'Approval Note' : 'Rejection Note'}
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {document.approvalNote}
                    </p>
                    {document.approvalDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {document.approvalStatus === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                        {new Date(document.approvalDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {approvalContext && (
              <div className="sticky bottom-0 border-t bg-background p-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Approval Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => openActionDialog('approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => openActionDialog('reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={approvalContext.onTransfer}
                  >
                    Transfer
                  </Button>
                </div>
              </div>
            )}

            {completedApprovalContext && (
              <div className="sticky bottom-0 border-t bg-background p-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Document Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={completedApprovalContext.onSendBack}
                  >
                    Send Back to Sender
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={completedApprovalContext.onSendToOthers}
                  >
                    Send to Others
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Content Preview */}
          <div className="flex-1 bg-muted/30 flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-full max-w-4xl bg-background shadow-lg rounded-xl min-h-[800px] flex flex-col items-center justify-center border">
              {/* Placeholder for actual content rendering */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  {document.type === 'letter' ? (
                    <Mail className="w-10 h-10 text-muted-foreground" />
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Document Preview</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    This is a read-only preview of the document content. In a production environment,
                    this would render the actual PDF, Word document, or Letter content.
                  </p>
                </div>
                {(onDownload || onSaveToLibrary) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSaveModalOpen(true)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Comments */}
          <div className="w-80 border-l flex flex-col bg-muted/10">
            {rightPanelMode === 'description' ? (
              <>
                <div className="p-4 border-b bg-background/50">
                  <h3 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Description
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description || 'No description provided'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b bg-background/50">
                  <h3 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments ({document.comments.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {document.comments.length > 0 ? (
                    document.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                          {comment.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{comment.user.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No comments yet
                    </div>
                  )}
                </div>
                <div className="p-4 border-t bg-background/50">
                  <div className="relative">
                    <Textarea
                      placeholder="Add a comment..."
                      className="min-h-[80px] resize-none pr-10"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 h-7 w-7"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>

      {(onDownload || onSaveToLibrary) && (
        <SaveOptionsModal
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          onSaveToLibrary={() => {
            if (onSaveToLibrary) onSaveToLibrary(document);
          }}
          onSaveToPC={() => {
            if (onDownload) onDownload(document);
          }}
        />
      )}

      <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Document' : 'Reject Document'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a note (required):
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 space-y-2">
            <Textarea
              placeholder={actionType === 'approve' ? 'Add approval note...' : 'Add reason for rejection...'}
              value={approvalNote}
              onChange={(e) => {
                setApprovalNote(e.target.value);
                setIsNoteValid(true);
              }}
              rows={3}
              className={!isNoteValid ? 'border-red-500' : ''}
            />
            {!isNoteValid && (
              <p className="text-sm text-red-500">Note is required</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
