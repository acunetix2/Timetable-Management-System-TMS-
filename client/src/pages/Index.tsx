import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Building, Calendar, ArrowRight, CheckCircle2, Clock, Shield, Zap, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'View your personalized timetable, enroll in units, and stay organized',
      icon: GraduationCap,
      color: 'hsl(200, 95%, 50%)',
      path: '/student/login',
      action: 'Sign In / Register'
    },
    {
      id: 'lecturer',
      title: 'Lecturer',
      description: 'Manage your teaching schedule, set availability, and view class details',
      icon: Users,
      color: 'hsl(280, 95%, 50%)',
      path: '/lecturer/login',
      action: 'Sign In'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Generate timetables, manage departments, courses, and resolve conflicts',
      icon: Shield,
      color: 'hsl(0, 100%, 50%)',
      path: '/admin/login',
      action: 'Admin Portal'
    },
  ];

  const features = [
    { icon: Calendar, title: 'Smart Scheduling', description: 'AI-powered algorithm minimizes clashes' },
    { icon: Clock, title: 'Real-time Updates', description: 'Instant notifications for changes' },
    { icon: Building, title: 'Room Management', description: 'Optimal room allocation based on capacity' },
    { icon: CheckCircle2, title: 'Clash Detection', description: 'Automatic conflict identification' },
    { icon: Zap, title: 'Fast Processing', description: 'Generate timetables in seconds' },
    { icon: TrendingUp, title: 'Analytics', description: 'Track scheduling efficiency metrics' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CSM System</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/login')} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
              Student
            </button>
            <button onClick={() => navigate('/lecturer/login')} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
              Lecturer
            </button>
            <button onClick={() => navigate('/admin/login')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-40 -left-40 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -bottom-40 -right-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Automatic Clash-Free Timetable Generation</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Campus <br /><span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Schedules Management System</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              An algorithm-based solution that generates clash-free, optimized timetables for students, 
              lecturers, and administrators with unmatched accuracy and speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/student/login')} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg">
                Get Started
              </Button>
              <Button onClick={() => navigate('/#features')} variant="outline" className="h-12 px-8 border-2 border-gray-300 hover:border-blue-400 font-semibold text-base rounded-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Role Selection */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access your personalized dashboard with features tailored to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="group bg-white rounded-2xl border border-gray-200 p-8 text-left transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1"
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: `${role.color}20` }}
              >
                <role.icon className="w-8 h-8" style={{ color: role.color }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">{role.description}</p>
              <div className="flex items-center font-semibold transition-all group-hover:gap-2">
                <span className="text-base" style={{ color: role.color }}>{role.action}</span>
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" style={{ color: role.color }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with advanced algorithms to handle the complexity of university scheduling
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm Section */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Algorithm-Based Approach</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Uses hybrid heuristics to solve complex scheduling problems efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { num: '1', title: 'Conflict Graph', desc: 'Courses become nodes, conflicts become edges' },
            { num: '2', title: 'Graph Coloring', desc: 'Assign time slots prioritizing high-conflict courses' },
            { num: '3', title: 'Optimization', desc: 'Improve solution using local search techniques' },
            { num: '4', title: 'Validation', desc: 'Check for clashes, capacity, and constraints' },
          ].map((step) => (
            <div key={step.num} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                {step.num}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
              <p className="text-gray-700">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Security & Privacy</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your data is protected with enterprise-grade security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Lock, title: 'Secure Authentication', desc: 'Role-based email verification and OTP' },
              { icon: Shield, title: 'Data Protection', desc: 'Encrypted data transmission and storage' },
              { icon: CheckCircle2, title: 'Compliance', desc: 'GDPR compliant and audit-ready' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Scheduling?</h2>
          <p className="text-xl text-blue-100 mb-8">Join your institution's modern timetable management system today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/student/login')} className="h-12 px-8 bg-white hover:bg-gray-100 text-blue-600 font-semibold text-base rounded-lg">
              Student Sign In
            </Button>
            <Button onClick={() => navigate('/lecturer/login')} className="h-12 px-8 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-base rounded-lg border-2 border-white">
              Lecturer Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">UniTimetable</span>
              </div>
              <p className="text-sm text-gray-400">Smart timetable management for modern universities</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/')} className="hover:text-white transition">Home</button></li>
                <li><button className="hover:text-white transition">About</button></li>
                <li><button className="hover:text-white transition">Features</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Access</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/student/login')} className="hover:text-white transition">Student Portal</button></li>
                <li><button onClick={() => navigate('/lecturer/login')} className="hover:text-white transition">Lecturer Portal</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition">Admin Portal</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition">Help Center</button></li>
                <li><button className="hover:text-white transition">Contact Us</button></li>
                <li><button className="hover:text-white transition">Documentation</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2024 UniTimetable. All rights reserved. © Phantom Developers Community
              </p>
              <div className="flex gap-6 text-sm">
                <button className="hover:text-white transition">Privacy Policy</button>
                <button className="hover:text-white transition">Terms of Service</button>
                <button className="hover:text-white transition">Cookie Policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

