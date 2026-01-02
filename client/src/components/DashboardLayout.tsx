import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { UserRole } from '@/types/api';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  userName: string;
  onLogout?: () => void;
}

const DashboardLayout = ({ children, role, userName, onLogout }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} userName={userName} onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
