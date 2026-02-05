import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DraftCard, Draft } from '@/components/drafts/DraftCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export default function Drafts() {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            // Assuming user ID 1 for now as per other components
            const res = await fetch('http://localhost:5000/api/drafts?userId=1');
            if (res.ok) {
                const data = await res.json();
                setDrafts(data);
            }
        } catch (error) {
            console.error('Failed to fetch drafts', error);
            toast.error("Failed to load drafts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (draft: Draft) => {
        if (!confirm('Are you sure you want to delete this draft?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/drafts/${draft.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Draft deleted');
                setDrafts(prev => prev.filter(d => d.id !== draft.id));
            } else {
                toast.error('Failed to delete draft');
            }
        } catch (error) {
            toast.error('Error deleting draft');
        }
    };

    const handleClick = (draft: Draft) => {
        // Navigate to compose with draftId
        navigate(`/compose?draftId=${draft.id}`);
    };

    return (
        <AppLayout
            title="Drafts"
            subtitle="Manage your unfinished documents"
        >
            <div className="panel-section h-full overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">Loading...</div>
                    ) : drafts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {drafts.map(draft => (
                                <DraftCard
                                    key={draft.id}
                                    draft={draft}
                                    onClick={handleClick}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <FileText className="w-16 h-16 mb-4" />
                            <p className="text-lg font-medium">No drafts found</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
