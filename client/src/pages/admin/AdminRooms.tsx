import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useRooms, useAddRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/useApi';
import { Plus, Search, MapPin, Users, Monitor, Wind, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';


const facilityIcons: Record<string, React.ElementType> = {
  Projector: Presentation,
  Whiteboard: Presentation,
  AC: Wind,
  Computers: Monitor,
};

const AdminRooms = () => {
  const navigate = useNavigate();
  const { data: roomsResponse = { data: [] } } = useRooms();
  const rooms = Array.isArray(roomsResponse) ? roomsResponse : (roomsResponse?.data || []);
  const addRoom = useAddRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', building: '', capacity: 30, facilities: [] as string[] });
  const [editRoom, setEditRoom] = useState<any | null>(null);

  const submit = async () => {
    try {
      await addRoom.mutateAsync(form);
      setShowForm(false);
      setForm({ name: '', building: '', capacity: 30, facilities: [] });
    } catch (e) { console.error(e); }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User" onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Room Management</h1>
            <p className="text-muted-foreground">{rooms.length} rooms available</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Room name" value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
              <Input placeholder="Building" value={form.building} onChange={(e) => setForm({ ...form, building: (e.target as HTMLInputElement).value })} />
              <Input type="number" placeholder="Capacity" value={String(form.capacity)} onChange={(e) => setForm({ ...form, capacity: Number((e.target as HTMLInputElement).value) })} />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={submit}>Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." className="pl-10" />
        </div>

        {/* Room Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="bg-card rounded-xl border shadow-sm p-6 transition-all duration-300 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {room.building}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditRoom(room);
                    setForm({ name: room.name || '', building: room.building || '', capacity: room.capacity || 30, facilities: room.facilities || [] });
                  }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm('Delete this room?')) return;
                    try {
                      await deleteRoom.mutateAsync(room.id);
                    } catch (e) { console.error(e); }
                  }}>Delete</Button>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{room.capacity}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(room.facilities || []).map((facility: string) => {
                  const Icon = facilityIcons[facility] || Presentation;
                  return (
                    <Badge key={facility} variant="secondary" className="gap-1">
                      <Icon className="w-3 h-3" />
                      {facility}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {editRoom && (
        <div className="bg-card p-4 rounded-lg border mt-4">
          <h3 className="font-semibold mb-2">Edit Room</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Room name" value={form.name} onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })} />
            <Input placeholder="Building" value={form.building} onChange={(e) => setForm({ ...form, building: (e.target as HTMLInputElement).value })} />
            <Input type="number" placeholder="Capacity" value={String(form.capacity)} onChange={(e) => setForm({ ...form, capacity: Number((e.target as HTMLInputElement).value) })} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={async () => {
              try {
                await updateRoom.mutateAsync({ id: editRoom.id, data: form });
                setEditRoom(null);
                setForm({ name: '', building: '', capacity: 30, facilities: [] });
              } catch (e) { console.error(e); }
            }}>Update</Button>
            <Button variant="ghost" onClick={() => setEditRoom(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminRooms;
