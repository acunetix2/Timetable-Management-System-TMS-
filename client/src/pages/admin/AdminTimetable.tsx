import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import TimetableGrid from '@/components/TimetableGrid';
import { useTimetable } from '@/hooks/useApi';
import { Download, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminTimetable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: timetableResponse = { data: [] } } = useTimetable();
  const timetable = Array.isArray(timetableResponse) ? timetableResponse : (timetableResponse?.data || []);

  const handleRegenerate = () => {
    toast({
      title: 'Regenerating Timetable',
      description: 'Running optimization algorithm...',
    });
  };

  return (
    <DashboardLayout role="admin" userName="Admin User" onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Master Timetable</h1>
            <p className="text-muted-foreground">Complete schedule overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Constraints
            </Button>
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <TimetableGrid entries={timetable as any[]} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTimetable;
