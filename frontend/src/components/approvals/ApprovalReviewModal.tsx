import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Approval, type Document } from '@/types/dlms';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import {
    User,
    X,
    Check,
    XCircle,
    ArrowLeft,
    ArrowRightLeft,
    Eye,
    FileSignature,
    Clock,
    CheckCircle2,
    XCircle as XCircleIcon,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ApprovalReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    approval: Approval | null;
    onApprove: (note: string) => void;
    onReject: (note: string) => void;
    onTransfer: () => void;
    onSendToOthers?: (document: Document) => void;
}

export function ApprovalReviewModal({
    isOpen,
    onClose,
    approval,
    onApprove,
    onReject,
    onTransfer,
    onSendToOthers
}: ApprovalReviewModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'return-sender' | 'return-others' | null>(null);
    const [approvalNote, setApprovalNote] = useState('');
    const [isNoteValid, setIsNoteValid] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    const isCompleted = approval?.status === 'approved' || approval?.status === 'rejected';
    const decisionStatus = approval?.document.approvalStatus
        ?? (approval?.status === 'approved' ? 'approved' : approval?.status === 'rejected' ? 'rejected' : 'pending');
    const decisionLabel = decisionStatus === 'approved' ? 'Approval Note' : 'Rejection Note';
    const decisionText = approval?.document.approvalNote?.trim() || 'No note provided.';

    if (!approval) return null;

    const handleReturnToSender = () => {
        const t = toast({
          title: "Success",
          description: `Successfully sent back to ${approval.requestedBy.name}`,
        });

        onClose();

        setTimeout(() => {
          t.dismiss();
          navigate('/approvals', { replace: true });
        }, 1500);
    };

    const handleReturnToOthers = () => {
        onClose();
        if (onSendToOthers) {
          onSendToOthers(approval.document);
        }
    };

    const handleAction = async () => {
        const requiresNote = actionType === 'approve' || actionType === 'reject';
        if (requiresNote && !approvalNote.trim()) {
            setIsNoteValid(false);
            return;
        }

        setIsSubmitting(true);
        try {
            if (actionType === 'approve') {
                await onApprove(approvalNote);
            } else if (actionType === 'reject') {
                await onReject(approvalNote);
            } else if (actionType === 'return-sender') {
                // Handle return to sender
                toast({
                  title: "Success",
                  description: `Successfully sent back to ${approval.requestedBy.name}`,
                });
                onClose();
                return;
            } else if (actionType === 'return-others') {
                // Handle return to others (open compose modal)
                if (onSendToOthers && approval) {
                  onSendToOthers(approval.document);
                }
                return;
            }
            onClose();
        } finally {
            setIsSubmitting(false);
            setIsActionDialogOpen(false);
            setApprovalNote('');
        }
    };

    const openActionDialog = (type: 'approve' | 'reject' | 'return-sender' | 'return-others') => {
        setActionType(type);
        setApprovalNote('');
        setIsNoteValid(true);
        setIsActionDialogOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <DocumentViewerModal
                document={approval.document}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                compactMetadata
                showDecisionNote={isCompleted}
            />
            <div className="w-full max-w-2xl max-h-[90vh] bg-background shadow-xl flex flex-col rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {approval.type === 'content' ? (
                                <FileSignature className="w-5 h-5 text-primary" />
                            ) : (
                                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                            )}
                            <h2 className="text-lg font-semibold text-foreground truncate">
                                {approval.type === 'content' ? 'Signature Required' : 'Transfer Request'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {approval.status === 'pending' || approval.status === 'review' ? (
                                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>Pending</span>
                                </div>
                            ) : approval.status === 'approved' ? (
                                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Completed</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs">
                                    <XCircleIcon className="w-3 h-3" />
                                    <span>Rejected</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Document Info */}
                <div className="p-4 border-b">
                    <div className="space-y-1">
                        <h3 className="text-base font-medium">{approval.document.title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {approval.document.type === 'letter' ? 'Letter' : 'Document'}
                        </p>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Sender</p>
                                <p className="text-sm font-medium truncate">{approval.requestedBy.name}</p>
                                {!!approval.requestedBy.department && (
                                    <p className="text-xs text-muted-foreground truncate">{approval.requestedBy.department}</p>
                                )}
                            </div>
                        </div>

                        {approval.type === 'content' && approval.document.type === 'letter' && (
                            <div className="text-sm">
                                <span className="text-xs text-muted-foreground">Subject</span>
                                <p className="font-medium truncate">{approval.document.title}</p>
                            </div>
                        )}

                        <div className="text-sm">
                            <span className="text-xs text-muted-foreground">Submitted</span>
                            <p className="font-medium">
                                {new Date(approval.document.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="text-xs text-muted-foreground">Size: {approval.document.size}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                'px-4 py-3 text-sm font-medium border-b-2',
                                activeTab === 'details'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={cn(
                                'px-4 py-3 text-sm font-medium border-b-2',
                                activeTab === 'comments'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Comments
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'details' ? (
                        <div className="p-4 space-y-6">
                            {isCompleted ? (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">{decisionLabel}</h4>
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                                        {decisionText}
                                    </p>
                                    {approval.document.approvalDate && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {decisionStatus === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                                            {new Date(approval.document.approvalDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {approval.document.comments[0]?.content || 'No additional details provided.'}
                                    </p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            <Textarea
                                placeholder="Add a comment..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                            />
                            <div className="flex justify-end">
                                <Button size="sm">Post Comment</Button>
                            </div>

                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No comments yet
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with actions */}
                <div className="p-4 border-t flex flex-col gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsViewerOpen(true)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Document
                    </Button>

                    {approval.status === 'pending' || approval.status === 'review' ? (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={onTransfer}
                            >
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Transfer
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => openActionDialog('reject')}
                                disabled={isSubmitting}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => openActionDialog('approve')}
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </div>
                    ) : (
                        approval.type === 'content' ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleReturnToSender}
                                    disabled={isSubmitting}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Return to Sender
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleReturnToOthers}
                                    disabled={isSubmitting}
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Return to Others
                                </Button>
                            </div>
                        ) : null
                    )}

                    {isSubmitting && (
                        <div className="text-sm text-muted-foreground text-center">
                            Processing your request...
                        </div>
                    )}
                </div>

                {/* Action Confirmation Dialog */}
                <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {actionType === 'approve' && 'Approve Document'}
                                {actionType === 'reject' && 'Reject Document'}
                                {actionType === 'return-sender' && 'Return to Sender'}
                                {actionType === 'return-others' && 'Return to Others'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {actionType === 'approve' && 'Please provide a note for this approval (required):'}
                                {actionType === 'reject' && 'Please provide a reason for rejection (required):'}
                                {actionType === 'return-sender' && 'Are you sure you want to return this document to the sender?'}
                                {actionType === 'return-others' && 'You will be redirected to compose a new document to return to others.'}
                            </AlertDialogDescription>

                            {(actionType === 'approve' || actionType === 'reject') && (
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
                                        <p className="text-sm text-red-500">
                                            {actionType === 'approve' ? 'Approval note is required' : 'Rejection reason is required'}
                                        </p>
                                    )}
                                </div>
                            )}
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleAction}
                                disabled={isSubmitting}
                                className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                            >
                                {isSubmitting ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        {actionType === 'approve' && 'Approve'}
                                        {actionType === 'reject' && 'Reject'}
                                        {actionType === 'return-sender' && 'Confirm'}
                                        {actionType === 'return-others' && 'Continue'}
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

