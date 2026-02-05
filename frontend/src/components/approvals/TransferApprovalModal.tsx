import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Search, AlertTriangle } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { User as UserType } from '@/types/dlms';

interface TransferApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransfer: (user: UserType) => void;
}

export function TransferApprovalModal({ isOpen, onClose, onTransfer }: TransferApprovalModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const departments = Array.from(new Set(mockUsers.map(u => u.department)));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transfer Approval Responsibility</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        <p className="text-sm text-warning-foreground">
                            Transferring this approval will remove it from your queue. The selected user will become responsible for the decision.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search people..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Depts</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-md max-h-[200px] overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            <div className="divide-y">
                                {filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${selectedUser?.id === user.id ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.role} • {user.department}</p>
                                        </div>
                                        {selectedUser?.id === user.id && (
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No users found
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => selectedUser && onTransfer(selectedUser)}
                        disabled={!selectedUser}
                    >
                        Transfer Approval
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
