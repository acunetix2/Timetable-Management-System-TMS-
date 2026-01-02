import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUsers } from '@/hooks/useApi';
import { Plus, Search, MoreHorizontal, Edit, Trash2, GraduationCap, Users, Shield, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';

const roleConfig = {
  student: { icon: GraduationCap, color: 'hsl(174, 62%, 47%)', label: 'Student' },
  lecturer: { icon: Users, color: 'hsl(38, 92%, 50%)', label: 'Lecturer' },
  admin: { icon: Shield, color: 'hsl(280, 65%, 50%)', label: 'Admin' },
};

const MessageLabel = ({ type, message }: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) => {
  const colorConfig = {
    success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  };
  const config = colorConfig[type];
  return (
    <div className={`${config.bg} border ${config.border} ${config.text} px-3 py-2 rounded-md text-sm flex items-center gap-2`}>
      {type === 'success' && <Check className="w-4 h-4" />}
      {type === 'error' && <Trash2 className="w-4 h-4" />}
      {type === 'warning' && <MoreHorizontal className="w-4 h-4" />}
      {type === 'info' && <Search className="w-4 h-4" />}
      {message}
    </div>
  );
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { data: usersResponse = { data: [] }, refetch } = useUsers();
  const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'lecturer' | 'admin'>('lecturer');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lecturerId: '',
    adminId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewDetailsMode, setViewDetailsMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.name) {
      toast({
        title: "Missing Fields",
        description: "Email and name are required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (selectedRole === 'lecturer') {
      if (formData.email.includes("@students.")) {
        toast({
          title: "Invalid Email",
          description: "Lecturer emails should not contain @students",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.lecturerId) {
        toast({
          title: "Missing Lecturer ID",
          description: "Please enter the lecturer ID",
          variant: "destructive",
        });
        return false;
      }
      if (!isEditMode && !formData.password) {
        toast({
          title: "Missing Password",
          description: "Please enter a password for the lecturer",
          variant: "destructive",
        });
        return false;
      }
      if (!isEditMode && formData.password && formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return false;
      }
      if (!isEditMode && formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please ensure both passwords match",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (formData.email.includes("@students.")) {
        toast({
          title: "Invalid Email",
          description: "Admin emails should not contain @students",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.adminId) {
        toast({
          title: "Missing Admin ID",
          description: "Please enter the admin ID",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.password) {
        toast({
          title: "Missing Password",
          description: "Please set an initial password for the admin",
          variant: "destructive",
        });
        return false;
      }
      if (formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please ensure both passwords match",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (selectedRole === 'lecturer') {
        const response = await apiClient.post("/auth/create/lecturer", {
          email: formData.email,
          name: formData.name,
          lecturer_id: formData.lecturerId,
          password: formData.password,
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Lecturer created successfully",
          });
          setSuccessMessage('Lecturer created successfully!');
          setTimeout(() => setSuccessMessage(null), 2000);
          setIsDialogOpen(false);
          setFormData({
            email: '',
            name: '',
            lecturerId: '',
            adminId: '',
            password: '',
            confirmPassword: ''
          });
          refetch();
        }
      } else {
        const response = await apiClient.post("/auth/create/admin", {
          email: formData.email,
          name: formData.name,
          admin_id: formData.adminId,
          password: formData.password,
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Admin created successfully",
          });
          setSuccessMessage('Admin created successfully!');
          setTimeout(() => setSuccessMessage(null), 2000);
          setIsDialogOpen(false);
          setFormData({
            email: '',
            name: '',
            lecturerId: '',
            adminId: '',
            password: '',
            confirmPassword: ''
          });
          refetch();
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/auth/users/${userId}`);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        setSuccessMessage('User deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 2000);
        setDeleteConfirm(false);
        setDeleteUserId(null);
        refetch();
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    setSelectedRole(user.role === 'lecturer' ? 'lecturer' : 'admin');
    setFormData({
      email: user.email,
      name: user.name,
      lecturerId: user.lecturer_id || '',
      adminId: user.admin_id || '',
      password: '',
      confirmPassword: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setViewDetailsMode(false);
    setSelectedUser(null);
    setSelectedUserId(null);
    setFormData({
      email: '',
      name: '',
      lecturerId: '',
      adminId: '',
      password: '',
      confirmPassword: ''
    });
    setSelectedRole('lecturer');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setViewDetailsMode(true);
    setIsEditMode(false);
    setIsDialogOpen(true);
    setSuccessMessage(`Viewing ${user.name}'s details`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleSwitchToEdit = (user: any) => {
    setIsEditMode(true);
    setViewDetailsMode(false);
    setSelectedUserId(user.id);
    setSelectedRole(user.role === 'lecturer' ? 'lecturer' : 'admin');
    setFormData({
      email: user.email,
      name: user.name,
      lecturerId: user.lecturer_id || '',
      adminId: user.admin_id || '',
      password: '',
      confirmPassword: ''
    });
    setSuccessMessage(`Now editing ${user.name}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleUserRowClick = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (user && user.role !== 'student') {
      handleViewDetails(user);
    }
  };

  const lecturers = (users as any[]).filter(u => u.role === 'lecturer');
  const admins = (users as any[]).filter(u => u.role === 'admin');
  const students = (users as any[]).filter(u => u.role === 'student');

  const filteredLecturers = lecturers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RoleTable = ({ roleUsers, isEditable }: { roleUsers: any[]; isEditable: boolean }) => (
    <>
      {roleUsers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleUsers.map((user) => {
                const config = roleConfig[user.role];
                const Icon = config.icon;
                const userId = user.role === 'lecturer' ? user.lecturer_id : user.admin_id;
                return (
                  <TableRow 
                    key={user.id}
                    className={isEditable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                    onClick={() => isEditable && handleUserRowClick(user.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" 
                          style={{ backgroundColor: config.color }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {userId}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isEditable && (
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setDeleteUserId(user.id);
                              setDeleteConfirm(true);
                            }}
                          >
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
      )}
    </>
  );

  return (
    <DashboardLayout role="admin" userName="Admin User" onLogout={() => navigate('/')}>
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <MessageLabel type="success" message={successMessage} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage lecturers and admins across the system
            </p>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: roleConfig.lecturer.color }} />
                <span className="font-medium">{lecturers.length} Lecturers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: roleConfig.admin.color }} />
                <span className="font-medium">{admins.length} Admins</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" style={{ color: roleConfig.student.color }} />
                <span className="font-medium">{students.length} Students</span>
              </div>
            </div>
          </div>
          <Button onClick={() => {
            setIsEditMode(false);
            setSelectedUserId(null);
            setFormData({
              email: '',
              name: '',
              lecturerId: '',
              adminId: '',
              password: '',
              confirmPassword: ''
            });
            setSelectedRole('lecturer');
            setIsDialogOpen(true);
          }} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs for Role-based View */}
        <Tabs defaultValue="lecturers" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="lecturers" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Lecturers</span>
              <span className="sm:hidden">({lecturers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admins</span>
              <span className="sm:hidden">({admins.length})</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Students</span>
              <span className="sm:hidden">({students.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lecturers" className="mt-6">
            <RoleTable roleUsers={filteredLecturers} isEditable={true} />
          </TabsContent>

          <TabsContent value="admins" className="mt-6">
            <RoleTable roleUsers={filteredAdmins} isEditable={true} />
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <RoleTable roleUsers={filteredStudents} isEditable={false} />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
                disabled={loading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create/Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              {viewDetailsMode ? (
                <>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>
                    View user information
                  </DialogDescription>
                </>
              ) : (
                <>
                  <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update user details' : 'Add a new admin or lecturer to the system'}
                  </DialogDescription>
                </>
              )}
            </DialogHeader>
            
            {viewDetailsMode && selectedUser ? (
              <div className="overflow-y-auto flex-1 px-6 space-y-4">
                {/* Details View */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl"
                      style={{ backgroundColor: roleConfig[selectedUser.role].color }}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                      <Badge style={{ 
                        backgroundColor: `${roleConfig[selectedUser.role].color}20`, 
                        color: roleConfig[selectedUser.role].color 
                      }} className="mt-2">
                        {roleConfig[selectedUser.role].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Label className="text-xs text-gray-600 font-medium">Email</Label>
                      <p className="text-sm font-medium mt-1">{selectedUser.email}</p>
                    </div>

                    {selectedUser.role === 'lecturer' && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <Label className="text-xs text-gray-600 font-medium">Lecturer ID</Label>
                        <p className="text-sm font-medium mt-1 font-mono">{selectedUser.lecturer_id || 'N/A'}</p>
                      </div>
                    )}

                    {selectedUser.role === 'admin' && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <Label className="text-xs text-gray-600 font-medium">Admin ID</Label>
                        <p className="text-sm font-medium mt-1 font-mono">{selectedUser.admin_id || 'N/A'}</p>
                      </div>
                    )}

                    {selectedUser.role === 'student' && selectedUser.registration_number && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <Label className="text-xs text-gray-600 font-medium">Registration Number</Label>
                        <p className="text-sm font-medium mt-1 font-mono">{selectedUser.registration_number}</p>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3">
                      <Label className="text-xs text-gray-600 font-medium">Account Created</Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 px-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  {!isEditMode && (
                    <div>
                      <Label htmlFor="role" className="text-gray-700 font-medium">
                        User Role

                    </Label>
                    <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lecturer">Lecturer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@domain.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-2"
                    required
                  />
                </div>

                {selectedRole === 'lecturer' ? (
                  <>
                    <div>
                      <Label htmlFor="lecturerId" className="text-gray-700 font-medium">
                        Lecturer ID
                      </Label>
                      <Input
                        id="lecturerId"
                        name="lecturerId"
                        type="text"
                        placeholder="LEC001"
                        value={formData.lecturerId}
                        onChange={handleInputChange}
                        className="mt-2"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the unique lecturer identifier
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pr-10"
                          required={!isEditMode}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {!isEditMode && (
                        <p className="text-sm text-gray-500 mt-1">
                          Minimum 6 characters
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pr-10"
                          required={!isEditMode}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="adminId" className="text-gray-700 font-medium">
                        Admin ID
                      </Label>
                      <Input
                        id="adminId"
                        name="adminId"
                        type="text"
                        placeholder="ADM001"
                        value={formData.adminId}
                        onChange={handleInputChange}
                        className="mt-2"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the unique admin identifier
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum 6 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
            )}
            <div className="flex-shrink-0 flex gap-2 pt-4 px-6 border-t mt-4">
              {viewDetailsMode && selectedUser ? (
                <>
                  {selectedUser.role !== 'student' && (
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => handleSwitchToEdit(selectedUser)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className={selectedUser.role !== 'student' ? 'flex-1' : 'w-full'}
                  >
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                    onClick={handleCreateUser}
                  >
                    {loading ? 'Processing...' : isEditMode ? 'Update User' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
