import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
    Users,
    Shield,
    Search,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    MoreVertical,
    Lock,
    Unlock,
    Settings,
    UserPlus,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';


interface Role {
    id: number;
    name: string;
    description: string;
    privileges: any;
}

interface User {
    id: number;
    employee_id: string;
    name: string;
    email: string;
    phone_number: string;
    role_id: number;
    role_name: string;
    status: string;
    branch?: string;
    team?: string;
    position?: string;
}

export default function AdminTools() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');

    // User Edit State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    // Role Edit State
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch('http://localhost:5000/api/users'),
                fetch('http://localhost:5000/api/roles')
            ]);
            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: number, employeeId: string) => {
        if (employeeId === 'EMP-001') {
            toast.error('Cannot delete admin account');
            return;
        }
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('User deleted');
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete user');
            }
        } catch (error) {
            toast.error('Error deleting user');
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        if (!editingUser.role_id) {
            toast.error('Role is required');
            return;
        }

        const method = editingUser.id ? 'PUT' : 'POST';
        const url = editingUser.id
            ? `http://localhost:5000/api/users/${editingUser.id}`
            : 'http://localhost:5000/api/users';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });

            if (res.ok) {
                toast.success(editingUser.id ? 'User updated' : 'User created');
                setIsUserModalOpen(false);
                fetchData();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save user');
            }
        } catch (error) {
            toast.error('Error saving user');
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/roles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Role deleted');
                fetchData();
            } else {
                toast.error('Failed to delete role');
            }
        } catch (error) {
            toast.error('Error deleting role');
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;

        const method = editingRole.id ? 'PUT' : 'POST';
        const url = editingRole.id
            ? `http://localhost:5000/api/roles/${editingRole.id}`
            : 'http://localhost:5000/api/roles';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingRole)
            });

            if (res.ok) {
                toast.success(editingRole.id ? 'Role updated' : 'Role created');
                setIsRoleModalOpen(false);
                fetchData();
            } else {
                toast.error('Failed to save role');
            }
        } catch (error) {
            toast.error('Error saving role');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.employee_id.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone_number?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.status.toLowerCase().includes(userSearch.toLowerCase())
    );

    const togglePrivilege = (module: string, privilege: string, checked: boolean) => {
        if (!editingRole) return;
        const newPrivileges = { ...editingRole.privileges };
        if (!newPrivileges[module]) newPrivileges[module] = {};
        newPrivileges[module][privilege] = checked;
        setEditingRole({ ...editingRole, privileges: newPrivileges });
    };

    if (currentUser?.role !== 'admin' && currentUser?.role_name !== 'Admin') {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[70vh] space-y-4 text-center">
                    <ShieldAlert className="w-16 h-16 text-destructive" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to access Admin Tools.</p>
                    <Button variant="outline" onClick={() => window.location.href = '/inbox'} className="mt-4">
                        Return to Dashboard
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Admin Tools"
            subtitle="Manage users, roles, and system permissions."
        >
            <div className="space-y-8 animate-fade-in">
                <Tabs defaultValue="users" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Users
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Roles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-6">
                        {/* User Management Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold">User Management</h2>
                                </div>
                                <Button onClick={() => {
                                    setEditingUser({
                                        id: 0,
                                        employee_id: '',
                                        name: '',
                                        email: '',
                                        phone_number: '',
                                        role_id: 0,
                                        role_name: '',
                                        status: 'Active',
                                        branch: '',
                                        team: '',
                                        position: ''
                                    });
                                    setIsUserModalOpen(true);
                                }}>
                                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name, email, employee ID, role..."
                                    className="pl-10 h-12 text-lg"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>

                            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-bold">Employee ID</TableHead>
                                            <TableHead className="font-bold">Name</TableHead>
                                            <TableHead className="font-bold">Email</TableHead>
                                            <TableHead className="font-bold">Phone</TableHead>
                                            <TableHead className="font-bold">Role</TableHead>
                                            <TableHead className="font-bold">Status</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                                        ) : filteredUsers.length === 0 ? (
                                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                                        ) : filteredUsers.map((u) => (
                                            <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium">{u.employee_id}</TableCell>
                                                <TableCell>{u.name}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>{u.phone_number || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                        {u.role_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={u.status === 'Active' ? 'default' : 'secondary'} className={u.status === 'Active' ? 'bg-emerald-500' : ''}>
                                                        {u.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            setEditingUser(u);
                                                            setIsUserModalOpen(true);
                                                        }}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteUser(u.id, u.employee_id)}
                                                            disabled={u.employee_id === 'EMP-001'}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="roles" className="space-y-6">
                        {/* Role Management Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <Shield className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Role Management</h2>
                                </div>
                                <Button variant="outline" onClick={() => {
                                    setEditingRole({ id: 0, name: '', description: '', privileges: {} });
                                    setIsRoleModalOpen(true);
                                }}>
                                    <Plus className="w-4 h-4 mr-2" /> Create Role
                                </Button>
                            </div>

                            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-bold">Role Name</TableHead>
                                            <TableHead className="font-bold">Description</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
                                        ) : roles.map((r) => (
                                            <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-bold text-indigo-500">{r.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{r.description}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            setEditingRole(r);
                                                            setIsRoleModalOpen(true);
                                                        }}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteRole(r.id)}
                                                            disabled={r.name === 'Admin'}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>
                    </TabsContent>
                </Tabs>


                {/* User Modal */}
                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSaveUser}>
                            <DialogHeader>
                                <DialogTitle>{editingUser?.id ? 'Edit User' : 'Add New User'}</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to {editingUser?.id ? 'update' : 'create'} a user account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input
                                        id="employee_id"
                                        value={editingUser?.employee_id || ''}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, employee_id: e.target.value } : null)}
                                        required
                                        disabled={editingUser?.employee_id === 'EMP-001'}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={editingUser?.name || ''}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editingUser?.email || ''}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={editingUser?.phone_number || ''}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={editingUser?.role_id?.toString()}
                                            onValueChange={(val) => setEditingUser(prev => prev ? { ...prev, role_id: parseInt(val) } : null)}
                                            disabled={editingUser?.employee_id === 'EMP-001'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map(r => (
                                                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={editingUser?.status}
                                            onValueChange={(val) => setEditingUser(prev => prev ? { ...prev, status: val } : null)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="branch">Branch</Label>
                                    <Input
                                        id="branch"
                                        value={editingUser?.branch || ''}
                                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, branch: e.target.value } : null)}
                                        required
                                        placeholder="e.g. Mesob Head Quarter"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="team">Team (Optional)</Label>
                                        <Input
                                            id="team"
                                            value={editingUser?.team || ''}
                                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, team: e.target.value } : null)}
                                            placeholder="e.g. Finance"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Input
                                            id="position"
                                            value={editingUser?.position || ''}
                                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, position: e.target.value } : null)}
                                            required
                                            placeholder="e.g. Manager"
                                        />
                                    </div>
                                </div>
                                {!editingUser?.id && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Initial Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Default: password123"
                                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Role Modal */}
                <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSaveRole}>
                            <DialogHeader>
                                <DialogTitle>{editingRole?.id ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                                <DialogDescription>
                                    Define the role name, description and module privileges.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="role_name">Role Name</Label>
                                    <Input
                                        id="role_name"
                                        value={editingRole?.name || ''}
                                        onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        required
                                        disabled={editingRole?.name === 'Admin'}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={editingRole?.description || ''}
                                        onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-lg font-bold">Privileges</Label>

                                    {/* My Library */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">My Library Module</h3>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="p-lib-upload"
                                                checked={editingRole?.privileges?.myLibrary?.upload || false}
                                                onCheckedChange={(checked) => togglePrivilege('myLibrary', 'upload', !!checked)}
                                            />
                                            <Label htmlFor="p-lib-upload" className="font-normal cursor-pointer">
                                                Upload documents from local storage to the archive page
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Compose */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Compose Module</h3>
                                        <div className="grid gap-3">
                                            {[
                                                { id: 'shareIndividual', label: 'Share documents for an individual' },
                                                { id: 'shareTeam', label: 'Share documents for a team' },
                                                { id: 'shareWorkspace', label: 'Share documents for a workspace' },
                                                { id: 'shareBranch', label: 'Share documents for a branch' },
                                                { id: 'createWorkspace', label: 'Create workspace and share documents' },
                                            ].map(p => (
                                                <div key={p.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`p-comp-${p.id}`}
                                                        checked={editingRole?.privileges?.compose?.[p.id] || false}
                                                        onCheckedChange={(checked) => togglePrivilege('compose', p.id, !!checked)}
                                                    />
                                                    <Label htmlFor={`p-comp-${p.id}`} className="font-normal cursor-pointer">{p.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Approval */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Approval Module</h3>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="p-app-has"
                                                checked={editingRole?.privileges?.approval?.hasModule || false}
                                                onCheckedChange={(checked) => togglePrivilege('approval', 'hasModule', !!checked)}
                                            />
                                            <Label htmlFor="p-app-has" className="font-normal cursor-pointer">
                                                Have the module
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Workspace */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Workspace Module</h3>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="p-work-create"
                                                checked={editingRole?.privileges?.workspace?.createWorkspace || false}
                                                onCheckedChange={(checked) => togglePrivilege('workspace', 'createWorkspace', !!checked)}
                                            />
                                            <Label htmlFor="p-work-create" className="font-normal cursor-pointer">
                                                Create workspace
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Role</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
