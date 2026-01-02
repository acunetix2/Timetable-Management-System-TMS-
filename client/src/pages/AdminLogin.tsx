import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Missing Fields",
          description: "Please enter both email and password",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await login(email, password, "admin");
      setSuccessMessage("Login successful! Redirecting to admin panel...");
      
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-center p-4">
      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full border-2 border-green-200 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Access Granted!
            </h2>
            <p className="text-center text-gray-600">
              {successMessage}
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Welcome Section */}
        <div className="hidden lg:flex flex-col justify-center text-white bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-12">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Admin Access</h1>
          </div>
          <p className="text-xl mb-8 leading-relaxed">
            Manage your university's timetable system. Access administrative tools to oversee courses, rooms, departments, and generate optimized timetables.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                ⚙️
              </div>
              <div>
                <p className="font-semibold">Full Control</p>
                <p className="text-sm text-red-100">Manage all system settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📊
              </div>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-sm text-red-100">View system statistics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                👥
              </div>
              <div>
                <p className="font-semibold">User Management</p>
                <p className="text-sm text-red-100">Manage all users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mb-6">Access the administration panel</p>

            <form onSubmit={handleLogin} className="space-y-4">
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
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 mt-6"
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </Button>
            </form>
            <p className="text-center text-gray-600 text-sm mt-6">
              Back to{" "}
              <Link to="/" className="text-red-600 hover:underline font-medium">
                Home
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
