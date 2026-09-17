"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { api, syncAuthCookies } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Immediate Client-Side Guard: If already logged in, redirect immediately!
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const role = String(userObj?.role || '').toUpperCase();
        if (role) {
          // Sync cookies immediately to ensure middleware and edge requests are aligned
          syncAuthCookies();

          const redirect = searchParams.get("redirect");
          if (redirect && !redirect.startsWith("/login") && !redirect.startsWith("/register")) {
            if (redirect.startsWith("/modder") && role !== "MODDER" && role !== "ADMIN") {
              router.replace("/orders");
              return;
            }
            if (redirect.startsWith("/admin") && role !== "ADMIN") {
              router.replace("/");
              return;
            }
            router.replace(redirect);
            return;
          }

          if (role === "ADMIN") {
            router.replace("/admin");
            return;
          } else if (role === "MODDER") {
            router.replace("/modder/dashboard");
            return;
          } else {
            router.replace("/orders");
            return;
          }
        }
      }
    } catch (e) {
      // ignore
    } finally {
      setIsCheckingSession(false);
    }
  }, [router, searchParams]);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPass });
      const userRole = String(res.user?.role || '').toUpperCase();

      const redirect = searchParams.get('redirect');
      if (redirect && !redirect.startsWith('/login') && !redirect.startsWith('/register')) {
        if (redirect.startsWith('/modder') && userRole !== 'MODDER' && userRole !== 'ADMIN') {
          router.replace('/orders');
          return;
        }
        if (redirect.startsWith('/admin') && userRole !== 'ADMIN') {
          router.replace('/');
          return;
        }
        router.replace(redirect);
        return;
      }

      if (userRole === 'ADMIN') {
        router.replace('/admin');
      } else if (userRole === 'MODDER') {
        router.replace('/modder/dashboard');
      } else {
        router.replace('/orders');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    performLogin(roleEmail, 'password123');
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="p-8 bg-brand-sidebar border-2 border-slate-900 shadow-md text-center max-w-sm w-full">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-navy border-t-transparent mb-4"></div>
          <h2 className="text-base font-bold font-mono text-brand-textMain uppercase tracking-wide">Checking Session...</h2>
          <p className="text-xs font-mono text-brand-textMuted mt-1">Connecting to SwitchLab Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-sidebar border-2 border-slate-900 p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="inline-block px-3.5 py-1.5 bg-brand-navy text-white font-black text-xl mb-3 tracking-tight border-2 border-brand-navy">
            SwitchLab
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-tight">Welcome to SwitchLab</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted mt-1">Sign in to coordinate your keyboard mods</p>
        </div>

        {/* Quick 1-Click Role Login Box */}
        <div className="mb-6 p-3.5 bg-brand-lightBg border-2 border-slate-800">
          <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-navy mb-2">
            ⚡ Quick 1-Click Role Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole('customer@switchlab.local')}
              className="px-2 py-1.5 bg-white border border-slate-900 hover:bg-slate-100 text-[10px] font-mono font-bold text-slate-800 transition-colors uppercase"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('raka@switchlab.local')}
              className="px-2 py-1.5 bg-white border border-slate-900 hover:bg-slate-100 text-[10px] font-mono font-bold text-brand-navy transition-colors uppercase"
            >
              🛠️ Modder
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('admin@switchlab.local')}
              className="px-2 py-1.5 bg-white border border-slate-900 hover:bg-slate-100 text-[10px] font-mono font-bold text-amber-800 transition-colors uppercase"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono mb-5">
            ⚠ {error}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider">Password</label>
              <span className="text-[11px] font-mono text-slate-500 font-bold">Default: password123</span>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-800 focus:border-brand-navy text-brand-textMain placeholder-slate-400 focus:outline-none transition-colors text-sm font-mono mt-1" 
            />
          </div>
          
          <Button type="submit" variant="primary" className="mt-4" isLoading={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </Button>
        </form>
        
        <p className="text-center text-xs font-mono text-brand-textMuted mt-6">
          Don&apos;t have an account? <a href="/register" className="text-brand-terracotta font-bold hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="p-8 bg-brand-sidebar border-2 border-slate-900 shadow-md text-center max-w-sm w-full">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-navy border-t-transparent mb-4"></div>
          <h2 className="text-base font-bold font-mono text-brand-textMain uppercase tracking-wide">Loading SwitchLab...</h2>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}