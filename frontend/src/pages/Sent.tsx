import { useCallback, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { ItemDetailModal } from '@/components/documents/ItemDetailModal';
import { mockSentItems } from '@/data/mockData';
import { Document } from '@/types/dlms';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { getStoredSentItems } from '@/lib/sentStorage';

export default function Sent() {
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
    const [refreshToken, setRefreshToken] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshToken((t) => t + 1);
    }, []);

    const documents = useMemo(() => {
        const stored = getStoredSentItems();
        const seen = new Set<string>();
        const merged: Document[] = [];

        for (const doc of [...stored, ...mockSentItems]) {
            if (seen.has(doc.id)) continue;
            seen.add(doc.id);
            merged.push(doc);
        }

        return merged;
    }, [refreshToken]);

    const handleDownload = (doc: Document) => {
        console.log('Downloading document:', doc.id);
    };

    const handleSaveToLibrary = (doc: Document) => {
        console.log('Saving document to library:', doc.id);
    };

    return (
        <AppLayout
            title="Sent"
            subtitle="View documents and letters successfully sent"
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            }
        >
            <div className="flex h-[calc(100vh-180px)] animate-fade-in">
                <div className="flex-1 flex flex-col min-w-0">
                    <DocumentList
                        documents={documents}
                        onDocumentClick={setSelectedDocument}
                        onView={setViewingDocument}
                        onDownload={handleDownload}
                        onSaveToLibrary={handleSaveToLibrary}
                        showStatusColumn
                    />
                </div>

                {selectedDocument && (
                    <ItemDetailModal
                        document={selectedDocument}
                        isOpen={!!selectedDocument}
                        onClose={() => setSelectedDocument(null)}
                        source="sent"
                        onView={(doc) => {
                            setSelectedDocument(null);
                            setViewingDocument(doc);
                        }}
                        onDownload={handleDownload}
                        onSaveToLibrary={handleSaveToLibrary}
                    />
                )}

                {viewingDocument && (
                    <DocumentViewerModal
                        document={viewingDocument}
                        isOpen={!!viewingDocument}
                        onClose={() => setViewingDocument(null)}
                        onDownload={handleDownload}
                        onSaveToLibrary={handleSaveToLibrary}
                    />
                )}
            </div>
        </AppLayout>
    );
}
