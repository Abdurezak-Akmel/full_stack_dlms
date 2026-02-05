export type UserRole = 'staff' | 'manager' | 'director' | 'secretary' | 'admin' | 'auditor';

export type DocumentType = 'document' | 'letter';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'review' | 'shared' | 'draft' | 'sent' | 'pending_approval';

export type SendType = 'approval' | 'review' | 'information';

export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export interface User {
  id: string | number;
  employee_id: string; // From DB
  name: string;
  email: string;
  phone_number?: string;
  role: string | 'admin' | 'user' | 'manager'; // mapped from role_name
  role_name?: string; // from DB
  status: string;
  branch?: string;
  team?: string;
  position?: string;
  avatar?: string;
  department?: string; // Legacy field, might map to team
}


export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  sender?: User;
  date: string;
  created_at: string; // Added to match DB
  size: number | string;
  file_path?: string;
  original_name?: string;
  status: DocumentStatus;
  department?: string;
  workspace?: string;
  tags: string[];
  securityLevel: SecurityLevel;
  attachments: Attachment[];
  comments: Comment[];
  version: number;
  group?: string;
  scope?: 'personal' | 'department' | 'workspace' | 'organization';
  approvalNote?: string;
  approvalStatus?: 'approved' | 'rejected' | 'pending';
  approvalDate?: string; // ISO date string
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  date: string;
  replies?: Comment[];
}

export interface Approval {
  id: string;
  document: Document;
  step: number;
  totalSteps: number;
  deadline: string;
  requestedBy: User;
  status: DocumentStatus;
  type: 'content' | 'routing';
  targetScope?: string;
  decision?: 'approved' | 'rejected';
  decisionBy?: User;
  decisionDate?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  downloads: number;
  lastUpdated: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  members: User[];
  documentsCount: number;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  documentsCount: number;
}
