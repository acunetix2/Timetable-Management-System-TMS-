import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useCourses, useUsers, useDepartments, useAddCourse, useUpdateCourse, useDeleteCourse, useRooms } from '@/hooks/useApi';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminCourses = () => {
  const navigate = useNavigate();

  const { data: coursesResponse = { data: [] } } = useCourses();
  const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);
  
  const { data: usersResponse = { data: [] } } = useUsers();
  const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
  
  const { data: roomsResponse = { data: [] } } = useRooms();
  const rooms = Array.isArray(roomsResponse) ? roomsResponse : (roomsResponse?.data || []);
  
  const addCourse = useAddCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  
  const { data: departmentsResponse = { data: [] } } = useDepartments();
  const departments = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse?.data || []);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ code: '', name: '', lecturerId: '', credits: 3, color: '#0ea5a4', departmentId: '', roomId: '', units: [] });
  const [newUnit, setNewUnit] = useState({ code: '', name: '' });
  const [editCourse, setEditCourse] = useState<any | null>(null);

  const submit = async () => {
    try {
      const courseData = {
        code: form.code,
        name: form.name,
        department_id: form.departmentId,
        college_id: form.departmentId, // Using department_id as college_id for now
        duration_years: 3,
        room_id: form.roomId || undefined,
      };
      await addCourse.mutateAsync(courseData);
      setShowForm(false);
      setForm({ code: '', name: '', lecturerId: '', credits: 3, color: '#0ea5a4', departmentId: '', roomId: '', units: [] });
    } catch (e) {
      console.error(e);
    }
  };
  const submitUpdate = async () => {
    if (!editCourse) return;
    try {
      await updateCourse.mutateAsync({ id: editCourse.id, data: form });
      setEditCourse(null);
      setForm({ code: '', name: '', lecturerId: '', credits: 3, color: '#0ea5a4' });
    } catch (e) {
      console.error(e);
    }
  };
  const getLecturer = (lecturerId: string) => (users as any[]).find((u) => u.email === lecturerId);

  return (
    <DashboardLayout role="admin" userName="Admin User" onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Programs & Units</h1>
            <p className="text-muted-foreground">{(courses as any[]).length} programs registered</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: (e.target as HTMLInputElement).value })} />
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
              <select value={form.lecturerId} onChange={(e) => setForm({ ...form, lecturerId: (e.target as HTMLSelectElement).value })} className="input">
                <option value="">Assign lecturer (optional)</option>
                {(users as any[]).filter(u => u.role === 'lecturer').map(l => <option key={l.id} value={l.email}>{l.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: (e.target as HTMLSelectElement).value })} className="input">
                <option value="">Select Department</option>
                {(departments as any[]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: (e.target as HTMLSelectElement).value })} className="input">
                <option value="">Select Room (optional)</option>
                {(rooms as any[]).map(r => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
              </select>
              <div></div>
              <div>
                <div className="flex gap-2">
                  <Input placeholder="Unit code" value={newUnit.code} onChange={(e) => setNewUnit({ ...newUnit, code: (e.target as HTMLInputElement).value })} />
                  <Input placeholder="Unit name" value={newUnit.name} onChange={(e) => setNewUnit({ ...newUnit, name: (e.target as HTMLInputElement).value })} />
                  <Button onClick={() => {
                    if (!newUnit.code || !newUnit.name) return;
                    setForm({ ...form, units: [...(form.units || []), { code: newUnit.code, name: newUnit.name }] });
                    setNewUnit({ code: '', name: '' });
                  }}>Add Unit</Button>
                </div>
                <div className="mt-2 space-y-1">
                  {(form.units || []).map((u: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between border p-2 rounded">
                      <div>{u.code} — {u.name}</div>
                      <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, units: (form.units || []).filter((_: any, i: number) => i !== idx) })}>Remove</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={submit}>Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {editCourse && (
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Edit Course</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: (e.target as HTMLInputElement).value })} />
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
              <select value={form.lecturerId} onChange={(e) => setForm({ ...form, lecturerId: (e.target as HTMLSelectElement).value })} className="input">
                <option value="">Assign lecturer (optional)</option>
                {(users as any[]).filter(u => u.role === 'lecturer').map(l => <option key={l.id} value={l.email}>{l.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={submitUpdate}>Update</Button>
              <Button variant="ghost" onClick={() => { setEditCourse(null); setForm({ code: '', name: '', lecturerId: '', credits: 3, color: '#0ea5a4' }); }}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-10" />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Program Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(courses as any[]).map((course) => {
                const dept = (departments as any[]).find((d) => String(d.id) === String(course.departmentId));
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: `${course.color || '#000'}20`, color: course.color || '#000' }}
                      >
                        {course.code}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="cursor-pointer text-primary" onClick={() => navigate(`/admin/course/${course.id || course._id}`)}>{course.name}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{dept?.name ?? '-'}</TableCell>
                    <TableCell>{(course.units || []).length}</TableCell>
                    <TableCell>{course.enrolledStudents ?? 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditCourse(course);
                            setForm({
                              code: course.code || '',
                              name: course.name || '',
                              lecturerId: course.lecturerId || '',
                              credits: course.credits || 3,
                              color: course.color || '#0ea5a4',
                            });
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={async () => {
                            if (!confirm('Delete this course?')) return;
                            try {
                              await deleteCourse.mutateAsync(course.id);
                            } catch (e) { console.error(e); }
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
