import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ModulePermissions, UserRole } from '@/types/user-types';
import { toast } from 'sonner';

interface RoleConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    roleName: UserRole | string;
    initialPermissions: ModulePermissions;
    onSave: (roleName: string, permissions: ModulePermissions) => void;
    isNewRole?: boolean;
}

const MODULE_LABELS: Record<keyof ModulePermissions, string> = {
    inbox: 'Inbox',
    myLibrary: 'My Library',
    compose: 'Compose',
    sent: 'Sent',
    drafts: 'Drafts',
    approvals: 'Approvals',
    workspaces: 'Workspaces',
    templates: 'Templates'
};

export function RoleConfigModal({ isOpen, onClose, roleName, initialPermissions, onSave, isNewRole = false }: RoleConfigModalProps) {
    const [permissions, setPermissions] = useState<ModulePermissions>(initialPermissions);
    const [name, setName] = useState(roleName);

    useEffect(() => {
        setPermissions(initialPermissions);
        setName(roleName);
    }, [initialPermissions, roleName, isOpen]);

    const handleToggle = (module: keyof ModulePermissions) => {
        setPermissions(prev => ({ ...prev, [module]: !prev[module] }));
    };

    const handleSave = () => {
        onSave(name, permissions);
        onClose();
        toast.success(`Permissions for ${name} saved successfully`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isNewRole ? 'Create New Role' : `Configure Permissions: ${roleName}`}</DialogTitle>
                    <DialogDescription>
                        Toggle the modules accessible to users with this role.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Role Name Input (only if new or needed) */}
                    {/* For now, assuming standard roles, but if isNewRole is true, we could add an input here. */}

                    <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(MODULE_LABELS) as Array<keyof ModulePermissions>).map((module) => (
                            <div key={module} className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor={module} className="flex-1 cursor-pointer">
                                    {MODULE_LABELS[module]}
                                </Label>
                                <Switch
                                    id={module}
                                    checked={permissions[module]}
                                    onCheckedChange={() => handleToggle(module)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
