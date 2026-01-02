import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email || !name || !adminId || !password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "All fields are required",
        variant: "destructive",
      });
      return false;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (name.length < 2) {
      toast({
        title: "Invalid Name",
        description: "Name must be at least 2 characters",
        variant: "destructive",
      });
      return false;
    }

    if (adminId.length < 3) {
      toast({
        title: "Invalid Admin ID",
        description: "Admin ID must be at least 3 characters",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure your passwords match",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/register/admin", {
        email,
        name,
        admin_id: adminId,
        password,
      });

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Welcome! You can now login as admin.",
        });
        navigate("/admin/login");
      } else {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.detail || "An error occurred during registration",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast({
        title: "Registration Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Information Section */}
        <div className="hidden lg:flex flex-col justify-center text-white bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-12">
          <h1 className="text-4xl font-bold mb-6">Admin Registration</h1>
          <p className="text-xl mb-8 leading-relaxed">
            Register as an administrator to access the university timetable management system. Admin IDs are pre-assigned by the system.
          </p>

          <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-50">Important</p>
                <p className="text-sm text-red-100">
                  Your Admin ID must be pre-assigned by your system administrator. Contact your IT department if you don't have one.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-lg mb-2">As an Admin, you can:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Manage courses and departments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Generate optimized timetables
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Monitor system performance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Manage user accounts
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="flex flex-col justify-center">
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Create Admin Account</h2>
            <p className="text-gray-600 mb-6">Sign up for administrator access</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use your official university email or Gmail
                </p>
              </div>

              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="adminId" className="text-gray-700 font-medium">
                  Admin ID
                </Label>
                <Input
                  id="adminId"
                  type="text"
                  placeholder="ADMIN123"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value.toUpperCase())}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Any unique identifier (no pre-assignment needed for testing)
                </p>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 mt-6"
              >
                {loading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>

            <div className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{" "}
              <Link to="/admin/login" className="text-red-600 hover:underline font-medium">
                Login here
              </Link>
            </div>

            <p className="text-center text-gray-600 text-sm mt-4">
              <Link to="/" className="text-gray-600 hover:underline">
                Back to Home
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
