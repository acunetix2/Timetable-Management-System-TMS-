import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLecturerAssignments, useLecturerAvailableSlots, useSelectTimeSlot } from '@/hooks/useApi';
import { Calendar, Clock, MapPin, Users, CheckCircle2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const LecturerAvailability = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: assignmentsResponse = { data: [] }, isLoading } = useLecturerAssignments();
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : (assignmentsResponse?.data || []);
  
  const selectTimeSlot = useSelectTimeSlot();
  
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  const { data: slotsResponse = { data: [] }, isLoading: slotsLoading } = useLecturerAvailableSlots(
    selectedAssignment?.id || ''
  );
  
  // Unwrap slots data
  const availableSlots = Array.isArray(slotsResponse) ? slotsResponse : (slotsResponse?.data || []);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Filter slots for selected day
  const slotsForDay = availableSlots.filter((slot: any) => slot.day === selectedDay);
  
  // Group slots by duration
  const slots2hr = slotsForDay.filter((s: any) => s.duration === "2 hours");
  const slots3hr = slotsForDay.filter((s: any) => s.duration === "3 hours");

  if (isLoading) {
    return (
      <DashboardLayout role="lecturer" userName={user?.name || 'Lecturer'} onLogout={() => navigate('/')}>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const pendingAssignments = assignments.filter((a: any) => a.class_status === 'pending');

  const handleViewAvailability = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setSelectedDay("Monday");
    setSelectedSlots([]);
    setDialogOpen(true);
  };

  const handleSelectSlot = async (slot: any) => {
    // Check if already selected 2 slots
    if (selectedSlots.length >= 2) {
      toast({
        title: 'Limit Reached',
        description: 'You can only select maximum 2 time slots per unit per week',
        variant: 'destructive',
      });
      return;
    }

    try {
      await selectTimeSlot.mutateAsync({
        assignment_id: selectedAssignment.id,
        day: slot.day,
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
      
      // Add to selected slots
      setSelectedSlots([...selectedSlots, `${slot.day}-${slot.start_time}-${slot.end_time}`]);
      
      toast({
        title: 'Success',
        description: `Time slot selected: ${slot.day} ${slot.display}`,
      });
      
      // Close after 2 selections
      if (selectedSlots.length + 1 >= 2) {
        setTimeout(() => {
          setDialogOpen(false);
          setSelectedAssignment(null);
          setSelectedSlots([]);
        }, 1000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select time slot',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout role="lecturer" userName={user?.name || 'Lecturer'} onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Time Slot Selection</h1>
          <p className="text-muted-foreground">Select preferred time slots for your assigned units</p>
        </div>

        {/* Pending Assignments List */}
        {pendingAssignments.length > 0 ? (
          <div className="grid gap-4">
            {pendingAssignments.map((assignment: any) => (
              <Card key={assignment.id} className="p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{assignment.course_name || assignment.course_id}</h3>
                    <p className="text-muted-foreground">{assignment.unit_name || assignment.unit_id}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50">Pending</Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Room: {assignment.room || assignment.room_name || 'TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{assignment.student_count || 0} students</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewAvailability(assignment)}
                  disabled={slotsLoading}
                  className="w-full"
                >
                  {slotsLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Loading slots...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      View Available Slots
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Set!</h3>
            <p className="text-muted-foreground">You have selected time slots for all your assignments</p>
            <Button onClick={() => navigate('/lecturer/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </Card>
        )}

        {/* Dialog for Slot Selection */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Time Slots for All Days</DialogTitle>
              <DialogDescription>
                {selectedAssignment && (
                  <span>
                    {selectedAssignment.course_name || selectedAssignment.course_id} - {selectedAssignment.unit_name || selectedAssignment.unit_id}
                    <br />
                    <span className="text-xs">Select up to 2 time slots per week (Selected: {selectedSlots.length}/2)</span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* 2-Hour Lectures Table */}
                {availableSlots.some((s: any) => s.duration === "2 hours") && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">2-Hour Lectures</h3>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time Slot</TableHead>
                            {days.map((day) => (
                              <TableHead key={day} className="text-center min-w-32">
                                {day}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Get unique times for 2-hour lectures */}
                          {Array.from(
                            new Set(
                              availableSlots
                                .filter((s: any) => s.duration === "2 hours")
                                .map((s: any) => `${s.start_time}-${s.end_time}`)
                            )
                          ).map((timeSlot) => {
                            const [startTime] = timeSlot.split("-");
                            const displayTime = availableSlots.find(
                              (s: any) =>
                                s.duration === "2 hours" &&
                                `${s.start_time}-${s.end_time}` === timeSlot
                            )?.display;

                            return (
                              <TableRow key={timeSlot}>
                                <TableCell className="font-medium">{displayTime}</TableCell>
                                {days.map((day) => {
                                  const slot = availableSlots.find(
                                    (s: any) =>
                                      s.day === day &&
                                      s.duration === "2 hours" &&
                                      `${s.start_time}-${s.end_time}` === timeSlot
                                  );

                                  const isSelected = selectedSlots.includes(
                                    `${day}-${startTime.split(":")[0]}:00-${parseInt(startTime.split(":")[0]) + 2}:00`
                                  );

                                  return (
                                    <TableCell key={`${day}-${timeSlot}`} className="text-center">
                                      {slot ? (
                                        <div
                                          className={`flex items-center justify-center p-2 rounded transition ${
                                            isSelected
                                              ? "bg-blue-100 border-2 border-blue-500"
                                              : slot.status === "green"
                                              ? "bg-green-100 border border-green-300 hover:bg-green-200"
                                              : "bg-red-100 border border-red-300 opacity-50"
                                          }`}
                                        >
                                          {isSelected ? (
                                            <span className="text-xs font-semibold text-blue-700">✓ Selected</span>
                                          ) : slot.status === "green" ? (
                                            <Button
                                              onClick={() => handleSelectSlot(slot)}
                                              disabled={selectTimeSlot.isPending || selectedSlots.length >= 2}
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 text-xs"
                                            >
                                              {selectTimeSlot.isPending ? (
                                                <Loader className="w-3 h-3 animate-spin" />
                                              ) : (
                                                "Select"
                                              )}
                                            </Button>
                                          ) : (
                                            <span className="text-xs font-semibold text-red-700">Booked</span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-muted-foreground">-</div>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 3-Hour Lectures Table */}
                {availableSlots.some((s: any) => s.duration === "3 hours") && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">3-Hour Lectures</h3>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time Slot</TableHead>
                            {days.map((day) => (
                              <TableHead key={day} className="text-center min-w-32">
                                {day}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Get unique times for 3-hour lectures */}
                          {Array.from(
                            new Set(
                              availableSlots
                                .filter((s: any) => s.duration === "3 hours")
                                .map((s: any) => `${s.start_time}-${s.end_time}`)
                            )
                          ).map((timeSlot) => {
                            const [startTime] = timeSlot.split("-");
                            const displayTime = availableSlots.find(
                              (s: any) =>
                                s.duration === "3 hours" &&
                                `${s.start_time}-${s.end_time}` === timeSlot
                            )?.display;

                            return (
                              <TableRow key={timeSlot}>
                                <TableCell className="font-medium">{displayTime}</TableCell>
                                {days.map((day) => {
                                  const slot = availableSlots.find(
                                    (s: any) =>
                                      s.day === day &&
                                      s.duration === "3 hours" &&
                                      `${s.start_time}-${s.end_time}` === timeSlot
                                  );

                                  const isSelected = selectedSlots.includes(
                                    `${day}-${startTime.split(":")[0]}:00-${parseInt(startTime.split(":")[0]) + 3}:00`
                                  );

                                  return (
                                    <TableCell key={`${day}-${timeSlot}`} className="text-center">
                                      {slot ? (
                                        <div
                                          className={`flex items-center justify-center p-2 rounded transition ${
                                            isSelected
                                              ? "bg-blue-100 border-2 border-blue-500"
                                              : slot.status === "green"
                                              ? "bg-green-100 border border-green-300 hover:bg-green-200"
                                              : "bg-red-100 border border-red-300 opacity-50"
                                          }`}
                                        >
                                          {isSelected ? (
                                            <span className="text-xs font-semibold text-blue-700">✓ Selected</span>
                                          ) : slot.status === "green" ? (
                                            <Button
                                              onClick={() => handleSelectSlot(slot)}
                                              disabled={selectTimeSlot.isPending || selectedSlots.length >= 2}
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 text-xs"
                                            >
                                              {selectTimeSlot.isPending ? (
                                                <Loader className="w-3 h-3 animate-spin" />
                                              ) : (
                                                "Select"
                                              )}
                                            </Button>
                                          ) : (
                                            <span className="text-xs font-semibold text-red-700">Booked</span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-muted-foreground">-</div>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LecturerAvailability;
