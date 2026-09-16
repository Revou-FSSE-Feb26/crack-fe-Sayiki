"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "Services", href: "/services" },
    { label: "Modders", href: "/modders" },
    { label: "Marketplace", href: "/search" },
    { label: "Orders", href: "/orders" },
  ];

  return (
    <nav className="bg-white border-b-2 border-slate-900 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white font-black text-lg tracking-tight border-2 border-brand-navy hover:opacity-95 transition-all"
            >
              <span>SwitchLab</span>
              <span className="text-[9px] font-mono font-bold px-1 py-0.5 bg-white/20 text-white uppercase tracking-widest">
                ESCROW
              </span>
            </Link>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
              {navLinks.map((link) => {
                const active = isRouteActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 border-2 transition-all font-bold ${
                      active
                        ? "bg-brand-navy text-white border-brand-navy shadow-xs"
                        : "border-transparent text-slate-600 hover:text-brand-navy hover:border-slate-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Internal Portals Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 border-l-2 border-slate-200 pl-4 font-mono text-[11px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                Portals:
              </span>
              <Link
                href="/modder/dashboard"
                className={`px-2.5 py-1 border transition-all font-bold flex items-center gap-1.5 ${
                  isRouteActive("/modder")
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
                }`}
                title="Modder Studio Workbench"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Workbench</span>
              </Link>
              <Link
                href="/admin"
                className={`px-2.5 py-1 border transition-all font-bold flex items-center gap-1.5 ${
                  isRouteActive("/admin")
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
                }`}
                title="Admin Escrow Vault"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Escrow Vault</span>
              </Link>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider">
            {/* Cart Button */}
            <Link
              href="/cart"
              className={`px-3 py-1.5 border-2 transition-all flex items-center gap-2 ${
                isRouteActive("/cart")
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-slate-900 bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>🛒 Cart</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono font-black ${
                  isRouteActive("/cart")
                    ? "bg-white text-brand-navy"
                    : "bg-brand-navy text-white"
                }`}
              >
                2
              </span>
            </Link>

            {/* Login Button */}
            <Link
              href="/login"
              className={`px-3 py-1.5 border-2 transition-all ${
                isRouteActive("/login")
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              Log in
            </Link>

            {/* Sign Up Button */}
            <Link
              href="/register"
              className={`px-3.5 py-1.5 border-2 transition-all shadow-xs ${
                isRouteActive("/register")
                  ? "bg-brand-terracotta text-white border-brand-terracotta"
                  : "bg-brand-navy text-white border-brand-navy hover:bg-[#122754]"
              }`}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
