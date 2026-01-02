import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCourses, useUsers, useAddUnit, useAssignUnitLecturer } from '@/hooks/useApi';

const AdminCourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { data: courses = [] } = useCourses();
  const { data: users = [] } = useUsers();
  const addUnit = useAddUnit();
  const assignUnit = useAssignUnitLecturer();

  const course = (courses as any[]).find((c) => String(c.id || c._id) === String(courseId));

  const [unitForm, setUnitForm] = useState({ code: '', name: '' });
  const [assigning, setAssigning] = useState<Record<string,string>>({});

  if (!course) {
    return (
      <DashboardLayout role="admin" userName="Admin" onLogout={() => navigate('/')}> 
        <div className="p-6">Course not found or still loading.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" userName="Admin" onLogout={() => navigate('/')}> 
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.code} — {course.name}</h1>
            <div className="text-sm text-muted-foreground">Credits: {course.credits}</div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/admin/departments')}>Back</Button>
        </div>

        <div className="border rounded-md p-4">
          <div className="font-medium">Units</div>
          <div className="mt-3 space-y-2">
            {(course.units || []).map((u: any) => (
              <div key={String(u._id || u.id)} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.code} — {u.name}</div>
                  <div className="text-xs text-muted-foreground">Unit ID: {String(u._id || u.id)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={assigning[String(u._id || u.id)] ?? (u.lecturer || '')} onChange={(e) => setAssigning({ ...assigning, [String(u._id || u.id)]: (e.target as HTMLSelectElement).value })} className="input">
                    <option value="">Unassigned</option>
                    {(users as any[]).filter(us => us.role === 'lecturer').map(l => (
                      <option key={l.email} value={l.email}>{l.name} ({l.email})</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={async () => {
                    const lecturerEmail = assigning[String(u._id || u.id)] || u.lecturer || '';
                    if (!lecturerEmail) return alert('Select a lecturer');
                    try {
                      await assignUnit.mutateAsync({ courseId: course.id || course._id, unitId: String(u._id || u.id), lecturerEmail });
                      alert('Assigned');
                    } catch (err) { console.error(err); alert('Assign failed'); }
                  }}>Assign</Button>
                </div>
              </div>
            ))}

            <div className="mt-4 border-t pt-4">
              <div className="font-medium">Add Unit</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input placeholder="Unit code" value={unitForm.code} onChange={(e) => setUnitForm({ ...unitForm, code: (e.target as HTMLInputElement).value })} />
                <Input placeholder="Unit name" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: (e.target as HTMLInputElement).value })} />
              </div>
              <div className="mt-3">
                <Button onClick={async () => {
                  if (!unitForm.code || !unitForm.name) return alert('Unit code and name required');
                  try {
                    await addUnit.mutateAsync({ courseId: course.id || course._id, unit: { code: unitForm.code, name: unitForm.name } });
                    setUnitForm({ code: '', name: '' });
                    alert('Unit added');
                  } catch (err) { console.error(err); alert('Add failed'); }
                }}>Add Unit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourseDetail;
