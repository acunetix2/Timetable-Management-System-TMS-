import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    registrationNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Validate email format
    if (!formData.email.includes("@students.")) {
      toast({
        title: "Invalid Email",
        description: "Student emails must be in format: name@students.domain",
        variant: "destructive",
      });
      return false;
    }

    // Validate registration number format: XXX000-0000/YYYY (e.g., ABC001-2345/2024)
    const regNoRegex = /^[A-Z]{3}\d{3}-\d{4}\/\d{4}$/;
    if (!regNoRegex.test(formData.registrationNumber.toUpperCase())) {
      toast({
        title: "Invalid Registration Number",
        description: "Format must be: ABC001-2345/2024 (3 letters, 3 numbers, dash, 4 numbers, slash, 4-digit year)",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
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
      await apiClient.post("/auth/register/student", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        registration_number: formData.registrationNumber,
      });

      setSuccessMessage("Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/student/login");
      }, 2000);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      interface ErrorResponse {
        response?: {
          data?: {
            detail?: string;
          };
        };
      }
      const errorResponse = error as ErrorResponse;
      toast({
        title: "Registration Failed",
        description: errorResponse.response?.data?.detail || "Please try again",
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
              Registration Successful!
            </h2>
            <p className="text-center text-gray-600 mb-4">
              {successMessage}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1)'}}></div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Welcome Section */}
        <div className="hidden lg:flex flex-col justify-center text-white bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-12">
          <h1 className="text-4xl font-bold mb-6">Join Our System</h1>
          <p className="text-xl mb-8 leading-relaxed">
            Create your student account and gain access to an intelligent timetable management system designed for your academic success.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                🎓
              </div>
              <div>
                <p className="font-semibold">Smart Scheduling</p>
                <p className="text-sm text-blue-100">Automated clash detection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📱
              </div>
              <div>
                <p className="font-semibold">Mobile Friendly</p>
                <p className="text-sm text-blue-100">Access anywhere, anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                🔒
              </div>
              <div>
                <p className="font-semibold">Secure</p>
                <p className="text-sm text-blue-100">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="flex flex-col justify-center">
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Create Account</h2>
            <p className="text-gray-600 mb-6">Register as a student</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Student Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@students.jkuat.ac.ke"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must end with @students.domain
                </p>
              </div>

              <div>
                <Label htmlFor="regNo" className="text-gray-700 font-medium">
                  Registration Number
                </Label>
                <Input
                  id="regNo"
                  type="text"
                  placeholder="SCT221-0001/2024"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: ABC001-2345/2024 (3 letters + 3 digits - 4 digits / 4-digit year)
                </p>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-white font-medium"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-center">
                Already have an account?{" "}
                <Link to="/student/login" className="text-blue-600 hover:underline font-semibold">
                  Sign in
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
