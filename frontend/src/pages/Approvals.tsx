import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { mockApprovals } from '@/data/mockData';
import { Approval, User, type Document } from '@/types/dlms';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  FileText,
  Eye,
  ArrowRightLeft,
  Clock,
  FileSignature,
  CheckCircle2,
  XCircle,
  Shield,
  Paperclip,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransferApprovalModal } from '@/components/approvals/TransferApprovalModal';
import { ApprovalReviewModal } from '@/components/approvals/ApprovalReviewModal';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { ComposeModal } from '@/components/compose/ComposeModal';

type ViewMode = 'needs_action' | 'history';
type ApprovalTypeFilter = 'all' | 'content' | 'routing';
type DateFilter = 'any' | '7d' | '30d' | '90d';

export default function Approvals() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('needs_action');
  const [typeFilter, setTypeFilter] = useState<ApprovalTypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('any');

  // Modal States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
  const [viewerApproval, setViewerApproval] = useState<Approval | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeModalDocument, setComposeModalDocument] = useState<Document | null>(null);

  const handleTransfer = (user: User) => {
    console.log(`Transferring approval ${selectedApproval?.id} to ${user.name}`);
    setIsTransferModalOpen(false);
    setIsReviewModalOpen(false);
    setSelectedApproval(null);
  };

  const handleApprove = (note: string) => {
    console.log(`Approved ${selectedApproval?.id} with note: ${note}`);
    const now = new Date().toISOString();
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === selectedApproval?.id
          ? {
            ...a,
            status: 'approved',
            decision: 'approved',
            decisionDate: now,
            document: {
              ...a.document,
              status: 'approved',
              approvalStatus: 'approved',
              approvalNote: note,
              approvalDate: now,
            },
          }
          : a
      )
    );
    setIsReviewModalOpen(false);
    setSelectedApproval(null);
  };

  const handleReject = (note: string) => {
    console.log(`Rejected ${selectedApproval?.id} with note: ${note}`);
    const now = new Date().toISOString();
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === selectedApproval?.id
          ? {
            ...a,
            status: 'rejected',
            decision: 'rejected',
            decisionDate: now,
            document: {
              ...a.document,
              status: 'rejected',
              approvalStatus: 'rejected',
              approvalNote: note,
              approvalDate: now,
            },
          }
          : a
      )
    );
    setIsReviewModalOpen(false);
    setSelectedApproval(null);
  };

  const openTransferModal = (approval: Approval) => {
    setSelectedApproval(approvals.find((a) => a.id === approval.id) ?? approval);
    setIsTransferModalOpen(true);
  };

  const openReviewModal = (approval: Approval) => {
    setSelectedApproval(approvals.find((a) => a.id === approval.id) ?? approval);
    setIsReviewModalOpen(true);
  };

  const openViewer = (approval: Approval) => {
    const next = approvals.find((a) => a.id === approval.id) ?? approval;
    setSelectedApproval(next);
    setViewerApproval(next);
    setIsViewerOpen(true);
  };

  const handleSendBack = (approval: Approval) => {
    const t = toast({
      title: "Success",
      description: `Successfully sent back to ${approval.requestedBy.name}`,
    });

    setTimeout(() => {
      t.dismiss();
      navigate('/approvals', { replace: true });
    }, 1500);
  };

  const handleSendBackFromViewer = () => {
    if (!selectedApproval) return;
    handleSendBack(selectedApproval);
    setIsViewerOpen(false);
    setViewerApproval(null);
    setSelectedApproval(null);
  };

  const handleSendToOthersFromViewer = () => {
    if (viewerApproval) {
      setComposeModalDocument(viewerApproval.document);
      setIsComposeModalOpen(true);
    }
  };

  const getFilteredApprovals = () => {
    const now = Date.now();
    const rangeDays: Record<Exclude<DateFilter, 'any'>, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const getApprovalTime = (approval: Approval) => {
      const raw =
        viewMode === 'history'
          ? approval.decisionDate || approval.document.approvalDate || approval.document.date
          : approval.document.date;
      const t = Date.parse(raw);
      return Number.isNaN(t) ? null : t;
    };

    return approvals
      .filter((approval) => {
        if (viewMode === 'needs_action') {
          return approval.status === 'pending' || approval.status === 'review';
        }
        return approval.status === 'approved' || approval.status === 'rejected';
      })
      .filter((approval) => typeFilter === 'all' || approval.type === typeFilter)
      .filter((approval) => {
        if (dateFilter === 'any') return true;
        const t = getApprovalTime(approval);
        if (!t) return true;
        const days = rangeDays[dateFilter];
        return now - t <= days * 24 * 60 * 60 * 1000;
      });
  };

  const filteredApprovals = getFilteredApprovals();
  const needsActionCount = approvals.filter(a => a.status === 'pending' || a.status === 'review').length;
  const historyCount = approvals.filter(a => a.status === 'approved' || a.status === 'rejected').length;

  const ApprovalCard = ({ approval }: { approval: Approval }) => {
    const isSignatureApproval = approval.type === 'content';
    const isPending = approval.status === 'pending' || approval.status === 'review';
    const isApproved = approval.status === 'approved';
    const isRejected = approval.status === 'rejected';
    const openFromNeedsAction = viewMode === 'needs_action' && isPending;

    return (
      <div
        onClick={() => {
          if (openFromNeedsAction) {
            openViewer(approval);
          } else if (viewMode === 'history' && isSignatureApproval && (isApproved || isRejected)) {
            openReviewModal(approval);
          }
        }}
        className={cn(
          "rounded-lg border p-4 transition-all hover:shadow-md",
          isPending && "border-amber-200 bg-amber-50/30",
          isApproved && "border-green-200 bg-green-50/30",
          isRejected && "border-red-200 bg-red-50/30",
          (openFromNeedsAction || (viewMode === 'history' && isSignatureApproval && (isApproved || isRejected))) && "cursor-pointer",
          !(openFromNeedsAction || (viewMode === 'history' && isSignatureApproval && (isApproved || isRejected))) && "cursor-default"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Content Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              {/* Approval Type Icon */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                isSignatureApproval ? "bg-primary/10 text-primary" : "bg-purple-100 text-purple-700"
              )}>
                {isSignatureApproval ? (
                  <FileSignature className="w-5 h-5" />
                ) : (
                  <ArrowRightLeft className="w-5 h-5" />
                )}
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {approval.document.title}
                  </h3>
                  {/* Approval Type Badge */}
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0",
                    isSignatureApproval
                      ? "bg-primary/10 text-primary"
                      : "bg-purple-100 text-purple-700"
                  )}>
                    {isSignatureApproval ? 'Signature' : 'Transfer'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1.5">
                    {approval.document.type === 'letter' ? (
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span className="capitalize">{approval.document.type}</span>
                  </div>
                  {approval.document.attachments.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{approval.document.attachments.length} attachment{approval.document.attachments.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">From:</span> {approval.requestedBy.name}
                  </div>
                  {!isSignatureApproval &&
                    approval.targetScope && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span className="font-medium">Receiver:</span> {approval.targetScope}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {/* Status Badge */}
            {isPending ? (
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>Needs Action</span>
              </div>
            ) : isApproved ? (
              <div className="flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-700 bg-red-100 px-3 py-1.5 rounded-full text-sm font-medium">
                <XCircle className="w-4 h-4" />
                <span>Rejected</span>
              </div>
            )}

            {/* Action Buttons */}
            {viewMode === 'needs_action' && isPending ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewer(approval);
                  }}
                  className={cn(
                    "gap-2",
                    isSignatureApproval
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  )}
                >
                  {isSignatureApproval ? (
                    <>
                      <Check className="w-4 h-4" />
                      Review & Sign
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Review Request
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTransferModal(approval);
                  }}
                  className="gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer
                </Button>
              </div>
            ) : viewMode === 'history' ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openViewer(approval);
                  }}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                {isSignatureApproval && isApproved && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendBack(approval);
                      }}
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Send Back
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setComposeModalDocument(approval.document);
                        setIsComposeModalOpen(true);
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      Send to Others
                    </Button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout
      title="Approvals"
      subtitle="Review and act on approval requests"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-muted/30 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('needs_action')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all relative",
                viewMode === 'needs_action'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Needs Action</span>
                {needsActionCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                    {needsActionCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                viewMode === 'history'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>History</span>
                {historyCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                    {historyCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ApprovalTypeFilter)}>
              <SelectTrigger className="h-9 w-[170px] bg-background">
                <SelectValue placeholder="Approval type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="content">Signature approvals</SelectItem>
                <SelectItem value="routing">Transfer approvals</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="h-9 w-[150px] bg-background">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {filteredApprovals.length > 0 ? (
            <div className="space-y-3">
              {filteredApprovals.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {viewMode === 'needs_action' ? (
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <Clock className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {viewMode === 'needs_action'
                  ? 'All caught up!'
                  : 'No history yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {viewMode === 'needs_action'
                  ? 'You have no pending approvals requiring your action at this time.'
                  : 'Completed approvals will appear here for your reference.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <TransferApprovalModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleTransfer}
      />

      <ApprovalReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        approval={selectedApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        onTransfer={() => {
          if (selectedApproval) openTransferModal(selectedApproval);
        }}
        onSendToOthers={(document) => {
          setComposeModalDocument(document);
          setIsComposeModalOpen(true);
        }}
      />

      {viewerApproval && (
        <DocumentViewerModal
          document={viewerApproval.document}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setViewerApproval(null);
          }}
          compactMetadata={
            viewMode === 'needs_action' && (viewerApproval.status === 'pending' || viewerApproval.status === 'review')
          }
          showDecisionNote={
            viewMode === 'history' && (viewerApproval.status === 'approved' || viewerApproval.status === 'rejected')
          }
          approvalContext={
            viewMode === 'needs_action' && (viewerApproval.status === 'pending' || viewerApproval.status === 'review')
              ? {
                approvalType: viewerApproval.type,
                onApprove: (note) => {
                  handleApprove(note);
                  setIsViewerOpen(false);
                  setViewerApproval(null);
                },
                onReject: (note) => {
                  handleReject(note);
                  setIsViewerOpen(false);
                  setViewerApproval(null);
                },
                onTransfer: () => {
                  setIsViewerOpen(false);
                  setViewerApproval(null);
                  openTransferModal(viewerApproval);
                },
              }
              : undefined
          }
          completedApprovalContext={
            viewMode === 'history' && viewerApproval.status === 'approved' && viewerApproval.type === 'content'
              ? {
                onSendBack: handleSendBackFromViewer,
                onSendToOthers: handleSendToOthersFromViewer,
              }
              : undefined
          }
        />
      )}

      <ComposeModal
        isOpen={isComposeModalOpen}
        onClose={() => {
          setIsComposeModalOpen(false);
          setComposeModalDocument(null);
        }}
        preselectedDocument={composeModalDocument || undefined}
      />
    </AppLayout>
  );
}
