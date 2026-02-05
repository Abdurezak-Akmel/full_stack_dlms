import { AppLayout } from '@/components/layout/AppLayout';
import { currentUser, mockWorkspaces, mockDocuments } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Clock, 
  Key,
  Bell,
  FileText,
  Users,
  Plus,
  ArrowRight,
  Search,
  X,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/dlms';

export default function Profile() {
  const { toast } = useToast();
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [permissionNote, setPermissionNote] = useState('');
  const [storageRequestSize, setStorageRequestSize] = useState('');
  const [showPermissionDetail, setShowPermissionDetail] = useState(false);

  // Delegation specific state
  const [delegationUser, setDelegationUser] = useState<UserType | null>(null);
  const [delegationStart, setDelegationStart] = useState('');
  const [delegationEnd, setDelegationEnd] = useState('');
  const [delegationContent, setDelegationContent] = useState<Array<{
    id: string;
    title: string;
    type: 'letter' | 'document';
  }>>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userDepartmentFilter, setUserDepartmentFilter] = useState('all');
  const [showContentSelection, setShowContentSelection] = useState(false);
  const [contentSource, setContentSource] = useState<'archive' | 'inbox'>('archive');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [inboxSearch, setInboxSearch] = useState('');

  const permissionCategories = [
    {
      id: 'approval_delegation',
      label: 'Temporary approval delegation',
      description: 'Request to temporarily delegate approval authority'
    },
    {
      id: 'organization_inbox_access',
      label: 'Send to organization inbox',
      description: 'Request permission to send documents to shared organizational inboxes'
    },
    {
      id: 'storage_extension',
      label: 'Additional archive storage',
      description: 'Request extra storage allocation for archived documents'
    },
    {
      id: 'template_posting',
      label: 'Template posting access',
      description: 'Request permission to create or publish document templates'
    }
  ];

  // Helper functions
  const getFilteredUsers = () => {
    const mockUsers = [
      { id: 'user1', name: 'John Doe', email: 'john@example.com', department: 'Finance', role: 'staff' as const },
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', department: 'HR', role: 'manager' as const },
      { id: 'user3', name: 'Bob Johnson', email: 'bob@example.com', department: 'IT', role: 'staff' as const },
      { id: 'user4', name: 'Alice Brown', email: 'alice@example.com', department: 'Finance', role: 'secretary' as const },
    ];
    
    return mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesDepartment = userDepartmentFilter === 'all' || user.department === userDepartmentFilter;
      return matchesSearch && matchesDepartment;
    });
  };

  const getFilteredArchiveDocuments = () => {
    return mockDocuments.filter(doc => 
      doc.title.toLowerCase().includes(archiveSearch.toLowerCase())
    );
  };

  const getFilteredInboxDocuments = () => {
    return mockDocuments.filter(doc => 
      doc.title.toLowerCase().includes(inboxSearch.toLowerCase())
    );
  };

  const addDelegationContent = (item: { id: string; title: string; type: 'letter' | 'document' }) => {
    if (!delegationContent.some(ci => ci.id === item.id)) {
      setDelegationContent(prev => [...prev, item]);
      setShowContentSelection(false);
    }
  };

  const removeDelegationContent = (id: string) => {
    setDelegationContent(prev => prev.filter(item => item.id !== id));
  };

  const handlePermissionRequest = (permissionId: string) => {
    setSelectedPermission(permissionId);
    
    // Different handling based on permission type
    if (permissionId === 'approval_delegation') {
      // Show delegation modal
      setShowPermissionDetail(true);
      // Reset delegation state
      setDelegationUser(null);
      setDelegationStart('');
      setDelegationEnd('');
      setDelegationContent([]);
      setUserSearch('');
      setUserDepartmentFilter('all');
      setShowContentSelection(false);
    } else if (permissionId === 'organization_inbox_access' || permissionId === 'template_posting') {
      // Show note input modal for these permissions
      setShowPermissionDetail(true);
      setPermissionNote('');
    } else if (permissionId === 'storage_extension') {
      // Show storage size input modal
      setShowPermissionDetail(true);
      setStorageRequestSize('');
    } else {
      // Direct submission for other permissions
      setIsPermissionModalOpen(false);
      const permission = permissionCategories.find(p => p.id === permissionId);
      alert(`Permission request for "${permission?.label}" sent to administrator for review.`);
    }
  };

  const handlePermissionSubmit = () => {
    const permission = permissionCategories.find(p => p.id === selectedPermission);
    
    if (selectedPermission === 'approval_delegation') {
      // Submit delegation request
      const delegationDetails = {
        delegateTo: delegationUser?.name || 'Not specified',
        startDate: delegationStart,
        endDate: delegationEnd,
        attachedContent: delegationContent.map(c => c.title).join(', ') || 'None'
      };
      
      toast({
        title: 'Delegation request submitted',
        description: `Request to delegate approvals to ${delegationDetails.delegateTo} from ${delegationDetails.startDate} to ${delegationDetails.endDate} has been sent for review.`,
      });
    } else if (selectedPermission === 'organization_inbox_access' || selectedPermission === 'template_posting') {
      // Submit with note
      toast({
        title: 'Request submitted successfully',
        description: `Your request for "${permission?.label}" has been sent to the administrator for review.`,
      });
    } else if (selectedPermission === 'storage_extension') {
      // Submit with storage size
      toast({
        title: 'Request submitted successfully',
        description: `Your request for ${storageRequestSize} additional storage has been sent to the administrator for review.`,
      });
    }
    
    // Reset state
    setShowPermissionDetail(false);
    setIsPermissionModalOpen(false);
    setSelectedPermission(null);
    setPermissionNote('');
    setStorageRequestSize('');
    setDelegationUser(null);
    setDelegationStart('');
    setDelegationEnd('');
    setDelegationContent([]);
  };

  const handlePermissionCancel = () => {
    // Reset state and go back to main modal
    setShowPermissionDetail(false);
    setSelectedPermission(null);
    setPermissionNote('');
    setStorageRequestSize('');
    setDelegationUser(null);
    setDelegationStart('');
    setDelegationEnd('');
    setDelegationContent([]);
  };
  return (
    <AppLayout 
      title="Profile & Settings"
      subtitle="Manage your account and preferences"
    >
      <div className="max-w-4xl space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="panel-section p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-foreground">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                  <Shield className="w-3.5 h-3.5" />
                  {currentUser.role}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building className="w-4 h-4" />
                  {currentUser.department}
                </span>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="panel-section p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <Input value={currentUser.name} className="mt-1" readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <Input value={currentUser.email} className="mt-1" readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <Input value={currentUser.department} className="mt-1" readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <Input value={currentUser.role} className="mt-1 capitalize" readOnly />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="panel-section p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="panel-section p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Approval notifications', enabled: true },
                  { label: 'Comment notifications', enabled: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm">{item.label}</span>
                    <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${item.enabled ? 'bg-success' : 'bg-muted'}`}>
                      <div className={`w-5 h-5 rounded-full bg-card shadow-sm transform transition-transform mt-0.5 ${item.enabled ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Workspace Memberships */}
            <div className="panel-section p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Workspaces
              </h3>
              <div className="space-y-2">
                {mockWorkspaces.filter(ws => ws.members.some(m => m.id === currentUser.id)).map((ws) => (
                  <div key={ws.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">{ws.members.length} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="panel-section p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Documents uploaded</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Letters sent</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approvals completed</span>
                  <span className="font-medium">38</span>
                </div>
                <Separator />
                <Button variant="outline" className="w-full" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Audit Log
                </Button>
              </div>
            </div>

            {/* Request Permissions */}
            <div className="panel-section p-5 bg-accent/5 border-accent/20">
              <h3 className="font-semibold text-foreground mb-2">Need Access?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Request additional permissions from your administrator.
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => setIsPermissionModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Permissions
              </Button>
            </div>
          </div>
        </div>

        {/* Permission Request Modal */}
        <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Permission</DialogTitle>
              <DialogDescription>
                Select the permission you need from your administrator. All requests require admin approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 my-4">
              {permissionCategories.map((permission) => (
                <button
                  key={permission.id}
                  onClick={() => handlePermissionRequest(permission.id)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{permission.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Permission Detail Modal */}
        {selectedPermission && (
          <Dialog open={showPermissionDetail} onOpenChange={handlePermissionCancel}>
            <DialogContent className={selectedPermission === 'approval_delegation' ? "max-w-2xl" : "max-w-md"}>
              <DialogHeader>
                <DialogTitle>
                  {permissionCategories.find(p => p.id === selectedPermission)?.label}
                </DialogTitle>
                <DialogDescription>
                  {selectedPermission === 'approval_delegation' 
                    ? 'Select who to delegate approvals to and specify the time range.'
                    : selectedPermission === 'storage_extension' 
                    ? 'Specify the amount of additional storage you need.'
                    : 'Add a note for your administrator (optional).'
                  }
                </DialogDescription>
              </DialogHeader>
              
              {/* Delegation UI */}
              {selectedPermission === 'approval_delegation' ? (
                <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
                  {/* Person Selection */}
                  <div className="space-y-2">
                    <Label>Delegate To</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search people..."
                          className="pl-9"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      <Select value={userDepartmentFilter} onValueChange={setUserDepartmentFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Dept" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {delegationUser && (
                      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{delegationUser.name}</span>
                        <span className="text-xs text-muted-foreground">{delegationUser.department}</span>
                        <button 
                          onClick={() => setDelegationUser(null)}
                          className="ml-auto text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    {!delegationUser && (
                      <div className="border rounded-md max-h-[150px] overflow-y-auto">
                        {getFilteredUsers().length > 0 ? (
                          <div className="divide-y">
                            {getFilteredUsers().map(user => (
                              <button
                                key={user.id}
                                onClick={() => setDelegationUser(user)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors text-left"
                              >
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-3 h-3 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.role} • {user.department}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-sm text-muted-foreground">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={delegationStart}
                        onChange={(e) => setDelegationStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={delegationEnd}
                        onChange={(e) => setDelegationEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Optional Content Attachment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Attach Content (Optional)</Label>
                      {!showContentSelection && (
                        <button
                          onClick={() => setShowContentSelection(true)}
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          + Add Content
                        </button>
                      )}
                    </div>
                    
                    {delegationContent.length > 0 && (
                      <div className="space-y-2">
                        {delegationContent.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm flex-1 truncate">{item.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {item.type}
                            </Badge>
                            <button
                              onClick={() => removeDelegationContent(item.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showContentSelection && (
                      <div className="border rounded-lg p-3 space-y-3">
                        <Tabs value={contentSource} onValueChange={(v) => setContentSource(v as 'archive' | 'inbox')}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="archive">Archive</TabsTrigger>
                            <TabsTrigger value="inbox">Inbox</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="archive" className="space-y-2">
                            <Input
                              placeholder="Search archive..."
                              value={archiveSearch}
                              onChange={(e) => setArchiveSearch(e.target.value)}
                            />
                            <div className="max-h-[120px] overflow-y-auto space-y-1">
                              {getFilteredArchiveDocuments().slice(0, 3).map(doc => (
                                <button
                                  key={doc.id}
                                  onClick={() => addDelegationContent({ id: doc.id, title: doc.title, type: doc.type })}
                                  className="w-full text-left p-2 hover:bg-muted/50 rounded text-sm"
                                >
                                  {doc.title}
                                </button>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="inbox" className="space-y-2">
                            <Input
                              placeholder="Search inbox..."
                              value={inboxSearch}
                              onChange={(e) => setInboxSearch(e.target.value)}
                            />
                            <div className="max-h-[120px] overflow-y-auto space-y-1">
                              {getFilteredInboxDocuments().slice(0, 3).map(doc => (
                                <button
                                  key={doc.id}
                                  onClick={() => addDelegationContent({ id: doc.id, title: doc.title, type: doc.type })}
                                  className="w-full text-left p-2 hover:bg-muted/50 rounded text-sm"
                                >
                                  {doc.title}
                                </button>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Other permissions UI */
                <div className="my-4">
                  {selectedPermission === 'storage_extension' ? (
                    <div className="space-y-2">
                      <Label htmlFor="storageSize">Storage Size</Label>
                      <Input
                        id="storageSize"
                        type="text"
                        placeholder="e.g., 10 GB, 500 MB"
                        value={storageRequestSize}
                        onChange={(e) => setStorageRequestSize(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="permissionNote">Note (Optional)</Label>
                      <Textarea
                        id="permissionNote"
                        placeholder="Provide any additional context for your request..."
                        value={permissionNote}
                        onChange={(e) => setPermissionNote(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handlePermissionCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePermissionSubmit}
                  disabled={selectedPermission === 'approval_delegation' && (!delegationUser || !delegationStart || !delegationEnd)}
                >
                  Confirm Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
