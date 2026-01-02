import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings, Clock, Calendar, Building, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your scheduling preferences have been updated.',
    });
  };

  return (
    <DashboardLayout role="admin" userName="Admin User" onLogout={() => navigate('/')}>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Scheduling Settings</h1>
          <p className="text-muted-foreground">Configure constraints and preferences for timetable generation</p>
        </div>

        {/* Time Constraints */}
        <div className="bg-card rounded-xl border shadow-sm p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Time Constraints</h2>
              <p className="text-sm text-muted-foreground">Define scheduling hours</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" defaultValue="17:00" />
            </div>
            <div className="space-y-2">
              <Label>Class Duration (minutes)</Label>
              <Input type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label>Break Duration (minutes)</Label>
              <Input type="number" defaultValue="10" />
            </div>
          </div>
        </div>

        {/* Room Preferences */}
        <div className="bg-card rounded-xl border shadow-sm p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-semibold">Room Allocation</h2>
              <p className="text-sm text-muted-foreground">Room assignment preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-assign rooms</p>
                <p className="text-sm text-muted-foreground">Automatically select optimal rooms based on capacity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Prioritize same building</p>
                <p className="text-sm text-muted-foreground">Keep consecutive classes in the same building</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lab room matching</p>
                <p className="text-sm text-muted-foreground">Match courses requiring labs to appropriate rooms</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Conflict Handling */}
        <div className="bg-card rounded-xl border shadow-sm p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold">Conflict Resolution</h2>
              <p className="text-sm text-muted-foreground">How to handle scheduling conflicts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow soft conflicts</p>
                <p className="text-sm text-muted-foreground">Allow scheduling with warnings for non-critical overlaps</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Send conflict notifications</p>
                <p className="text-sm text-muted-foreground">Notify affected users about scheduling conflicts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
