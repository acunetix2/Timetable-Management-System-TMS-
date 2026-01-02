import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useLogin();
  const { toast } = useToast();
  const { setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await mutateAsync({ email, password });
      // inform auth context and fetch current user
      let fetchedUser = null;
      if (data?.token) fetchedUser = await setToken(data.token, data.user ?? null);
      toast({ title: 'Signed in', description: 'Welcome back!' });
      // If `/auth/me` failed but we still have a token, decode its payload to get role
      let role = fetchedUser?.role;
      if (!role && data?.token) {
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          role = payload.role;
        } catch (e) {
          // ignore parse errors
        }
      }
      if (role === 'lecturer') navigate('/lecturer');
      else if (role === 'admin') navigate('/admin');
      else navigate('/student');
    } catch (err: any) {
      toast({ title: 'Sign in failed', description: err?.message || 'Invalid credentials', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:flex rounded-xl shadow-lg p-8 text-white flex-col justify-center" style={{backgroundImage: "url('/auth-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <div className="backdrop-brightness-75 p-4 rounded-lg" style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35))'}}>
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="opacity-90">Access your timetable, manage courses and handle scheduling with ease.</p>
            <div className="mt-6 opacity-90 text-sm">Use your university account to sign in.</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Sign in to TimeTable</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} type="email" placeholder="you@university.edu" required disabled={isLoading} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} type="password" placeholder="••••••••" required disabled={isLoading} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="checkbox" />
                Remember me
              </label>
              <a className="text-primary hover:underline" onClick={() => navigate('/forgot')}>
                Forgot?
              </a>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm">
            Don’t have an account?{' '}
            <a className="text-primary font-medium" onClick={() => navigate('/register')}>Create one</a>
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

export default Login;
