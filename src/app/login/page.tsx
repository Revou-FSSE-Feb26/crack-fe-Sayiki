"use client";
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-sidebar border border-brand-border rounded-lg p-8 shadow-md">
        <div className="text-center mb-8">
          {/* Logo Placeholder Match Navy Color */}
          <div className="inline-block px-3 py-1 bg-brand-navy text-white font-black text-xl rounded mb-3 tracking-tighter">
            SwitchLab
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-tight">Welcome to SwitchLab</h1>
          <p className="text-sm text-brand-textMuted mt-1">Sign in to coordinate your keyboard mods</p>
        </div>
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <Input label="Email Address" type="email" placeholder="name@example.com" required />
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-brand-textMuted uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-brand-terracotta font-semibold hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-3 py-2 bg-white border border-brand-border focus:border-brand-navy rounded-md text-brand-textMain placeholder-slate-400 focus:outline-none transition-colors text-sm shadow-sm" 
            />
          </div>
          
          <Button type="submit" variant="primary" className="mt-2" isLoading={false}>Sign In</Button>
        </form>
        
        <p className="text-center text-xs text-brand-textMuted mt-6">
          Don't have an account? <a href="/register" className="text-brand-terracotta font-semibold hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
}