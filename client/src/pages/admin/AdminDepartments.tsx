import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDepartments, useCourses, useUsers, useCreateDepartment, useAssignUnitLecturer, useAddCourse, useAddUnit, useUpdateCourse, useDeleteCourse } from '@/hooks/useApi';

const AdminDepartments = () => {
  const navigate = useNavigate();
  
  const { data: departmentsResponse = { data: [] } } = useDepartments();
  const departments = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse?.data || []);
  
  const { data: coursesResponse = { data: [] } } = useCourses();
  const courses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);
  
  const { data: usersResponse = { data: [] } } = useUsers();
  const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
  
  const createDept = useCreateDepartment();
  const assignUnit = useAssignUnitLecturer();
  const addCourse = useAddCourse();
  const addUnit = useAddUnit();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [newDeptName, setNewDeptName] = useState('');
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: 3, color: '', units: [] as any[] });
  const resetNewCourse = () => setNewCourse({ code: '', name: '', credits: 3, color: '', units: [] });
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Record<string,string>>({});
  const [addingUnit, setAddingUnit] = useState<Record<string, { code: string; name: string }>>({});
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({});

  const handleCreateDept = async () => {
    if (!newDeptName.trim()) return;
    try {
      await createDept.mutateAsync(newDeptName.trim());
      setNewDeptName('');
    } catch (e) {
      console.error(e);
    }
  };

  const deptCourses = (deptId: string) => (courses as any[]).filter(c => String(c.departmentId) === String(deptId));

  return (
    <DashboardLayout role="admin" userName="Admin" onLogout={() => navigate('/')}> 
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Manage departments, their courses and units</p>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="New department name" value={newDeptName} onChange={(e) => setNewDeptName((e.target as HTMLInputElement).value)} />
            <Button onClick={handleCreateDept}>Create</Button>
          </div>
        </div>

        <div className="grid gap-4">
          {(departments as any[]).map((d) => (
            <div key={d.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-sm text-muted-foreground">{deptCourses(d.id).length} courses</div>
                </div>
                <div>
                  <Button size="sm" variant="ghost" onClick={() => setExpandedDept(expandedDept === d.id ? null : d.id)}>
                    {expandedDept === d.id ? 'Hide' : 'View'}
                  </Button>
                </div>
              </div>

              {expandedDept === d.id && (
                <div className="mt-4 space-y-3">
                  <div className="border rounded-md p-3">
                    <div className="font-medium">Create course in {d.name}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input placeholder="Course code" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: (e.target as HTMLInputElement).value })} />
                      <Input placeholder="Course name" value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: (e.target as HTMLInputElement).value })} />
                      <Input placeholder="Credits" value={String(newCourse.credits)} onChange={(e) => setNewCourse({ ...newCourse, credits: Number((e.target as HTMLInputElement).value || 0) })} />
                      <Input placeholder="Color" value={newCourse.color} onChange={(e) => setNewCourse({ ...newCourse, color: (e.target as HTMLInputElement).value })} />
                    </div>

                    <div className="mt-3">
                      <div className="font-medium">Units</div>
                      {(newCourse.units || []).map((u: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 mt-2">
                          <Input placeholder="Unit code" value={u.code} onChange={(e) => { const units = [...newCourse.units]; units[idx] = { ...units[idx], code: (e.target as HTMLInputElement).value }; setNewCourse({ ...newCourse, units }); }} />
                          <Input placeholder="Unit name" value={u.name} onChange={(e) => { const units = [...newCourse.units]; units[idx] = { ...units[idx], name: (e.target as HTMLInputElement).value }; setNewCourse({ ...newCourse, units }); }} />
                          <Button size="sm" variant="destructive" onClick={() => { const units = [...newCourse.units]; units.splice(idx, 1); setNewCourse({ ...newCourse, units }); }}>Remove</Button>
                        </div>
                      ))}
                      <div className="mt-2">
                        <Button size="sm" onClick={() => setNewCourse({ ...newCourse, units: [...(newCourse.units || []), { code: '', name: '' }] })}>Add unit</Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button onClick={async () => {
                        if (!newCourse.code || !newCourse.name) return alert('Course code and name required');
                        try {
                          await addCourse.mutateAsync({ ...newCourse, departmentId: d.id });
                          resetNewCourse();
                          alert('Course created');
                        } catch (err) { console.error(err); alert('Create failed'); }
                      }}>Create Course</Button>
                    </div>
                  </div>
                  {deptCourses(d.id).map((c: any) => {
                    const cid = String(c.id || c._id);
                    const expanded = !!expandedCourseIds[cid];
                    return (
                      <div key={c.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium cursor-pointer text-primary" onClick={() => setExpandedCourseIds({ ...expandedCourseIds, [cid]: !expanded })}>{c.code} — {c.name}</div>
                            <div className="text-sm text-muted-foreground">Credits: {c.credits}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">Units: {(c.units || []).length}</div>
                            <Button size="sm" variant="ghost" onClick={() => setExpandedCourseIds({ ...expandedCourseIds, [cid]: !expanded })}>{expanded ? 'Hide Units' : 'View Units'}</Button>
                            <Button size="sm" variant="ghost" onClick={async () => {
                              const newName = prompt('Edit program name', c.name || '');
                              const newCode = prompt('Edit program code', c.code || '');
                              if (newName == null || newCode == null) return;
                              try {
                                await updateCourse.mutateAsync({ id: c.id || c._id, data: { name: newName, code: newCode } });
                                alert('Updated');
                              } catch (err) { console.error(err); alert('Update failed'); }
                            }}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={async () => {
                              if (!confirm('Delete this program?')) return;
                              try {
                                await deleteCourse.mutateAsync(c.id || c._id);
                                alert('Deleted');
                              } catch (err) { console.error(err); alert('Delete failed'); }
                            }}>Delete</Button>
                          </div>
                        </div>

                        {expanded && (
                          <div className="mt-3 grid gap-2">
                            {(c.units || []).map((u: any) => (
                              <div key={u._id || u.id} className="flex items-center justify-between border-b py-2">
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
                                      await assignUnit.mutateAsync({ courseId: c.id || c._id, unitId: String(u._id || u.id), lecturerEmail });
                                      alert('Assigned');
                                    } catch (err) { console.error(err); alert('Assign failed'); }
                                  }}>Assign</Button>
                                </div>
                              </div>
                            ))}

                            <div className="mt-3">
                              {(() => {
                                const state = addingUnit[cid];
                                if (state) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <Input placeholder="Unit code" value={state.code} onChange={(e) => setAddingUnit({ ...addingUnit, [cid]: { ...state, code: (e.target as HTMLInputElement).value } })} />
                                      <Input placeholder="Unit name" value={state.name} onChange={(e) => setAddingUnit({ ...addingUnit, [cid]: { ...state, name: (e.target as HTMLInputElement).value } })} />
                                      <Button size="sm" onClick={async () => {
                                        if (!state.code || !state.name) return alert('unit code/name required');
                                        try {
                                          await addUnit.mutateAsync({ courseId: c.id || c._id, unit: { code: state.code, name: state.name } });
                                          setAddingUnit({ ...addingUnit, [cid]: undefined as any });
                                          alert('Unit added');
                                        } catch (err) { console.error(err); alert('Add failed'); }
                                      }}>Add</Button>
                                      <Button size="sm" variant="ghost" onClick={() => setAddingUnit({ ...addingUnit, [cid]: undefined as any })}>Cancel</Button>
                                    </div>
                                  );
                                }
                                return <Button size="sm" onClick={() => setAddingUnit({ ...addingUnit, [cid]: { code: '', name: '' } })}>Add Unit</Button>;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDepartments;
