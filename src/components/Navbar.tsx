"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, syncAuthCookies } from "@/lib/api";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AppNotification,
} from "@/lib/notifications";
import { EditProfileModal } from "@/components/EditProfileModal";

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
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadNotifs = (currentUser: UserProfile | null) => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const userNotifs = getUserNotifications(currentUser.role, currentUser.id);
    setNotifications(userNotifs);
  };

  useEffect(() => {
    setMounted(true);
    let currentUser: UserProfile | null = null;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    }

    syncAuthCookies();
    loadNotifs(currentUser);

    const updateCart = () => {
      try {
        const storedCart = localStorage.getItem("switchlab_cart");
        if (storedCart) {
          const items = JSON.parse(storedCart);
          if (Array.isArray(items)) {
            const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
            setCartCount(count);
            return;
          }
        }
        setCartCount(0);
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCart();

    // Listen for storage changes across tabs or login/logout/cart events
    const handleAuthChange = () => {
      syncAuthCookies();
      const updated = localStorage.getItem("user");
      const parsed = updated ? JSON.parse(updated) : null;
      setUser(parsed);
      loadNotifs(parsed);
    };

    const handleNotifsChange = () => {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : null;
      loadNotifs(parsed);
    };

    // Close notifications on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("storage", updateCart);
    window.addEventListener("cart_updated", updateCart);
    window.addEventListener("notifications_updated", handleNotifsChange);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("cart_updated", updateCart);
      window.removeEventListener("notifications_updated", handleNotifsChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setShowNotifs(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllNotificationsAsRead(user.role);
    }
  };

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
          {/* Right Action Group */}
          <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider">
            {/* Cart Button: ONLY visible when logged in */}
            {mounted && user && (
              <Link
                href="/cart"
                className={`h-9 px-3 border-2 transition-colors inline-flex items-center justify-center gap-1.5 box-border ${
                  isRouteActive("/cart")
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "border-slate-900 bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span className="text-xs leading-none">🛒</span>
                <span className="leading-none">Cart</span>
                {cartCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none ${
                      isRouteActive("/cart")
                        ? "bg-white text-brand-navy"
                        : "bg-brand-navy text-white"
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell & Dropdown */}
            {mounted && user && (
              <div className="relative inline-flex items-center" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifs(!showNotifs)}
                  className={`h-9 px-3 border-2 transition-all inline-flex items-center justify-center gap-1.5 box-border ${
                    showNotifs || unreadCount > 0
                      ? "border-brand-navy bg-blue-50 text-brand-navy"
                      : "border-slate-900 bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                  title="Live Order & Escrow Notifications"
                >
                  <span className="text-xs leading-none">🔔</span>
                  <span className="hidden sm:inline text-xs leading-none">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-black leading-none animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-brand-sidebar border-2 border-slate-900 shadow-2xl z-50 font-mono text-xs">
                    <div className="p-3 bg-brand-lightBg border-b-2 border-slate-900 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase text-brand-textMain">
                          🔔 Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-bold border border-red-300">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-brand-navy hover:underline font-bold uppercase"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-200">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          <div className="text-2xl mb-1">📭</div>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 cursor-pointer hover:bg-white transition-colors ${
                              !n.read ? "bg-amber-50/60 border-l-4 border-l-amber-500" : "bg-brand-sidebar"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-[11px] text-brand-textMain">
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2">
                                {n.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {n.message}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2 text-[9px] text-brand-navy font-bold uppercase">
                              <span>➔ View details</span>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 bg-slate-100 border-t border-slate-300 text-center text-[10px] text-slate-500">
                      Logged in as {user.role}: @{user.name}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons: Toggle between Logged In Profile and Guest Log In / Sign Up */}
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(true)}
                  title="Click to Edit Profile & Studio Location"
                  className="h-9 px-3 bg-slate-100 border-2 border-slate-900 text-slate-800 hover:bg-slate-200 hover:border-brand-navy text-xs font-mono font-bold truncate max-w-[150px] inline-flex items-center gap-1.5 box-border transition-colors cursor-pointer"
                >
                  <span className="text-xs leading-none">👤</span>
                  <span className="truncate leading-none">{user.name}</span>
                  <span className="text-[10px] leading-none text-slate-500 font-mono" title="Edit">✏️</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="h-9 px-3 border-2 border-slate-900 bg-white text-slate-900 hover:bg-red-50 hover:border-red-600 hover:text-red-700 transition-colors text-xs font-mono font-bold uppercase inline-flex items-center justify-center box-border"
                >
                  <span className="leading-none">Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`h-9 px-3.5 border-2 transition-colors inline-flex items-center justify-center box-border ${
                    isRouteActive("/login")
                      ? "bg-brand-navy text-white border-brand-navy"
                      : "border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  className={`h-9 px-3.5 border-2 transition-all inline-flex items-center justify-center box-border ${
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onProfileUpdated={(updated) => {
          setUser(updated);
        }}
      />
    </nav>
  );
}
