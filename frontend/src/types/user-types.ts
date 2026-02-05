export type UserRole =
    | 'System Admin'
    | 'General Director'
    | 'Vice Director (Digital)'
    | 'Vice Director (Service)'
    | 'Sub Director'
    | 'Team Leader'
    | 'Expert'
    | 'Staff';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface ModulePermissions {
    inbox: boolean;
    myLibrary: boolean;
    compose: boolean;
    sent: boolean;
    drafts: boolean;
    approvals: boolean;
    workspaces: boolean;
    templates: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: UserStatus;
    joinDate: string;
    avatarUrl?: string;
    customPermissions?: Partial<ModulePermissions>;
}
