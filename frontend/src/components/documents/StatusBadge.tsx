import { DocumentStatus } from '@/types/dlms';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  approved: { label: 'Approved', className: 'status-approved' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  review: { label: 'In Review', className: 'status-review' },
  shared: { label: 'Shared', className: 'status-shared' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', className: 'status-approved' },
  pending_approval: { label: 'Pending Approval', className: 'status-pending' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn("status-badge", config.className, className)}>
      {config.label}
    </span>
  );
}
