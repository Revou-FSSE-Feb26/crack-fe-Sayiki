"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { api, syncAuthCookies } from "@/lib/api";

export default function RegisterPage(){
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "MODDER">("CUSTOMER");
  const [city, setCity] = useState("Jakarta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Client-Side Guard: If already logged in, redirect away from /register
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const role = String(userObj?.role || '').toUpperCase();
        if (role) {
          syncAuthCookies();
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
    } finally {
      setIsCheckingSession(false);
    }
  }, [router]);

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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('switchlab_cart');
        localStorage.removeItem('switchlab_orders');
        window.dispatchEvent(new Event('cart_updated'));
      }
      if (selectedRole === 'MODDER') {
        router.push('/modder/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {/* Role Selection Segmented Control */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider">
              I want to join SwitchLab as a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 cursor-pointer text-xs font-mono font-bold uppercase tracking-wider transition-all border-2 ${
                selectedRole === "CUSTOMER" 
                  ? "bg-brand-lightBg border-brand-navy text-brand-navy shadow-xs" 
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
                  ? "bg-amber-50 border-amber-600 text-amber-900 shadow-xs" 
                  : "bg-white border-slate-800 hover:border-brand-navy text-brand-textMuted"
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="MODDER" 
                  checked={selectedRole === "MODDER"}
                  onChange={(e) => setSelectedRole(e.target.value as "MODDER")}
                  className="accent-amber-600" 
                />
                🛠️ Modder Studio
              </label>
            </div>
          </div>

          <Input 
            label={selectedRole === "MODDER" ? "Modder / Studio Name" : "Full Name"} 
            type="text" 
            placeholder={selectedRole === "MODDER" ? "e.g. Nadia Tuner" : "e.g. Arzaq Ajradika"} 
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

          {/* City / Location Input */}
          <div className="space-y-1.5">
            <Input 
              label={
                selectedRole === "MODDER" 
                  ? "📍 Studio City / Workshop Location (Directory Listing)" 
                  : "📍 City / Region (For Shipping & Delivery)"
              } 
              type="text" 
              placeholder="e.g. Bandung, Jakarta, Depok..." 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required 
            />

            {/* Quick Pick Location Chips */}
            <div>
              <div className="text-[10px] font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                Quick Select City:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Jakarta", "Bandung", "Depok", "Tangerang", "Bekasi", "Surabaya", "Yogyakarta"].map((c) => {
                  const isSelected = city.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`px-2 py-0.5 text-[11px] font-mono border transition-all ${
                        isSelected
                          ? "bg-brand-navy text-white border-brand-navy font-bold"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedRole === "MODDER" && (
              <p className="text-[11px] font-mono text-amber-900 bg-amber-50 p-2 border border-amber-300 leading-tight">
                💡 <strong>Modders Directory:</strong> Your studio will be filtered under <em>{city || "your city"}</em> so customers in your area can discover and book walk-in tuning or local courier drop-offs.
              </p>
            )}
          </div>
          
          <Button type="submit" variant="primary" className="mt-4" isLoading={loading}>
            {loading ? "Registering..." : selectedRole === "MODDER" ? "Register Modder Studio →" : "Register Account →"}
          </Button>
        </form>
        
        <p className="text-center text-xs font-mono text-brand-textMuted mt-6">
          Already have an account? <a href="/login" className="text-brand-terracotta font-bold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}