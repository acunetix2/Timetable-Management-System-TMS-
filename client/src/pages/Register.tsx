import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useRegister();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ email, password, role });
      toast({ title: 'Account created', description: 'You can now sign in.' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err?.message || 'Failed to create account', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:flex items-center justify-center rounded-xl" style={{backgroundImage: "url('/auth-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="p-6" style={{backdropFilter: 'blur(4px) brightness(0.9)'}}>
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
              <p className="opacity-90">Join your institution and manage timetables easily.</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Register</h1>
            <p className="text-sm text-muted-foreground">Set up your account to get started</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} type="email" placeholder="you@university.edu" required disabled={isLoading} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} type="password" placeholder="Create a password" required disabled={isLoading} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setRole('student')} className={`px-3 py-2 rounded ${role === 'student' ? 'bg-primary text-white' : 'bg-muted/20'}`} disabled={isLoading}>
                  Student
                </button>
                <button type="button" onClick={() => setRole('lecturer')} className={`px-3 py-2 rounded ${role === 'lecturer' ? 'bg-primary text-white' : 'bg-muted/20'}`} disabled={isLoading}>
                  Lecturer
                </button>
                <button type="button" onClick={() => setRole('admin')} className={`px-3 py-2 rounded ${role === 'admin' ? 'bg-primary text-white' : 'bg-muted/20'}`} disabled={isLoading}>
                  Admin
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                'Signup'
              )}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm">
            Already have an account?{' '}
            <a className="text-primary font-medium" onClick={() => navigate('/login')}>Sign in</a>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="bg-card p-4 rounded-full shadow">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
