"use client";
import { useState } from "react";
import {Input} from "@/components/Input";
import {Button} from "@/components/Button"

export default function RegisterPage(){
  const [selectedRole, setSelectedRole] = useState("CUSTOMER");

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-sidebar border border-brand-border rounded-lg p-8 shadow-md">
        <div className="text-center mb-6">
          {/* Logo Placeholder Match Navy Color */}
          <div className="inline-block px-3 py-1 bg-brand-navy text-white font-black text-xl rounded mb-3 tracking-tighter">
            SwitchLab
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-tight">Create an Account</h1>
          <p className="text-sm text-brand-textMuted mt-1">Join the professional custom keyboard studio hub</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full Name" type="text" placeholder="Arzaq Ajradika" required />
          <Input label="Email Address" type="email" placeholder="arzaq@example.com" required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" required />
          
          {/* Role Selection Segmented Control */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-brand-textMuted uppercase tracking-wider">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-md cursor-pointer text-sm font-semibold transition-all ${
                selectedRole === "CUSTOMER" 
                  ? "bg-brand-lightBg border-2 border-brand-navy text-brand-navy" 
                  : "bg-white border border-brand-border hover:border-slate-300 text-brand-textMuted font-medium"
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="CUSTOMER" 
                  checked={selectedRole === "CUSTOMER"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="accent-brand-navy" 
                />
                Customer
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 rounded-md cursor-pointer text-sm transition-all ${
                selectedRole === "MODDER" 
                  ? "bg-brand-lightBg border-2 border-brand-navy text-brand-navy font-semibold" 
                  : "bg-white border border-brand-border hover:border-slate-300 text-brand-textMuted font-medium"
              }`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="MODDER" 
                  checked={selectedRole === "MODDER"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="accent-brand-navy" 
                />
                Modder
              </label>
            </div>
          </div>
          
          <Button type="submit" variant="primary" className="mt-4" isLoading={false}>Register Account</Button>
        </form>
        
        
        <p className="text-center text-xs text-brand-textMuted mt-6">
          Already have an account? <a href="/login" className="text-brand-terracotta font-semibold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}