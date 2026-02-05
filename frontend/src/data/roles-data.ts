import { ModulePermissions, UserRole } from "@/types/user-types";

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, ModulePermissions> = {
    'System Admin': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: true, workspaces: true, templates: true
    },
    'General Director': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: true, workspaces: true, templates: true
    },
    'Vice Director (Digital)': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: true, workspaces: true, templates: true
    },
    'Vice Director (Service)': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: true, workspaces: true, templates: true
    },
    'Sub Director': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: true, workspaces: true, templates: true
    },
    'Team Leader': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: true, workspaces: true, templates: true
    },
    'Expert': {
        inbox: true, myLibrary: true, compose: true, sent: true, drafts: true, approvals: false, workspaces: false, templates: false
    },
    'Staff': {
        inbox: true, myLibrary: true, compose: false, sent: false, drafts: false, approvals: false, workspaces: false, templates: false
    }
};
