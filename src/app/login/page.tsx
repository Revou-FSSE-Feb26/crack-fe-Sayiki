"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-sidebar border-2 border-slate-900 p-8 shadow-md">
        <div className="text-center mb-8">
          {/* Logo in True Brand Navy */}
          <div className="inline-block px-3.5 py-1.5 bg-brand-navy text-white font-black text-xl mb-3 tracking-tight border-2 border-brand-navy">
            SwitchLab
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-tight">Welcome to SwitchLab</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted mt-1">Sign in to coordinate your keyboard mods</p>
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
              <a href="#" className="text-xs font-mono text-brand-terracotta font-semibold hover:underline">Forgot password?</a>
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