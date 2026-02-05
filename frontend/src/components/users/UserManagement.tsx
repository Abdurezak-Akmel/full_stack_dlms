import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, UserPlus, ShieldAlert, Check, X, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DEFAULT_ROLE_PERMISSIONS } from '@/data/roles-data';
import { User, UserRole, ModulePermissions } from '@/types/user-types';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Using mock data for editing existing users temporarily or fetch from API
import { mockUsers } from '@/data/users-data';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check Presence State
    const [checkEmpId, setCheckEmpId] = useState('');
    const [isCheckingPresence, setIsCheckingPresence] = useState(false);
    const [employeeFound, setEmployeeFound] = useState<any | null>(null);
    const [presenceError, setPresenceError] = useState('');
    const [step, setStep] = useState<'check' | 'form'>('check');

    // Form States
    const [editingUser, setEditingUser] = useState<Partial<User>>({
        name: '',
        email: '',
        role: 'Expert',
        department: '',
        status: 'Active',
        customPermissions: {}
    });
    // Extra state for creation password
    const [creationPassword, setCreationPassword] = useState('');

    const [activeTab, setActiveTab] = useState("details");

    useEffect(() => {
        // Initial fetch or search
        handleSearch();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/search?q=${searchQuery}`);
            if (res.ok) {
                const data = await res.json();
                // Map backend user to frontend User type if needed
                const mappedUsers: User[] = data.map((u: any) => ({
                    id: u.id,
                    name: u.full_name,
                    email: u.email,
                    role: u.role,
                    department: 'General', // Backend doesn't have department column in users table yet, defaulting
                    status: 'Active',
                    joinDate: new Date().toISOString().split('T')[0],
                    customPermissions: {} // Not stored in backend yet
                }));
                setUsers(mappedUsers);
            }
        } catch (error) {
            console.error("Search failed", error);
            // Fallback to mock data if backend not ready or error
            setUsers(mockUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckPresence = async () => {
        if (!checkEmpId) {
            toast.error("Enter Employee ID");
            return;
        }
        setIsCheckingPresence(true);
        setEmployeeFound(null);
        setPresenceError('');

        try {
            const res = await fetch('http://localhost:5000/api/admin/check-presence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: checkEmpId })
            });
            const data = await res.json();

            if (data.present) {
                setEmployeeFound(data.employee);
                setEditingUser({
                    name: data.employee.fullName,
                    email: data.employee.email,
                    role: 'Expert',
                    department: data.employee.position, // Mapping position to department just for display
                    status: 'Active',
                    customPermissions: {}
                });
                setCreationPassword(generatePassword());
            } else {
                setPresenceError('Employee ID not found in official records.');
            }
        } catch (error) {
            toast.error('Error checking presence');
        } finally {
            setIsCheckingPresence(false);
        }
    };

    const generatePassword = () => {
        return Math.random().toString(36).slice(-8) + "!1A";
    };

    const handleProceedToCreate = () => {
        setStep('form');
    };

    const resetForm = () => {
        setEditingUser({ name: '', email: '', role: 'Expert', department: '', status: 'Active', customPermissions: {} });
        setCheckEmpId('');
        setEmployeeFound(null);
        setPresenceError('');
        setStep('check');
        setActiveTab("details");
    }

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    }

    const handleCreateUser = async () => {
        if (!employeeFound) return;

        try {
            const res = await fetch('http://localhost:5000/api/admin/create-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: editingUser.name,
                    employeeId: employeeFound.id, // From presence check
                    email: editingUser.email,
                    role: editingUser.role,
                    password: creationPassword,
                    // requestId: null - admin initiated
                })
            });

            if (res.ok) {
                toast.success("User created and email sent.");
                setIsAddModalOpen(false);
                handleSearch();
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to create user");
            }
        } catch (error) {
            toast.error("Error creating user");
        }
    };

    // Keep handleSaveUser for Editing existing users (not implemented fully in backend yet so keeping mock logic partially or just toast)
    const handleUpdateUser = () => {
        toast.info("Update logic would go here (Backend implementation needed for full update support)");
        setIsAddModalOpen(false);
    };

    const handlePermissionToggle = (module: keyof ModulePermissions) => {
        const currentRole = (editingUser.role as UserRole) || 'Expert';
        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[currentRole];
        const currentCustom = editingUser.customPermissions || {};
        const effectiveState = currentCustom[module] !== undefined ? currentCustom[module] : defaultPerms[module];
        const newState = !effectiveState;

        if (newState === defaultPerms[module]) {
            const { [module]: removed, ...rest } = currentCustom;
            setEditingUser({ ...editingUser, customPermissions: rest });
        } else {
            setEditingUser({ ...editingUser, customPermissions: { ...currentCustom, [module]: newState } });
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage system access and assign roles according to A-Mesob hierarchy.</CardDescription>
                    </div>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openAddModal}>
                                <UserPlus className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>Check against employee database to create account.</DialogDescription>
                            </DialogHeader>

                            {step === 'check' ? (
                                <div className="space-y-4 py-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter Employee ID (e.g., EMP001)"
                                            value={checkEmpId}
                                            onChange={(e) => setCheckEmpId(e.target.value)}
                                        />
                                        <Button onClick={handleCheckPresence} disabled={isCheckingPresence}>
                                            {isCheckingPresence ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                                        </Button>
                                    </div>

                                    {employeeFound && (
                                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                                            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                                                <Check className="h-5 w-5" /> Employee Found
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                                                <span className="font-medium">Name:</span> <span>{employeeFound.fullName}</span>
                                                <span className="font-medium">ID:</span> <span>{employeeFound.id}</span>
                                                <span className="font-medium">Position:</span> <span>{employeeFound.position}</span>
                                            </div>
                                            <Button className="mt-4 w-full" onClick={handleProceedToCreate}>Proceed directly to Create Account</Button>
                                        </div>
                                    )}

                                    {presenceError && (
                                        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                                            <div className="flex items-center gap-2 font-semibold mb-2">
                                                <X className="h-5 w-5" /> Not Found
                                            </div>
                                            {presenceError}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // FORM STEP
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="details">User Details</TabsTrigger>
                                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Name</Label>
                                            <Input className="col-span-3" value={editingUser.name} disabled />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Email</Label>
                                            <Input
                                                className="col-span-3"
                                                value={editingUser.email}
                                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Role</Label>
                                            <Select
                                                onValueChange={(val: UserRole) => setEditingUser({ ...editingUser, role: val })}
                                                value={editingUser.role}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(DEFAULT_ROLE_PERMISSIONS).map(r => (
                                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Password</Label>
                                            <div className="col-span-3 relative">
                                                <Input value={creationPassword} readOnly className="pr-20 font-mono" />
                                                <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 h-7" onClick={() => setCreationPassword(generatePassword())}>
                                                    Regenerate
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="permissions" className="space-y-4 py-4">
                                        <div className="bg-muted/50 p-4 rounded-lg mb-4">
                                            <p className="text-xs text-muted-foreground">
                                                Changes here override the default permissions for the selected role <strong>({editingUser.role})</strong>.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(['inbox', 'myLibrary', 'compose', 'sent', 'drafts', 'approvals', 'workspaces', 'templates'] as Array<keyof ModulePermissions>).map(module => {
                                                const currentRole = (editingUser.role as UserRole) || 'Expert';
                                                const defaultPerm = DEFAULT_ROLE_PERMISSIONS[currentRole][module];
                                                const customPerm = editingUser.customPermissions?.[module];
                                                const isOverridden = customPerm !== undefined;
                                                const effectivePerm = isOverridden ? customPerm : defaultPerm;

                                                return (
                                                    <div key={module} className={`flex items-center justify-between p-3 rounded-lg border ${isOverridden ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                                                        <Label htmlFor={`perm-${module}`} className="capitalize cursor-pointer">{module.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                        <Switch
                                                            id={`perm-${module}`}
                                                            checked={effectivePerm}
                                                            onCheckedChange={() => handlePermissionToggle(module)}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </TabsContent>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setStep('check')}>Back</Button>
                                        <Button onClick={handleCreateUser}>Create User</Button>
                                    </DialogFooter>
                                </Tabs>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex items-center py-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100' :
                                                        user.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : 'bg-red-100 text-red-800'
                                                }
                                                variant="secondary"
                                            >
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => toast.info("Edit not implemented for DB users yet")}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
