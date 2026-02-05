import { useMemo, useRef, useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UploadModal } from '@/components/documents/UploadModal';
import { currentUser, mockDocuments } from '@/data/mockData';
import type { Document, User } from '@/types/dlms';
// import { User as PersonSearchUser } from '@/components/search/PersonSearch'; 
// Use global User instead
import { useToast } from '@/hooks/use-toast';
import { addStoredSentItem } from '@/lib/sentStorage';
import { addStoredComposeDraft, deleteStoredComposeDraft, getStoredComposeDraftById } from '@/lib/draftStorage';
import { useBlocker, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

type Scope = 'person' | 'department' | 'workspace' | 'branch';

// User type is now imported from PersonSearch component

interface UserWithBranch extends User {
  branch?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
}
type ContentSource = 'archive' | 'inbox' | 'upload';

export default function Compose() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skipBlockRef = useRef(false);

  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [isDraftNameOpen, setIsDraftNameOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  // Form state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scope, setScope] = useState<Scope>('person');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]); // Replaces departments const
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]); // To match existing var, or we change it.

  // NOTE: In this refactor, 'departments' variable was replaced by 'teams' state.
  // We will map 'teams' to the structure expected by UI if needed, but actually the UI uses 'availableDepartments' for the filter dropdown.

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'ws1', name: 'Executive Team' },
    { id: 'ws2', name: 'Project Alpha' },
    { id: 'ws3', name: 'Customer Support' },
  ]); // Keeping mock workspaces for now as not specified to be in DB yet, though prompt mentioned 'workspace scope' filters.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, branchesRes, teamsRes] = await Promise.all([
          fetch('http://localhost:5000/api/users'),
          fetch('http://localhost:5000/api/metadata/branches'),
          fetch('http://localhost:5000/api/metadata/teams')
        ]);

        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
        if (branchesRes.ok) {
          setBranches(await branchesRes.json());
        }
        if (teamsRes.ok) {
          const teamData = await teamsRes.json();
          setTeams(teamData);
          setAvailableDepartments(teamData); // Map for compatibility or just use teams
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({ title: "Error", description: "Failed to load directory data", variant: "destructive" });
      }
    };
    fetchData();
  }, []);
  const [ccRecipients, setCcRecipients] = useState<{ id: string, name: string }[]>([]);
  const [contentSource, setContentSource] = useState<ContentSource>('archive');

  // Personal recipient search and filter states
  const [personSearch, setPersonSearch] = useState('');
  const [personDepartmentFilter, setPersonDepartmentFilter] = useState<string>('all');
  const [personBranchFilter, setPersonBranchFilter] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
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
  const [inboxFilter, setInboxFilter] = useState<'all' | 'branch' | 'workspace' | 'department' | 'personal'>('all');

  // Hide selection UI when content is added
  useEffect(() => {
    if (selectedContentItems.length > 0) {
      setShowContentSelection(false);
    } else {
      setShowContentSelection(true);
    }
  }, [selectedContentItems.length]);

  const isDraftEligible = currentStep >= 2;
  const shouldBlockNavigation = isDraftEligible && !skipBlockRef.current;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlockNavigation && currentLocation.pathname !== nextLocation.pathname
  );

  const defaultDraftName = useMemo(() => {
    const primary = selectedContentItems[0];
    if (primary?.title) return primary.title;
    return `Draft - ${new Date().toLocaleDateString()}`;
  }, [selectedContentItems]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      // Capture the intended navigation URL
      setPendingNavigation(blocker.location.pathname);
      setDraftName((prev) => (prev.trim() ? prev : defaultDraftName));
      setIsDraftConfirmOpen(true);
    }
  }, [blocker.state, defaultDraftName]);

  useEffect(() => {
    const fetchDraft = async () => {
      const draftId = searchParams.get('draftId');
      if (!draftId) return;

      try {
        // Fetch from API instead of local storage
        const res = await fetch(`http://localhost:5000/api/drafts/${draftId}`);
        if (res.ok) {
          const draft = await res.json();
          const s = draft.content;

          // Map API content back to state
          setCurrentStep(s.currentStep || 1);
          setScope(s.scope || 'person');
          setSelectedUser(s.selectedUser || null);
          setSelectedDepartment(s.selectedDepartment || null);
          setSelectedWorkspace(s.selectedWorkspace || null);
          setCcRecipients(s.ccRecipients || []);
          setContentSource(s.contentSource || 'archive');

          // Content items might need reconstruction depending entirely on what we saved.
          // We saved { id, title, type, source }. 
          // We might lose `file` object if it was an upload (browsers don't let you restore File objects from JSON/Server easily without re-fetching as Blob).
          // For now, restore basic info.
          setSelectedContentItems(s.selectedContentItems || []);

          setComment(s.comment || '');
          setIsSendingForApproval(s.isSendingForApproval || false);
          setActiveDraftId(draftId);
        }
      } catch (e) {
        console.error("Failed to load draft", e);
        toast({ title: "Error", description: "Failed to load draft", variant: "destructive" });
      }
    };
    fetchDraft();
  }, [searchParams]);

  const [comment, setComment] = useState('');
  const [isSendingForApproval, setIsSendingForApproval] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const availableDocuments: Document[] = mockDocuments.slice(0, 4);

  // Get unique departments from users (replaced by fetched teams)
  // const availableDepartments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];

  // Filter users for personal recipient selection
  const getFilteredUsers = () => {
    let filtered = users;

    // Apply department (team) filter
    if (personDepartmentFilter !== 'all') {
      filtered = filtered.filter(user => user.team === personDepartmentFilter || user.department === personDepartmentFilter);
    }

    // Apply branch filter
    if (personBranchFilter !== 'all') {
      filtered = filtered.filter(user => user.branch === personBranchFilter);
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
    if (inboxFilter === 'branch') {
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
      created_at: new Date().toISOString(),
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

    // If this was a draft, delete it after sending
    if (activeDraftId) {
      // Call API to delete
      fetch(`http://localhost:5000/api/drafts/${activeDraftId}`, { method: 'DELETE' })
        .catch(e => console.error("Failed to cleanup draft", e));
      setActiveDraftId(null);
    }

    const recipientName =
      scope === 'person'
        ? (selectedUser?.name || 'recipient')
        : scope === 'department'
          ? (selectedDepartment?.name || 'department')
          : scope === 'workspace'
            ? (selectedWorkspace?.name || 'workspace')
            : 'branch';

    const t = toast({
      title: 'Success',
      description: `Successfully sent to ${recipientName}`,
    });

    // Skip blocker immediately for the upcoming redirect
    skipBlockRef.current = true;

    setTimeout(() => {
      t.dismiss();
      navigate('/inbox');
    }, 1500);
  };

  const handleConfirmSaveDraft = () => {
    setIsDraftConfirmOpen(false);
    // Defer opening the Draft Name dialog to avoid race conditions with blocker state
    setTimeout(() => {
      setIsDraftNameOpen(true);
    }, 0);
  };

  const handleProceedWithoutSaving = () => {
    setIsDraftConfirmOpen(false);
    setIsDraftNameOpen(false);
    if (blocker.state === 'blocked') blocker.proceed();
  };

  const handleStayOnCompose = () => {
    setIsDraftConfirmOpen(false);
    setIsDraftNameOpen(false);
    if (blocker.state === 'blocked') blocker.reset();
  };

  const handleSaveDraftAndProceed = async () => {
    const name = draftName.trim() || defaultDraftName;
    if (!user) return;

    const draftData = {
      id: activeDraftId, // If editing existing draft
      userId: user.id,
      name,
      content: {
        currentStep,
        scope,
        selectedUser,
        selectedDepartment,
        selectedWorkspace,
        ccRecipients,
        contentSource,
        selectedContentItems: selectedContentItems.map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          source: i.source,
          // Note: File objects cannot be saved to JSON directly. 
          // Real impl would upload file first and save URL, or just save metadata if it's from archive.
        })),
        comment,
        isSendingForApproval,
      },
    };

    try {
      const res = await fetch('http://localhost:5000/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });

      if (res.ok) {
        const savedDraft = await res.json();
        toast({
          title: 'Draft saved',
          description: `"${name}" was saved to your drafts.`,
        });
        setIsDraftNameOpen(false);
        setIsDraftConfirmOpen(false);

        // If we just created a new one, update active ID potentially? 
        // Primarily we leave the page here usually.

        if (pendingNavigation) {
          skipBlockRef.current = true;
          setTimeout(() => {
            navigate(pendingNavigation);
            setPendingNavigation(null);
          }, 0);
        } else {
          if (blocker.state === 'blocked') blocker.proceed();
        }
      } else {
        toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
      }

    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
    }
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
      {[1, 2, 3, 4].map((step) => (
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
            {[
              'Scope',
              'CC',
              'Content',
              'Review & Send'
            ][step - 1]}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Send To</h2>
            <p className="text-muted-foreground">
              Choose the recipient type for this document.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  value: 'person',
                  label: 'Individual',
                  description: 'Send to a specific individual',
                  icon: UserIcon,
                  visible: !!user?.privileges?.compose?.shareIndividual
                },
                {
                  value: 'department',
                  label: 'Team',
                  description: 'Send to a team',
                  icon: Building,
                  visible: !!user?.privileges?.compose?.shareTeam
                },
                {
                  value: 'workspace',
                  label: 'Workspace',
                  description: 'Send to a workspace',
                  icon: Users,
                  visible: !!user?.privileges?.compose?.shareWorkspace
                },
                {
                  value: 'branch',
                  label: 'Branch',
                  description: 'Send to everyone in the branch',
                  icon: CheckCheck,
                  visible: !!user?.privileges?.compose?.shareBranch
                }
              ].filter(item => item.visible).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setScope(item.value as Scope);
                    // Reset selections when changing scope
                    setSelectedUser(null);
                    setSelectedDepartment(null);
                    setSelectedWorkspace(null);
                    // Reset person search and filter
                    setPersonSearch('');
                    setPersonDepartmentFilter('all');
                    setPersonBranchFilter('all');
                    setSelectedBranch('all');
                  }}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-colors h-full",
                    scope === item.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <item.icon className="w-6 h-6 mb-2 text-primary" />
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </button>
              ))}
            </div>

            {/* Conditional selectors based on scope */}
            <div className="mt-6 space-y-4">
              {scope === 'person' && (
                <div className="space-y-3">
                  {/* Selected User Chip */}
                  {selectedUser && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{selectedUser.name}</p>
                            {selectedUser.department && (
                              <p className="text-xs text-muted-foreground">{selectedUser.department}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null);
                            setPersonSearch('');
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Search and Filter Controls */}
                  {!selectedUser && (
                    <>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={personBranchFilter}
                            onValueChange={setPersonBranchFilter}
                          >
                            <SelectTrigger className="w-1/2 h-9">
                              <Building className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Filter By Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Branches</SelectItem>
                              {branches.map((branch) => (
                                <SelectItem key={branch} value={branch}>
                                  {branch}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={personDepartmentFilter}
                            onValueChange={setPersonDepartmentFilter}
                          >
                            <SelectTrigger className="w-1/2 h-9">
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Filter By Team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Teams</SelectItem>
                              {availableDepartments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="relative w-full">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search employee by name"
                            className="h-9 pl-8"
                            value={personSearch}
                            onChange={(e) => setPersonSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Results List */}
                      {personSearch.trim() && (
                        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                          {getFilteredUsers().length > 0 ? (
                            getFilteredUsers().map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPersonSearch('');
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
                                    <div className="flex flex-col">
                                      {user.team && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {user.team}
                                        </p>
                                      )}
                                      {user.position && (
                                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                                          {user.position}
                                        </p>
                                      )}
                                      {user.branch && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {user.branch}
                                        </p>
                                      )}
                                    </div>
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
              )}

              {scope === 'department' && (
                <div>
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Filter by Branch</Label>
                    <Select
                      value={selectedBranch}
                      onValueChange={setSelectedBranch}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Label className="text-sm font-medium">Select Team</Label>
                  <Select
                    value={selectedDepartment?.name || ''}
                    onValueChange={(value) => {
                      // Using name as ID for now since we fetch strings
                      const deptName = value;
                      setSelectedDepartment(deptName ? { id: deptName, name: deptName } : null);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scope === 'workspace' && (
                <div>
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Filter by Branch</Label>
                    <Select
                      value={selectedBranch}
                      onValueChange={setSelectedBranch}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Label className="text-sm font-medium">Select Workspace</Label>
                  <Select
                    value={selectedWorkspace?.id || ''}
                    onValueChange={(value) => {
                      const ws = workspaces.find(w => w.id === value);
                      setSelectedWorkspace(ws || null);
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id}>
                          {ws.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scope === 'branch' && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Branches</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {branches.map((branch) => (
                      <div key={branch} className="p-3 bg-muted/30 rounded-lg border flex items-center gap-3">
                        <Building className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{branch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Add CC Recipients (Optional)</h2>
            <p className="text-muted-foreground">
              Select users who should have read-only access to this document.
            </p>

            <div>
              <Label htmlFor="cc" className="text-sm font-medium">CC Recipients</Label>
              <Select onValueChange={(value) => {
                if (!ccRecipients.some(r => r.id === value)) {
                  setCcRecipients(prev => [...prev, { id: value, name: value }]);
                }
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select users to CC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">John Doe (Finance)</SelectItem>
                  <SelectItem value="user2">Jane Smith (Legal)</SelectItem>
                  <SelectItem value="user3">Alex Johnson (HR)</SelectItem>
                </SelectContent>
              </Select>

              {ccRecipients.length > 0 && (
                <div className="mt-3 space-y-2">
                  {ccRecipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span>{recipient.name}</span>
                      <button
                        type="button"
                        onClick={() => setCcRecipients(prev => prev.filter(r => r.id !== recipient.id))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Select Content</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the document or letter you want to send. You may select from existing resources or upload a new file.
              </p>
            </div>

            {/* Selected Content Area */}
            {selectedContentItems.length > 0 && (
              <div className="space-y-2">
                <div className="grid gap-3">
                  {selectedContentItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg",
                        index === 0 ? "bg-primary/5 border-primary/20" : "bg-card"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {index === 0 && (
                          <span className="text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded">
                            Primary
                          </span>
                        )}
                        {item.type === 'letter' ? (
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.source}
                          {item.file && ` • ${(item.file.size / 1024).toFixed(2)} KB`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveContentItem(index, 'up')}
                          disabled={index === 0}
                          className={cn(
                            "p-1 rounded hover:bg-muted transition-colors",
                            index === 0 && "opacity-50 cursor-not-allowed"
                          )}
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveContentItem(index, 'down')}
                          disabled={index === selectedContentItems.length - 1}
                          className={cn(
                            "p-1 rounded hover:bg-muted transition-colors",
                            index === selectedContentItems.length - 1 && "opacity-50 cursor-not-allowed"
                          )}
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentItem(item.id)}
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Content Card - Only show when at least one item is selected */}
            {selectedContentItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowContentSelection(true)}
                className={cn(
                  "w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors",
                  "hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <Plus className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Add More Content
                </p>
              </button>
            )}

            {/* Content Selection UI */}
            {showContentSelection && (
              <div className="mt-4">
                <Tabs value={contentSource} onValueChange={(v) => {
                  setContentSource(v as ContentSource);
                  // Reset search and filters when switching tabs
                  setArchiveSearch('');
                  setInboxSearch('');
                  setArchiveFilter('all');
                  setInboxFilter('all');
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="archive" className="flex items-center gap-2">
                      <FileArchive className="w-4 h-4" />
                      My Library
                    </TabsTrigger>
                    <TabsTrigger value="inbox" className="flex items-center gap-2">
                      <Inbox className="w-4 h-4" />
                      Inbox
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="archive" className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search My Library..."
                            className="h-9 pl-8"
                            value={archiveSearch}
                            onChange={(e) => setArchiveSearch(e.target.value)}
                          />
                        </div>
                        <Select value={archiveFilter} onValueChange={(v) => setArchiveFilter(v as 'all' | 'letters' | 'documents')}>
                          <SelectTrigger className="w-[120px] h-9">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="letters">Letters</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                        {getFilteredArchiveDocuments().length > 0 ? (
                          getFilteredArchiveDocuments().map((doc) => {
                            const isSelected = selectedContentItems.some(item => item.id === doc.id);
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => {
                                  addContentItem({
                                    id: doc.id,
                                    title: doc.title,
                                    type: doc.type,
                                    source: 'archive'
                                  });
                                }}
                                disabled={isSelected}
                                className={cn(
                                  "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                                  isSelected && "opacity-50 cursor-not-allowed bg-muted/30"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {doc.type === 'letter' ? (
                                    <Mail className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  ) : (
                                    <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {doc.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {doc.size} • {doc.date}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-6 text-center text-sm text-muted-foreground">
                            No content found
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="inbox" className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search inbox content..."
                            className="h-9 pl-8"
                            value={inboxSearch}
                            onChange={(e) => setInboxSearch(e.target.value)}
                          />
                        </div>
                        <Select value={inboxFilter} onValueChange={(v) => setInboxFilter(v as 'all' | 'branch' | 'workspace' | 'department' | 'personal')}>
                          <SelectTrigger className="w-[140px] h-9">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="branch">Branch</SelectItem>
                            <SelectItem value="workspace">Workspace</SelectItem>
                            <SelectItem value="department">Department</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                        {getFilteredInboxDocuments().length > 0 ? (
                          getFilteredInboxDocuments().map((doc) => {
                            const isSelected = selectedContentItems.some(item => item.id === doc.id);
                            return (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => {
                                  addContentItem({
                                    id: doc.id,
                                    title: doc.title,
                                    type: doc.type,
                                    source: 'inbox'
                                  });
                                }}
                                disabled={isSelected}
                                className={cn(
                                  "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                                  isSelected && "opacity-50 cursor-not-allowed bg-muted/30"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {doc.type === 'letter' ? (
                                    <Mail className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  ) : (
                                    <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {doc.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {doc.size} • {doc.date}
                                      {doc.sender && ` • ${doc.sender.name}`}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-6 text-center text-sm text-muted-foreground">
                            No content found
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4">
                    <input
                      id="compose-file-input"
                      type="file"
                      accept=".pdf,.docx,.txt,.doc,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          setUploadModalOpen(true);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="compose-file-input">
                      <div className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">Upload a new document or letter</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Supported formats: .pdf, .docx, .txt (Max: 10MB)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Select File
                            </span>
                          </Button>
                        </div>
                      </div>
                    </label>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        );

      case 4:
        const primaryContent = selectedContentItems[0];
        const attachmentsCount = selectedContentItems.length > 1 ? selectedContentItems.length - 1 : 0;

        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Review & Send</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review your content and optionally add a comment before sending.
              </p>
            </div>

            {/* Initial Comment Section - Collapsible */}
            <div className="border rounded-lg">
              <button
                type="button"
                onClick={() => setShowCommentSection(!showCommentSection)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium cursor-pointer">Initial Comment</Label>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </div>
                {showCommentSection ? (
                  <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {(showCommentSection || comment.trim()) && (
                <div className="px-3 pb-3 border-t">
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (!showCommentSection) setShowCommentSection(true);
                    }}
                    onFocus={() => setShowCommentSection(true)}
                    placeholder="Add any context or notes for the recipients..."
                    className="mt-3 min-h-[100px]"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This comment will be visible to all recipients and becomes the first entry in the document thread.
                  </p>
                </div>
              )}
            </div>

            {/* Send Summary Card */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Send Summary</h3>
                  <p className="text-xs text-muted-foreground">Review what will be sent</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="h-8"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Primary Content:</span>
                  <div className="text-right">
                    <span className="text-sm font-medium capitalize">
                      {primaryContent?.type || 'N/A'}
                    </span>
                    {primaryContent && (
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                        {primaryContent.title}
                      </p>
                    )}
                  </div>
                </div>

                {attachmentsCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Attachments:</span>
                    <span className="text-sm font-medium">
                      {attachmentsCount} item{attachmentsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Target Scope:</span>
                  <span className="text-sm font-medium capitalize">{scope}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Signature Requested:</span>
                  <span className="text-sm font-medium">
                    {isSendingForApproval ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Send Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSendingForApproval(!isSendingForApproval)}
                className="flex-1"
              >
                <input
                  type="checkbox"
                  checked={isSendingForApproval}
                  onChange={() => { }}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                />
                Request for signature
              </Button>
            </div>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Content Preview</DialogTitle>
                  <DialogDescription>
                    Review the content that will be sent
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Primary Content */}
                  {primaryContent && (
                    <div className="border rounded-lg p-4 bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded">
                          Primary
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {primaryContent.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{primaryContent.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        Source: {primaryContent.source}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {attachmentsCount > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attachments ({attachmentsCount})</p>
                      <div className="space-y-2">
                        {selectedContentItems.slice(1).map((item) => (
                          <div key={item.id} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === 'letter' ? (
                                <Mail className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground capitalize">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              Source: {item.source}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comment Preview */}
                  {comment.trim() && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Initial Comment</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment}</p>
                    </div>
                  )}

                  {/* Scope Summary */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Recipients</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scope:</span>
                        <span className="font-medium capitalize">{scope}</span>
                      </div>
                      {ccRecipients.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CC Recipients:</span>
                          <span className="font-medium">{ccRecipients.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      default:
        return null;
    }
  };

  const handleUploadSave = (data: {
    file: File;
    contentType: 'document' | 'letter';
    title?: string;
    tags?: string[];
    subject?: string;
    receiver?: User;
  }) => {
    const fileId = `upload-${Date.now()}-${data.file.name}`;
    const displayTitle = data.contentType === 'letter'
      ? (data.subject || data.file.name)
      : (data.title || data.file.name);

    addContentItem({
      id: fileId,
      title: displayTitle,
      type: data.contentType,
      source: 'upload',
      file: data.file
    });
  };

  return (
    <AppLayout
      title="compose"
      subtitle="share documents with your co-workers"
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <StepIndicator />

        <div className="bg-card p-6 rounded-lg border">
          {renderStep()}

          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (
                    !scope ||
                    (scope === 'person' && !selectedUser) ||
                    (scope === 'department' && !selectedDepartment) ||
                    (scope === 'workspace' && !selectedWorkspace)
                  )) ||
                  (currentStep === 3 && selectedContentItems.length === 0)
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={selectedContentItems.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSendingForApproval ? 'Send for Signature' : 'Send'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadedFile(null);
        }}
        onSave={handleUploadSave}
        users={users}
        currentUserName="Current User"
        initialFile={uploadedFile}
      />

      <AlertDialog open={isDraftConfirmOpen} onOpenChange={handleStayOnCompose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save as draft?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an incomplete compose session. Would you like to save it as a draft before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleProceedWithoutSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSaveDraft}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDraftNameOpen} onOpenChange={handleStayOnCompose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Draft Name</DialogTitle>
            <DialogDescription>Enter a name for this draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="draftName">Draft Name</Label>
            <Input
              id="draftName"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder={defaultDraftName}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleProceedWithoutSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveDraftAndProceed}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
