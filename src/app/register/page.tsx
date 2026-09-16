"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

export default function RegisterPage(){
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "MODDER">("CUSTOMER");
  const [city, setCity] = useState("Jakarta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.register({
        name,
        email,
        password,
        role: selectedRole,
        locationCity: city,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-sidebar border-2 border-slate-900 p-8 shadow-md">
        <div className="text-center mb-6">
          {/* Logo in True Brand Navy */}
          <div className="inline-block px-3.5 py-1.5 bg-brand-navy text-white font-black text-xl mb-3 tracking-tight border-2 border-brand-navy">
            SwitchLab
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-tight">Create an Account</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted mt-1">Join the professional custom keyboard studio hub</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono mb-4">
            ⚠ {error}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="Arzaq Ajradika" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="arzaq@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Min. 8 characters" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <Input 
            label="City / Region" 
            type="text" 
            placeholder="Jakarta, Bandung, Depok..." 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required 
          />
          
          {/* Role Selection Segmented Control */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 cursor-pointer text-xs font-mono font-bold uppercase tracking-wider transition-all border-2 ${
                selectedRole === "CUSTOMER" 
                  ? "bg-brand-lightBg border-brand-navy text-brand-navy" 
                  : "bg-white border-slate-800 hover:border-brand-navy text-brand-textMuted"
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="CUSTOMER" 
                  checked={selectedRole === "CUSTOMER"}
                  onChange={(e) => setSelectedRole(e.target.value as "CUSTOMER")}
                  className="accent-brand-navy" 
                />
                Customer
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 cursor-pointer text-xs font-mono font-bold uppercase tracking-wider transition-all border-2 ${
                selectedRole === "MODDER" 
                  ? "bg-brand-lightBg border-brand-navy text-brand-navy" 
                  : "bg-white border-slate-800 hover:border-brand-navy text-brand-textMuted"
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="MODDER" 
                  checked={selectedRole === "MODDER"}
                  onChange={(e) => setSelectedRole(e.target.value as "MODDER")}
                  className="accent-brand-navy" 
                />
                Modder
              </label>
            </div>
          </div>
          
          <Button type="submit" variant="primary" className="mt-4" isLoading={loading}>
            {loading ? "Registering..." : "Register Account →"}
          </Button>
        </form>
        
        <p className="text-center text-xs font-mono text-brand-textMuted mt-6">
          Already have an account? <a href="/login" className="text-brand-terracotta font-bold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}