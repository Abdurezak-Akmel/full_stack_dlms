import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadModal } from '@/components/documents/UploadModal';
import { currentUser, mockDocuments } from '@/data/mockData';
import type { Document } from '@/types/dlms';
import type { User } from '@/components/search/PersonSearch';
import { useToast } from '@/hooks/use-toast';
import { addStoredSentItem } from '@/lib/sentStorage';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Building,
  FileText,
  Paperclip,
  Send,
  CheckCheck,
  FileArchive,
  Inbox,
  Upload,
  User as UserIcon,
  Users,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  Mail,
  Filter,
  Eye,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Scope = 'person' | 'department' | 'workspace' | 'organization';

interface Department {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
}
type ContentSource = 'archive' | 'inbox' | 'upload';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDocument?: Document;
}

export function ComposeModal({ isOpen, onClose, preselectedDocument }: ComposeModalProps) {
  const { toast } = useToast();
  // Form state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scope, setScope] = useState<Scope>('person');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // Mock data - in a real app, this would come from an API
  const users: User[] = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Finance',
      avatar: ''
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'Legal',
      avatar: ''
    },
    {
      id: 'user3',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      department: 'HR',
      avatar: ''
    },
    {
      id: 'user4',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      department: 'Finance',
      avatar: ''
    },
    {
      id: 'user5',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      department: 'Engineering',
      avatar: ''
    },
    {
      id: 'user6',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      department: 'Marketing',
      avatar: ''
    },
  ];

  const departments: Department[] = [
    { id: 'dept1', name: 'Finance' },
    { id: 'dept2', name: 'Legal' },
    { id: 'dept3', name: 'Human Resources' },
    { id: 'dept4', name: 'Engineering' },
    { id: 'dept5', name: 'Marketing' },
  ];

  const workspaces: Workspace[] = [
    { id: 'ws1', name: 'Executive Team' },
    { id: 'ws2', name: 'Project Alpha' },
    { id: 'ws3', name: 'Customer Support' },
  ];

  const [ccRecipients, setCcRecipients] = useState<{ id: string, name: string }[]>([]);
  const [contentSource, setContentSource] = useState<ContentSource>('archive');

  // Personal recipient search and filter states
  const [personSearch, setPersonSearch] = useState('');
  const [personDepartmentFilter, setPersonDepartmentFilter] = useState<string>('all');
  const [ccSearch, setCcSearch] = useState('');
  const [ccDepartmentFilter, setCcDepartmentFilter] = useState<string>('all');
  const [selectedContentItems, setSelectedContentItems] = useState<Array<{
    id: string;
    title: string;
    type: 'letter' | 'document';
    source: ContentSource;
    file?: File;
  }>>([]);
  const [showContentSelection, setShowContentSelection] = useState(true);

  // Search and filter states
  const [archiveSearch, setArchiveSearch] = useState('');
  const [inboxSearch, setInboxSearch] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'letters' | 'documents'>('all');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'organization' | 'workspace' | 'department' | 'personal'>('all');

  // Hide selection UI when content is added
  useEffect(() => {
    if (selectedContentItems.length > 0) {
      setShowContentSelection(false);
    } else {
      setShowContentSelection(true);
    }
  }, [selectedContentItems.length]);

  const [comment, setComment] = useState('');
  const [isSendingForApproval, setIsSendingForApproval] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const availableDocuments: Document[] = mockDocuments.slice(0, 4);

  // Preselect document if provided
  useEffect(() => {
    if (preselectedDocument && isOpen) {
      setSelectedContentItems([{
        id: preselectedDocument.id,
        title: preselectedDocument.title,
        type: preselectedDocument.type,
        source: 'archive'
      }]);
      setShowContentSelection(false);
    }
  }, [preselectedDocument, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setScope('person');
      setSelectedUser(null);
      setSelectedDepartment(null);
      setSelectedWorkspace(null);
      setCcRecipients([]);
      setContentSource('archive');
      setPersonSearch('');
      setPersonDepartmentFilter('all');
      setCcSearch('');
      setCcDepartmentFilter('all');
      setSelectedContentItems([]);
      setShowContentSelection(true);
      setArchiveSearch('');
      setInboxSearch('');
      setArchiveFilter('all');
      setInboxFilter('all');
      setComment('');
      setIsSendingForApproval(false);
      setShowCommentSection(false);
      setShowPreview(false);
      setUploadModalOpen(false);
      setUploadedFile(null);
    }
  }, [isOpen]);

  // Get unique departments from users
  const availableDepartments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];

  // Filter users for personal recipient selection
  const getFilteredUsers = () => {
    let filtered = users;

    // Apply department filter
    if (personDepartmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === personDepartmentFilter);
    }

    // Apply search filter
    if (personSearch.trim()) {
      const searchLower = personSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Filter users for CC selection
  const getFilteredCcUsers = () => {
    let filtered = users;

    // Apply department filter
    if (ccDepartmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === ccDepartmentFilter);
    }

    // Apply search filter
    if (ccSearch.trim()) {
      const searchLower = ccSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Exclude already selected main recipient
    if (selectedUser) {
      filtered = filtered.filter(user => user.id !== selectedUser.id);
    }

    return filtered;
  };

  // Add CC recipient
  const addCcRecipient = (user: User) => {
    if (!ccRecipients.some(cc => cc.id === user.id)) {
      setCcRecipients(prev => [...prev, { id: user.id, name: user.name }]);
    }
  };

  // Remove CC recipient
  const removeCcRecipient = (id: string) => {
    setCcRecipients(prev => prev.filter(cc => cc.id !== id));
  };

  // Filter Archive documents
  const getFilteredArchiveDocuments = () => {
    let filtered = availableDocuments;

    // Apply type filter
    if (archiveFilter === 'letters') {
      filtered = filtered.filter(doc => doc.type === 'letter');
    } else if (archiveFilter === 'documents') {
      filtered = filtered.filter(doc => doc.type === 'document');
    }

    // Apply search filter
    if (archiveSearch.trim()) {
      const searchLower = archiveSearch.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Filter Inbox documents
  const getFilteredInboxDocuments = () => {
    let filtered = availableDocuments;

    // Apply category filter
    if (inboxFilter === 'organization') {
      filtered = filtered.filter(doc => !doc.workspace && !doc.department);
    } else if (inboxFilter === 'workspace') {
      filtered = filtered.filter(doc => doc.workspace);
    } else if (inboxFilter === 'department') {
      filtered = filtered.filter(doc => doc.department && !doc.workspace);
    } else if (inboxFilter === 'personal') {
      filtered = filtered.filter(doc => !doc.workspace && !doc.department);
    }

    // Apply search filter
    if (inboxSearch.trim()) {
      const searchLower = inboxSearch.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.sender.name.toLowerCase().includes(searchLower) ||
        doc.sender.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const nextStep = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, 3)), []);
  const prevStep = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 1)), []);

  const handleSelectPerson = useCallback((user: User) => {
    setSelectedUser(user);
    setSelectedDepartment(null);
    setSelectedWorkspace(null);
    setPersonSearch('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      scope,
      ccRecipients,
      contentSource,
      selectedContentItems,
      comment,
      isSendingForApproval
    });

    const primary = selectedContentItems[0];
    const size = primary?.file
      ? `${Math.max(1, Math.round(primary.file.size / 1024))} KB`
      : '0 KB';

    const sentDoc: Document = {
      id: `sent-${Date.now()}`,
      title: primary?.title || 'Untitled',
      type: primary?.type || 'document',
      sender: currentUser,
      date: new Date().toISOString().slice(0, 10),
      size,
      status: isSendingForApproval ? 'pending_approval' : 'sent',
      department: currentUser.department,
      tags: [],
      securityLevel: 'internal',
      attachments: [],
      comments: [],
      version: 1,
    };

    addStoredSentItem(sentDoc);

    const recipientName =
      scope === 'person'
        ? (selectedUser?.name || 'recipient')
        : scope === 'department'
          ? (selectedDepartment?.name || 'department')
          : scope === 'workspace'
            ? (selectedWorkspace?.name || 'workspace')
            : 'organization';

    const t = toast({
      title: 'Success',
      description: `Successfully sent to ${recipientName}`,
    });

    setTimeout(() => {
      t.dismiss();
      onClose();
    }, 1500);
  };

  const addContentItem = (item: {
    id: string;
    title: string;
    type: 'letter' | 'document';
    source: ContentSource;
    file?: File;
  }) => {
    // Check if item already exists
    if (!selectedContentItems.some(ci => ci.id === item.id)) {
      setSelectedContentItems(prev => [...prev, item]);
      setShowContentSelection(false);
    }
  };

  const removeContentItem = (id: string) => {
    setSelectedContentItems(prev => prev.filter(item => item.id !== id));
  };

  const moveContentItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setSelectedContentItems(prev => {
        const newItems = [...prev];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        return newItems;
      });
    } else if (direction === 'down' && index < selectedContentItems.length - 1) {
      setSelectedContentItems(prev => {
        const newItems = [...prev];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        return newItems;
      });
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-2",
              currentStep >= step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
          </div>
          <span className="text-xs text-muted-foreground">
            {step === 1 && 'Recipients'}
            {step === 2 && 'Content'}
            {step === 3 && 'Review & Send'}
          </span>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 bg-background/95 backdrop-blur-md flex flex-col">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Send to Others</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <StepIndicator />

            {/* Step 1: Recipients */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Who should receive this?</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose recipients and CC for this document.
                  </p>
                </div>

                {/* Compact recipient selection */}
                <div className="space-y-4">
                  {/* Scope selection - horizontal */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Scope</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={scope === 'person' ? 'default' : 'outline'}
                        onClick={() => setScope('person')}
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Person
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={scope === 'department' ? 'default' : 'outline'}
                        onClick={() => setScope('department')}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Department
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={scope === 'workspace' ? 'default' : 'outline'}
                        onClick={() => setScope('workspace')}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Workspace
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={scope === 'organization' ? 'default' : 'outline'}
                        onClick={() => setScope('organization')}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Organization
                      </Button>
                    </div>
                  </div>

                  {/* Recipient selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">To</Label>
                      {scope === 'person' && (
                        <div className="space-y-2">
                          {selectedUser ? (
                            <div className="border rounded-md bg-muted/20 p-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-primary">
                                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{selectedUser.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedUser(null);
                                  setPersonSearch('');
                                }}
                                aria-label="Remove selected person"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    placeholder="Search people..."
                                    value={personSearch}
                                    onChange={(e) => setPersonSearch(e.target.value)}
                                    className="pl-10 h-9"
                                  />
                                </div>
                                <Select value={personDepartmentFilter} onValueChange={setPersonDepartmentFilter}>
                                  <SelectTrigger className="w-32 h-9">
                                    <SelectValue placeholder="Dept" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {availableDepartments.map((dept) => (
                                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="max-h-32 overflow-y-auto border rounded-md">
                                {getFilteredUsers().map((user) => (
                                  <button
                                    key={user.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectPerson(user);
                                    }}
                                    aria-pressed={selectedUser?.id === user.id}
                                    className={cn(
                                      "w-full p-2 text-left hover:bg-muted/50 transition-colors",
                                      selectedUser?.id === user.id && "bg-primary/10"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-xs font-medium text-primary">
                                          {user.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {scope === 'department' && (
                        <Select value={selectedDepartment?.id || ''} onValueChange={(value) => {
                          const dept = departments.find(d => d.id === value);
                          setSelectedDepartment(dept || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {scope === 'workspace' && (
                        <Select value={selectedWorkspace?.id || ''} onValueChange={(value) => {
                          const ws = workspaces.find(w => w.id === value);
                          setSelectedWorkspace(ws || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose workspace" />
                          </SelectTrigger>
                          <SelectContent>
                            {workspaces.map((ws) => (
                              <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* CC Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">CC (optional)</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              placeholder="Search people to CC..."
                              value={ccSearch}
                              onChange={(e) => setCcSearch(e.target.value)}
                              className="pl-10 h-9"
                            />
                          </div>
                          <Select value={ccDepartmentFilter} onValueChange={setCcDepartmentFilter}>
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue placeholder="Dept" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              {availableDepartments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-h-[80px] max-h-[120px] border rounded-md bg-muted/20">
                          {ccRecipients.length > 0 ? (
                            <div className="p-2 space-y-1">
                              {ccRecipients.map((cc) => (
                                <div key={cc.id} className="flex items-center justify-between bg-background rounded px-2 py-1">
                                  <span className="text-sm truncate">{cc.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCcRecipient(cc.id)}
                                    className="h-4 w-4 p-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2">
                              <p className="text-xs text-muted-foreground">No CC recipients selected</p>
                            </div>
                          )}
                          {getFilteredCcUsers().length > 0 && (
                            <div className="border-t max-h-20 overflow-y-auto">
                              {getFilteredCcUsers().slice(0, 3).map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => addCcRecipient(user)}
                                  className="w-full p-2 text-left hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">{user.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">What content should be included?</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select documents and files to send.
                  </p>
                </div>

                {showContentSelection && (
                  <Tabs value={contentSource} onValueChange={(value) => setContentSource(value as ContentSource)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="archive">Archive</TabsTrigger>
                      <TabsTrigger value="inbox">Inbox</TabsTrigger>
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="archive" className="space-y-4">
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search archive..."
                            value={archiveSearch}
                            onChange={(e) => setArchiveSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={archiveFilter} onValueChange={(value) => setArchiveFilter(value as 'all' | 'letters' | 'documents')}>
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="letters">Letters</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                        {getFilteredArchiveDocuments().map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => addContentItem({
                              id: doc.id,
                              title: doc.title,
                              type: doc.type,
                              source: 'archive'
                            })}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                doc.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                              )}>
                                {doc.type === 'letter' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">{doc.type}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="inbox" className="space-y-4">
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search inbox..."
                            value={inboxSearch}
                            onChange={(e) => setInboxSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={inboxFilter} onValueChange={(value) => setInboxFilter(value as 'all' | 'organization' | 'workspace' | 'department' | 'personal')}>
                          <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                            <SelectItem value="workspace">Workspace</SelectItem>
                            <SelectItem value="department">Department</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                        {getFilteredInboxDocuments().map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => addContentItem({
                              id: doc.id,
                              title: doc.title,
                              type: doc.type,
                              source: 'inbox'
                            })}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                doc.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                              )}>
                                {doc.type === 'letter' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">{doc.type}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUploadModalOpen(true)}
                        className="w-full h-32 border-dashed"
                      >
                        <Upload className="w-8 h-8 mr-2" />
                        Upload Files
                      </Button>
                    </TabsContent>
                  </Tabs>
                )}

                {selectedContentItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Selected Content ({selectedContentItems.length})</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowContentSelection(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {selectedContentItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            item.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                          )}>
                            {item.type === 'letter' ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">{item.type} • {item.source}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveContentItem(index, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveContentItem(index, 'down')}
                              disabled={index === selectedContentItems.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeContentItem(item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Send */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Review & Send</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review your message and send it.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3 border rounded-lg space-y-1">
                    <h4 className="font-medium">Recipients</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex gap-2">
                        <span className="w-10">To:</span>
                        <span className="min-w-0 flex-1 truncate">
                          {scope === 'person' && selectedUser && `${selectedUser.name} (${selectedUser.email})`}
                          {scope === 'department' && selectedDepartment && selectedDepartment.name}
                          {scope === 'workspace' && selectedWorkspace && selectedWorkspace.name}
                          {scope === 'organization' && 'Entire organization'}
                        </span>
                      </div>
                      {ccRecipients.length > 0 && (
                        <div className="flex gap-2">
                          <span className="w-10">CC:</span>
                          <span className="min-w-0 flex-1 truncate">
                            {ccRecipients.map(cc => cc.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">Content</h4>
                    <div className="space-y-2">
                      {selectedContentItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
                            item.type === 'letter' ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
                          )}>
                            {item.type === 'letter' ? <Mail className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          </div>
                          <span className="text-sm">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="comment" className="text-sm font-medium">Message (optional)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Add a personal message..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="requestSignature"
                        checked={isSendingForApproval}
                        onChange={(e) => setIsSendingForApproval(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="requestSignature" className="text-sm">
                        Request for signature
                      </Label>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCheck className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Ready to send</p>
                          <p className="text-sm text-muted-foreground">
                            Your message will be delivered to the selected recipients.
                            {isSendingForApproval && ' A signature will be requested before delivery.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  prevStep();
                }}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  {isSendingForApproval ? 'Send for Signature' : 'Send'}
                </Button>
              )}
            </div>
          </form>
        </div>

        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          users={users}
          onSave={(data) => {
            addContentItem({
              id: `upload-${Date.now()}-${data.file.name}`,
              title: data.title?.trim() || data.subject?.trim() || data.file.name,
              type: data.contentType,
              source: 'upload',
              file: data.file,
            });
            setUploadModalOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
