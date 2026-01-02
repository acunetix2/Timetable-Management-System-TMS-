import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export default function LecturerRegister() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    lecturerId: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Validate email format (no @students)
    if (formData.email.includes("@students.")) {
      toast({
        title: "Invalid Email",
        description: "Lecturer emails should not contain @students",
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

    if (!formData.lecturerId.trim()) {
      toast({
        title: "Missing Lecturer ID",
        description: "Please enter the lecturer ID assigned by your admin",
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
      await apiClient.post("/auth/register/lecturer", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        lecturer_id: formData.lecturerId,
      });

      toast({
        title: "Registration Successful",
        description: "Please log in with your credentials",
      });

      navigate("/lecturer/login");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Welcome Section */}
        <div className="hidden lg:flex flex-col justify-center text-white bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-12">
          <h1 className="text-4xl font-bold mb-6">Join Our Educators</h1>
          <p className="text-xl mb-8 leading-relaxed">
            Create your educator account to manage your teaching schedule, courses, and student interactions efficiently.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                ✨
              </div>
              <div>
                <p className="font-semibold">Smart Scheduling</p>
                <p className="text-sm text-purple-100">Avoid schedule conflicts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📊
              </div>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-sm text-purple-100">View class statistics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                🔐
              </div>
              <div>
                <p className="font-semibold">Secure</p>
                <p className="text-sm text-purple-100">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="flex flex-col justify-center">
          <Card className="p-8 border-2">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Create Account</h2>
            <p className="text-gray-600 mb-6">Register as a lecturer</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Smith"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@jkuat.ac.ke"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: firstname.lastname@domain
                </p>
              </div>

              <div>
                <Label htmlFor="lecturerId" className="text-gray-700 font-medium">
                  Lecturer ID
                </Label>
                <Input
                  id="lecturerId"
                  type="text"
                  placeholder="Your lecturer ID from admin"
                  name="lecturerId"
                  value={formData.lecturerId}
                  onChange={handleChange}
                  required
                  className="mt-2 border-gray-300"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Contact your administrator for this ID
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
                className="w-full bg-purple-600 hover:bg-purple-700 h-10 text-white font-medium"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-center">
                Already have an account?{" "}
                <Link to="/lecturer/login" className="text-purple-600 hover:underline font-semibold">
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
