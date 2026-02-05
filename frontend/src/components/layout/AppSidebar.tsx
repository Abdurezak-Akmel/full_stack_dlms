import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Inbox,
  Archive,
  PlusSquare,
  SendHorizontal,
  Clock,
  CheckSquare,
  Users,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const mainNavItems = [
  { icon: Inbox, label: 'Inbox', path: '/inbox' },
  { icon: Archive, label: 'My Library', path: '/archive' },
  { icon: PlusSquare, label: 'Compose', path: '/compose' },
  { icon: SendHorizontal, label: 'Sent', path: '/sent' },
  { icon: Clock, label: 'Drafts', path: '/drafts' },
  { icon: CheckSquare, label: 'Approvals', path: '/approvals' },
  { icon: Users, label: 'Workspaces', path: '/workspaces' },
  { icon: FileText, label: 'Templates', path: '/templates' },
];

const adminNavItems = [
  { icon: Shield, label: 'Admin Tools', path: '/admin/tools' },
];


export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';


  if (!user) return null;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="DLMS Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold text-sidebar-foreground">DLMS</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "nav-item",
                isActive && "nav-item-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <>
            {!collapsed && (
              <div className="pt-4 mt-4 border-t border-sidebar-border">
                <p className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                  Admin
                </p>
              </div>
            )}
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "nav-item",
                    isActive && "nav-item-active"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg bg-sidebar-muted mb-2",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-sidebar-primary-foreground">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50", collapsed && "justify-center px-2")}
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && "Log Out"}
        </Button>
      </div>
    </aside>
  );
}
