import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { UserRole } from '@/types/api';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  userName: string;
  onLogout?: () => void;
}

const DashboardLayout = ({ children, role, userName, onLogout }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 lg:hidden bg-card border-b z-50 flex items-center justify-between p-4">
        <h1 className="font-bold text-lg">TMS</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 lg:static lg:translate-x-0 z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div onClick={() => setMobileMenuOpen(false)}>
          <Sidebar role={role} userName={userName} onLogout={onLogout} />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto w-full pt-16 lg:pt-0">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
