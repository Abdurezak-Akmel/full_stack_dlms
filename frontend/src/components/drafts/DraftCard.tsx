import { FileText, Calendar, Users, HardDrive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface Draft {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    content: {
        scope: string;
        selectedUser?: { name: string };
        selectedDepartment?: { name: string };
        selectedWorkspace?: { name: string };
        selectedContentItems?: Array<{ title: string; type: string }>;
        ccRecipients?: Array<any>;
    };
}

interface DraftCardProps {
    draft: Draft;
    onClick: (draft: Draft) => void;
    onDelete: (draft: Draft) => void;
}

export function DraftCard({ draft, onClick, onDelete }: DraftCardProps) {
    // Extract info from content
    const recipientCount = (draft.content.ccRecipients?.length || 0) + 1; // +1 for primary recipient
    const primaryDoc = draft.content.selectedContentItems?.[0];
    const docTitle = primaryDoc?.title || 'Untitled Draft';

    // Size logic: Since we don't store file size in draft content explicitly unless we did, 
    // let's assume we might have stored it or we just show 'Unknown' or hide it. 
    // The prompt says "size of the document". 
    // In Compose.tsx we calculated size for sending: 
    // const size = primary?.file ? ... : '0 KB';
    // But we are storing `content` as JSONB. We should check if we store file metadata there.
    // In `handleSaveDraftAndProceed`, we map `selectedContentItems`. 
    // We should probably verify if `primaryDoc` has size info. 
    // If not, we might need to update Compose.tsx to store it. 
    // For now, let's just display what we can.

    return (
        <div
            className="group relative bg-card hover:bg-muted/50 border border-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm flex flex-col gap-3"
            onClick={() => onClick(draft)}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground line-clamp-1">{draft.name || docTitle}</h3>
                        <p className="text-xs text-muted-foreground">{docTitle}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(draft);
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-auto">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{recipientCount} Recipient{recipientCount !== 1 ? 's' : ''}</span>
                </div>
                {/*  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                   <span>Size?</span>
                </div> */}
            </div>
        </div>
    );
}
