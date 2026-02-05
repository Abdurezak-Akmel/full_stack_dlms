import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, Download } from 'lucide-react';

interface SaveOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToLibrary: () => void;
  onSaveToPC: () => void;
}

export function SaveOptionsModal({
  isOpen,
  onClose,
  onSaveToLibrary,
  onSaveToPC,
}: SaveOptionsModalProps) {
  const handleSaveToLibrary = () => {
    onSaveToLibrary();
    onClose();
  };

  const handleSaveToPC = () => {
    onSaveToPC();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        overlayClassName="backdrop-blur-sm"
      >
        <DialogHeader>
          <DialogTitle>Save Content</DialogTitle>
          <DialogDescription>
            Choose how you want to save this content
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:bg-muted/50"
            onClick={handleSaveToLibrary}
          >
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              <span className="font-medium">Save to My Library</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Stores the content inside the system library
            </p>
          </Button>
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:bg-muted/50"
            onClick={handleSaveToPC}
          >
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <span className="font-medium">Save to PC</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Downloads the file to the local device
            </p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




