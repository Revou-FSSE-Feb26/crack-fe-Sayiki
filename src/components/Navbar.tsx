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
    <nav className="bg-brand-sidebar border-b-2 border-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="inline-block px-3.5 py-1.5 bg-brand-navy text-white font-black text-xl tracking-tight border-2 border-brand-navy hover:opacity-95 transition-all"
            >
              SwitchLab
            </Link>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
              {navLinks.map((link) => {
                const active = isRouteActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 border-2 transition-all font-bold ${
                      active
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "border-transparent text-slate-600 hover:text-brand-navy hover:border-slate-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Role Portals (Modder & Admin Quick Switch) */}
            <div className="hidden lg:flex items-center gap-1.5 border-l-2 border-slate-300 pl-3 font-mono text-[11px]">
              <Link
                href="/modder/dashboard"
                className={`px-2.5 py-1 border-2 transition-all font-bold flex items-center gap-1 ${
                  isRouteActive("/modder")
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "border-slate-800 bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span>🛠️ Workbench</span>
              </Link>
              <Link
                href="/admin"
                className={`px-2.5 py-1 border-2 transition-all font-bold flex items-center gap-1 ${
                  isRouteActive("/admin")
                    ? "bg-red-700 text-white border-red-700"
                    : "border-red-600 bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                <span>🛡️ Admin Vault</span>
              </Link>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-wider">
            {/* Cart Button */}
            <Link
              href="/cart"
              className={`px-3 py-1.5 border-2 transition-colors flex items-center gap-1.5 ${
                isRouteActive("/cart")
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-slate-900 bg-white text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>🛒 Cart</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] ${
                  isRouteActive("/cart")
                    ? "bg-white text-brand-navy font-black"
                    : "bg-brand-navy text-white"
                }`}
              >
                2
              </span>
            </Link>

            {/* Login Button */}
            <Link
              href="/login"
              className={`px-3.5 py-1.5 border-2 transition-colors ${
                isRouteActive("/login")
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
              }`}
            >
              Log in
            </Link>

            {/* Sign Up Button */}
            <Link
              href="/register"
              className={`px-3.5 py-1.5 border-2 transition-all ${
                isRouteActive("/register")
                  ? "bg-brand-terracotta text-white border-brand-terracotta"
                  : "bg-brand-navy text-white border-brand-navy hover:bg-[#132856]"
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
