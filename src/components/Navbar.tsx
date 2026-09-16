"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MODDER" | "ADMIN";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    // Listen for storage changes across tabs or login/logout events
    const handleAuthChange = () => {
      const updated = localStorage.getItem("user");
      setUser(updated ? JSON.parse(updated) : null);
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, [pathname]);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    router.push("/");
  };

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Base public links available to everyone
  const publicNavLinks = [
    { label: "Services", href: "/services" },
    { label: "Modders", href: "/modders" },
    { label: "Marketplace", href: "/search" },
  ];

  return (
    <nav className="bg-white border-b-2 border-slate-900 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="inline-block px-3.5 py-1.5 bg-brand-navy text-white font-black text-xl tracking-tight border-2 border-brand-navy hover:opacity-95 transition-all"
            >
              SwitchLab
            </Link>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
              {publicNavLinks.map((link) => {
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

              {/* Orders link only visible when logged in */}
              {mounted && user && (
                <Link
                  href="/orders"
                  className={`px-3 py-1.5 border-2 transition-all font-bold ${
                    isRouteActive("/orders")
                      ? "bg-brand-navy text-white border-brand-navy"
                      : "border-transparent text-slate-600 hover:text-brand-navy hover:border-slate-300"
                  }`}
                >
                  Orders
                </Link>
              )}
            </div>

            {/* Role-Gated Portals: ONLY visible when logged in with appropriate role */}
            {mounted && user && (
              <div className="hidden lg:flex items-center gap-2 border-l-2 border-slate-200 pl-4 font-mono text-[11px]">
                {/* Modder Studio Workbench: ONLY for MODDER or ADMIN */}
                {(user.role === "MODDER" || user.role === "ADMIN") && (
                  <Link
                    href="/modder/dashboard"
                    className={`px-2.5 py-1 border-2 transition-all font-bold flex items-center gap-1.5 ${
                      isRouteActive("/modder")
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-800 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <span>🛠️ Workbench</span>
                  </Link>
                )}

                {/* Admin Vault: ONLY for ADMIN */}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`px-2.5 py-1 border-2 transition-all font-bold flex items-center gap-1.5 ${
                      isRouteActive("/admin")
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "border-brand-navy bg-blue-50 text-brand-navy hover:bg-blue-100"
                    }`}
                  >
                    <span>🛡️ Escrow Vault</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-wider">
            {/* Cart Button: ONLY visible when logged in */}
            {mounted && user && (
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
            )}

            {/* Auth Buttons: Toggle between Logged In Profile and Guest Log In / Sign Up */}
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-mono font-bold truncate max-w-[120px]">
                  👤 {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-900 hover:bg-red-50 hover:border-red-600 hover:text-red-700 transition-colors text-xs font-mono font-bold"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
