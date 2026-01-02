import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

export default function LecturerLogin() {
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
      // Validate lecturer email format (no @students)
      if (email.includes("@students.")) {
        toast({
          title: "Invalid Email",
          description: "Lecturer emails should not contain @students",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await login(email, password, "lecturer");
      setSuccessMessage("Login successful! Redirecting to dashboard...");
      
      setTimeout(() => {
        navigate("/lecturer/dashboard");
      }, 1500);
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full border-2 border-green-200 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-center text-gray-600">
              {successMessage}
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Welcome Section */}
        <div className="hidden lg:flex flex-col justify-center text-white bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-12">
          <h1 className="text-4xl font-bold mb-6">Welcome, Educator!</h1>
          <p className="text-xl mb-8 leading-relaxed">
            Manage your teaching schedule, courses, and student enrollments efficiently. Access your class timetable and availability preferences.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📖
              </div>
              <div>
                <p className="font-semibold">Manage Classes</p>
                <p className="text-sm text-purple-100">View and schedule your units</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                ⏰
              </div>
              <div>
                <p className="font-semibold">Set Availability</p>
                <p className="text-sm text-purple-100">Choose your teaching times</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                👥
              </div>
              <div>
                <p className="font-semibold">Track Students</p>
                <p className="text-sm text-purple-100">View enrollments per class</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Lecturer Login</h2>
            <p className="text-gray-600 mb-6">Sign in to your lecturer account</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="lecturername@domain"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: firstname.lastname@domain
                </p>
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
                className="w-full bg-purple-600 hover:bg-purple-700 h-10 text-white font-medium"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
                Back to Home
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
