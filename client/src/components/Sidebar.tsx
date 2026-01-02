import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Calendar,
  LayoutDashboard,
  Users,
  BookOpen,
  Building,
  Settings,
  LogOut,
  GraduationCap,
  AlertTriangle,
  Clock,
  ChevronLeft,
  Menu,
  User,
  Shield,
} from 'lucide-react';
import { UserRole } from '@/types/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SidebarProps {
  role: UserRole;
  userName: string;
  onLogout?: () => void;
}

const menuItems: Record<UserRole, { label: string; icon: React.ElementType; path: string }[]> = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'My Timetable', icon: Calendar, path: '/student/timetable' },
    { label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { label: 'Clash Alerts', icon: AlertTriangle, path: '/student/clashes' },
  ],
  lecturer: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/lecturer/dashboard' },
    { label: 'Teaching Schedule', icon: Calendar, path: '/lecturer/schedule' },
    { label: 'My Courses', icon: BookOpen, path: '/lecturer/courses' },
    { label: 'Availability', icon: Clock, path: '/lecturer/availability' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
    { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { label: 'Departments', icon: Building, path: '/admin/departments' },
    { label: 'Rooms', icon: Building, path: '/admin/rooms' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  student: 'Student Portal',
  lecturer: 'Lecturer Portal',
  admin: 'Admin Panel',
};

const Sidebar = ({ role, userName, onLogout }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const items = menuItems[role];

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0 hidden lg:flex',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TimeTable</h1>
              <p className="text-xs text-sidebar-foreground/70">{roleLabels[role]}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <Popover open={profileOpen} onOpenChange={setProfileOpen}>
          <PopoverTrigger asChild>
            <button className="w-full">
              {!collapsed && (
                <div className="flex items-center gap-3 px-3 py-2 mb-2 hover:bg-sidebar-accent rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-sm font-semibold">{userName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">{role}</p>
                  </div>
                </div>
              )}
              {collapsed && (
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-sm font-semibold">{userName.charAt(0)}</span>
                  </div>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-56 p-0">
            <div className="bg-popover rounded-lg border shadow-lg">
              {/* Profile Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    navigate(`/${role}/account`);
                    setProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors text-foreground"
                >
                  <User className="w-4 h-4" />
                  Account Settings
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => {
                      navigate('/admin/settings');
                      setProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors text-foreground"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Settings
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Logout */}
              <div className="p-2">
                <LogoutButton variant="popover" onLogout={onLogout} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {collapsed && <LogoutButton collapsed={true} variant="sidebar" onLogout={onLogout} />}
        {!collapsed && <LogoutButton collapsed={false} variant="sidebar" onLogout={onLogout} />}
      </div>
    </aside>
  );
};

const LogoutButton = ({ collapsed, variant, onLogout }: { collapsed?: boolean; variant?: 'sidebar' | 'popover'; onLogout?: () => void }) => {
  const { logout } = useAuth();
  const handle = () => {
    logout();
    if (onLogout) onLogout();
  };

  if (variant === 'popover') {
    return (
      <button
        onClick={handle}
        className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors text-destructive"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handle}
      className={cn(
        'w-full text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive',
        collapsed ? 'px-0 justify-center' : 'justify-start'
      )}
    >
      <LogOut className="w-5 h-5" />
      {!collapsed && <span className="ml-3">Log out</span>}
    </Button>
  );
};

export default Sidebar;
