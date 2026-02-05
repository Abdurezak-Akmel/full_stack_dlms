import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, FileText, Mail, User as UserIcon, Search, Filter, Clock, HardDrive, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/components/search/PersonSearch';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    file: File;
    contentType: 'document' | 'letter';
    title?: string;
    tags?: string[];
    subject?: string;
    receiver?: User;
  }) => void;
  users?: User[];
  currentUserName?: string;
  initialFile?: File | null;
}

export function UploadModal({
  isOpen,
  onClose,
  onSave,
  users = [],
  currentUserName = 'Current User',
  initialFile = null,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'document' | 'letter' | null>(null);
  
  // Document fields
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Letter fields
  const [subject, setSubject] = useState('');
  const [receiver, setReceiver] = useState<User | null>(null);
  const [receiverSearch, setReceiverSearch] = useState('');
  const [receiverDepartmentFilter, setReceiverDepartmentFilter] = useState<string>('all');
  
  // System metadata
  const [uploadDate] = useState(new Date().toLocaleDateString());
  const [fileSize, setFileSize] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  // Get unique departments from users
  const availableDepartments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];

  // Filter users for receiver selection
  const getFilteredUsers = () => {
    let filtered = users;

    // Apply department filter
    if (receiverDepartmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === receiverDepartmentFilter);
    }

    // Apply search filter
    if (receiverSearch.trim()) {
      const searchLower = receiverSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSize(formatFileSize(file.size));
      setFileType(file.type || file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN');
      
      // Set default title to file name (without extension)
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(fileNameWithoutExt);
      
      // Generate preview URL
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'd need a PDF viewer library in production
        // For now, show a placeholder
        setPreviewUrl(null);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Handle initial file if provided
  useEffect(() => {
    if (initialFile && isOpen) {
      setSelectedFile(initialFile);
      setFileSize(formatFileSize(initialFile.size));
      setFileType(initialFile.type || initialFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN');
      const fileNameWithoutExt = initialFile.name.replace(/\.[^/.]+$/, '');
      setTitle(fileNameWithoutExt);
      
      if (initialFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(initialFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [initialFile, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setContentType(null);
      setTitle('');
      setTags([]);
      setNewTag('');
      setSubject('');
      setReceiver(null);
      setReceiverSearch('');
      setReceiverDepartmentFilter('all');
      setFileSize('');
      setFileType('');
    }
  }, [isOpen]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!selectedFile || !contentType) return;
    
    // Validate required fields for letters
    if (contentType === 'letter' && (!subject.trim() || !receiver)) {
      return;
    }

    onSave({
      file: selectedFile,
      contentType,
      title: title.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      subject: subject.trim() || undefined,
      receiver: receiver || undefined,
    });
    
    onClose();
  };

  const isSaveEnabled = () => {
    if (!selectedFile || !contentType) return false;
    if (contentType === 'letter') {
      return subject.trim() !== '' && receiver !== null;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 [&>button]:hidden"
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
          <DialogTitle className="pr-8">Upload Content</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Preview */}
          <div className="w-1/2 border-r bg-muted/30 flex items-center justify-center p-6">
            {selectedFile ? (
              previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    {contentType === 'letter' ? (
                      <Mail className="w-10 h-10 text-muted-foreground" />
                    ) : (
                      <FileText className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{fileSize}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">No file selected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a file to see preview
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Metadata Form */}
          <div className="w-1/2 flex flex-col overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* File Selection */}
              <div>
                <Label htmlFor="file-input" className="text-sm font-medium mb-2 block">
                  File
                </Label>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt,.doc,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-input">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {selectedFile ? 'Change File' : 'Select File'}
                    </span>
                  </Button>
                </label>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Content Type Selection (Mandatory) */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Content Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={contentType === 'document' ? 'default' : 'outline'}
                    className={cn(
                      "h-auto py-3 flex flex-col items-center gap-2",
                      contentType === 'document' && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setContentType('document')}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Document</span>
                  </Button>
                  <Button
                    type="button"
                    variant={contentType === 'letter' ? 'default' : 'outline'}
                    className={cn(
                      "h-auto py-3 flex flex-col items-center gap-2",
                      contentType === 'letter' && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setContentType('letter')}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Letter</span>
                  </Button>
                </div>
              </div>

              {/* Document Fields */}
              {contentType === 'document' && (
                <>
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter document title (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-sm font-medium mb-2 block">
                      Tags
                    </Label>
                    <div className="space-y-2">
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="tags"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add tag (optional)"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTag}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Letter Fields */}
              {contentType === 'letter' && (
                <>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter letter subject"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Receiver <span className="text-destructive">*</span>
                    </Label>
                    {receiver ? (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{receiver.name}</p>
                              {receiver.department && (
                                <p className="text-xs text-muted-foreground">{receiver.department}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReceiver(null);
                              setReceiverSearch('');
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove selection"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search employee by name"
                              className="h-9 pl-8"
                              value={receiverSearch}
                              onChange={(e) => setReceiverSearch(e.target.value)}
                            />
                          </div>
                          <Select
                            value={receiverDepartmentFilter}
                            onValueChange={setReceiverDepartmentFilter}
                          >
                            <SelectTrigger className="w-[140px] h-9">
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All departments</SelectItem>
                              {availableDepartments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {receiverSearch.trim() && (
                          <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                            {getFilteredUsers().length > 0 ? (
                              getFilteredUsers().map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => {
                                    setReceiver(user);
                                    setReceiverSearch('');
                                  }}
                                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {user.name}
                                      </p>
                                      {user.department && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {user.department}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-6 text-center text-sm text-muted-foreground">
                                No employees found
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              {/* System Metadata (Read-only) */}
              {selectedFile && (
                <>
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">System Metadata</Label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Upload Date</p>
                        <p className="font-medium">{uploadDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Uploader</p>
                        <p className="font-medium">{currentUserName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">File Size</p>
                        <p className="font-medium">{fileSize}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">File Type</p>
                        <p className="font-medium">{fileType}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isSaveEnabled()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save to My Library
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

