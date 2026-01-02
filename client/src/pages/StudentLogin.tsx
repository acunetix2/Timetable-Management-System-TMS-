import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function StudentLogin() {
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
      // Validate student email format
      if (!email.includes("@students.")) {
        toast({
          title: "Invalid Email",
          description: "Student emails must be in format: name@students.domain",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await login(email, password, "student");
      setSuccessMessage("Login successful! Redirecting to dashboard...");
      
      setTimeout(() => {
        navigate("/student/dashboard");
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
        <div className="hidden lg:flex flex-col justify-center text-white bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-12">
          <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
          <p className="text-xl mb-8 leading-relaxed">
            Access your timetable, courses, and academic schedule. Stay updated with your classes and manage your academic journey efficiently.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📚
              </div>
              <div>
                <p className="font-semibold">View Your Timetable</p>
                <p className="text-sm text-blue-100">Never miss a class</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                ✓
              </div>
              <div>
                <p className="font-semibold">Enroll in Units</p>
                <p className="text-sm text-blue-100">Choose your courses easily</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                🔔
              </div>
              <div>
                <p className="font-semibold">Get Notifications</p>
                <p className="text-sm text-blue-100">Stay informed of changes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Student Login</h2>
            <p className="text-gray-600 mb-6">Sign in to your student account</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@students.domain"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: firstname.lastname@students.jkuat.ac.ke
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
                className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-white font-medium"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-center">
                Don't have an account?{" "}
                <Link to="/student/register" className="text-blue-600 hover:underline font-semibold">
                  Signup
                </Link>
              </p>
            </div>

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
