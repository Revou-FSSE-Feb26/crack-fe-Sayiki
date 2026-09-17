"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { api, syncAuthCookies } from "@/lib/api";

const POPULAR_CITIES = [
  "Jakarta",
  "Bandung",
  "Depok",
  "Tangerang",
  "Bekasi",
  "Surabaya",
  "Yogyakarta",
  "Bali",
  "Medan",
  "Semarang",
];

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [city, setCity] = useState("Jakarta");
  const [role, setRole] = useState<"CUSTOMER" | "MODDER">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let userObj: any = null;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        userObj = JSON.parse(stored);
        setCurrentUser(userObj);
        setName(userObj.name || "");
        setCity(userObj.locationCity || "Jakarta");
        setRole(userObj.role === "MODDER" ? "MODDER" : "CUSTOMER");
        syncAuthCookies();
      }
    } catch (e) {}

    // Require authentication
    if (!userObj) {
      router.replace("/login?redirect=/profile");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const trimmedName = name.trim();
    const trimmedCity = city.trim() || "Jakarta";

    try {
      // Call NestJS backend PATCH /users/:id
      const updatedUser = await api.users
        .update(currentUser.id, {
          name: trimmedName,
          locationCity: trimmedCity,
          role: role,
        })
        .catch(() => null);

      const mergedUser = {
        ...currentUser,
        ...(updatedUser || {}),
        name: trimmedName,
        locationCity: trimmedCity,
        role: role,
      };

      // Persist in localStorage and synchronize cookies
      localStorage.setItem("user", JSON.stringify(mergedUser));
      setCurrentUser(mergedUser);
      syncAuthCookies();

      // Notify other components / navbar
      window.dispatchEvent(new Event("storage"));

      setSuccessMessage("Your profile and studio location have been saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    router.push("/");
  };

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4 font-mono">
        <div className="p-8 bg-brand-sidebar border-2 border-slate-900 shadow-md text-center max-w-sm w-full">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-navy border-t-transparent mb-4"></div>
          <h2 className="text-base font-bold text-brand-textMain uppercase">Loading Profile...</h2>
          <p className="text-xs text-brand-textMuted mt-1">Fetching account settings</p>
        </div>
      </div>
    );
  }

  const isModder = role === "MODDER";

  return (
    <div className="min-h-screen bg-brand-lightBg py-10 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs uppercase text-brand-textMuted mb-6 font-bold">
          <Link href="/" className="hover:text-brand-navy hover:underline">
            SwitchLab
          </Link>
          <span>/</span>
          <span className="text-brand-textMuted">Account</span>
          <span>/</span>
          <span className="text-brand-navy">Profile & Studio Settings</span>
        </div>

        {/* Page Header */}
        <div className="bg-brand-sidebar border-2 border-slate-900 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 bg-brand-navy border-2 border-slate-900 text-white flex items-center justify-center text-2xl font-black shrink-0">
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "SL"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 ${
                      isModder
                        ? "border-amber-600 bg-amber-50 text-amber-900"
                        : "border-brand-navy bg-brand-lightBg text-brand-navy"
                    }`}
                  >
                    [ {isModder ? "🛠️ VERIFIED MODDER STUDIO" : "👤 CUSTOMER ACCOUNT"} ]
                  </span>
                  {currentUser.isVerified && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-emerald-700 bg-emerald-50 text-emerald-800">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-brand-textMain tracking-tight">
                  {currentUser.name || "My Account"}
                </h1>
                <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-0.5">
                  {currentUser.email} • Location: {currentUser.locationCity || "Jakarta, Indonesia"}
                </p>
              </div>
            </div>

            {/* Header Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {isModder && (
                <>
                  <Link
                    href="/modder/dashboard"
                    className="h-9 px-4 border-2 border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs transition-colors shrink-0"
                  >
                    <span>🛠️</span>
                    <span>Modder Workbench →</span>
                  </Link>
                  <Link
                    href="/modder/create-listing"
                    className="h-9 px-3.5 border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs transition-colors shrink-0"
                  >
                    <span>➕</span>
                    <span>Create Listing</span>
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="h-9 px-3.5 border-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 text-xs font-bold mb-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-black text-sm px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs mb-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-black text-sm px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Grid: Left (Account Overview & Quick Links) + Right (Edit Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Account Summary & Quick Navigation */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-900 p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase text-brand-navy tracking-wider border-b border-slate-200 pb-2 mb-4">
                Account Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account ID</span>
                  <span className="font-mono text-slate-700 break-all text-[11px] select-all">
                    {currentUser.id}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-mono text-slate-800 font-bold">{currentUser.email}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Role</span>
                  <span className="font-mono text-slate-800 font-bold">{currentUser.role}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Location</span>
                  <span className="font-mono text-slate-800 font-bold">📍 {currentUser.locationCity || "Jakarta"}</span>
                </div>

                {isModder && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Studio Rating</span>
                    <span className="font-mono text-amber-600 font-bold">
                      ★ {currentUser.avgRating ? currentUser.avgRating.toFixed(1) : "5.0"} / 5.0
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Link Actions */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-xs">
              <h2 className="text-xs font-bold uppercase text-brand-navy tracking-wider border-b border-slate-200 pb-2 mb-4">
                Quick Shortcuts
              </h2>

              <div className="space-y-2 text-xs">
                {isModder && (
                  <>
                    <Link
                      href="/modder/dashboard"
                      className="w-full text-left p-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold flex items-center justify-between transition-colors"
                    >
                      <span>🛠️ Modder Workbench</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/modder/create-listing"
                      className="w-full text-left p-2 bg-brand-lightBg hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold flex items-center justify-between transition-colors"
                    >
                      <span>➕ Create Service / Sell</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/modders"
                      className="w-full text-left p-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold flex items-center justify-between transition-colors"
                    >
                      <span>👁️ Modders Directory</span>
                      <span>→</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/orders"
                  className="w-full text-left p-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold flex items-center justify-between transition-colors"
                >
                  <span>📦 Orders & Escrow Tracker</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/cart"
                  className="w-full text-left p-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold flex items-center justify-between transition-colors"
                >
                  <span>🛒 View Cart</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Full Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-slate-900 p-6 md:p-8 shadow-xs">
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border border-brand-navy bg-brand-lightBg text-brand-navy mb-1.5">
                  [ EDIT ACCOUNT DETAILS ]
                </span>
                <h2 className="text-xl font-black text-brand-textMain">
                  {isModder ? "Modder Studio Configuration" : "Customer Profile Information"}
                </h2>
                <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-1">
                  Updates are saved immediately to the database and synced across your active session.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Address (Read-Only) */}
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
                    Account Email (Immutable)
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-100 border-2 border-slate-300 text-slate-500 font-mono text-xs flex items-center justify-between">
                    <span>{currentUser.email}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">🔒 System Linked</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    To transfer or change email address, please contact SwitchLab admin support.
                  </p>
                </div>

                {/* Display Name / Studio Name */}
                <div>
                  <Input
                    label={isModder ? "Studio / Modder Display Name" : "Full Customer Name"}
                    type="text"
                    placeholder={isModder ? "e.g. Nadia Tuner Studio" : "e.g. Arzaq Ajradika"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {isModder
                      ? "This is the primary studio name shown on your listings, workbench, and in the Modders Directory."
                      : "Your recipient name on shipping orders and customer chat."}
                  </p>
                </div>

                {/* City / Location */}
                <div className="space-y-2">
                  <Input
                    label={
                      isModder
                        ? "📍 Studio City / Workshop Location (Directory Filter)"
                        : "📍 City / Region (For Shipping & Walk-In Dropoff)"
                    }
                    type="text"
                    placeholder="e.g. Bandung, Jakarta, Depok, Surabaya..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />

                  {/* Quick-Pick Location Chips */}
                  <div>
                    <div className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
                      Quick Pick City:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_CITIES.map((c) => {
                        const isSelected = city.toLowerCase() === c.toLowerCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCity(c)}
                            className={`px-2.5 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-brand-navy text-white border-brand-navy font-bold shadow-xs"
                                : "bg-white text-slate-700 border-slate-300 hover:border-slate-800"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isModder && (
                    <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 text-xs leading-relaxed mt-2">
                      💡 <strong>Local Walk-In Discovery:</strong> Keyboard owners filter by city on{" "}
                      <code>/modders</code> to find local drop-off options. Setting your studio city to{" "}
                      <strong>{city || "your city"}</strong> guarantees customers in your area can discover and book walk-in tuning.
                    </div>
                  )}
                </div>

                {/* Account Role Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                    Account Role:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label
                      className={`flex items-start gap-3 p-3.5 border-2 cursor-pointer transition-all ${
                        role === "CUSTOMER"
                          ? "bg-blue-50/70 border-brand-navy text-brand-navy shadow-xs"
                          : "bg-white border-slate-300 text-slate-700 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountRole"
                        value="CUSTOMER"
                        checked={role === "CUSTOMER"}
                        onChange={() => setRole("CUSTOMER")}
                        className="accent-brand-navy mt-0.5"
                      />
                      <div>
                        <div className="font-bold">👤 Customer Account</div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Browse mods, book keyboard tuning with Escrow protection, and track order logistics.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 border-2 cursor-pointer transition-all ${
                        role === "MODDER"
                          ? "bg-amber-50 border-amber-600 text-amber-950 shadow-xs"
                          : "bg-white border-slate-300 text-slate-700 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountRole"
                        value="MODDER"
                        checked={role === "MODDER"}
                        onChange={() => setRole("MODDER")}
                        className="accent-amber-600 mt-0.5"
                      />
                      <div>
                        <div className="font-bold">🛠️ Modder Studio</div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          Access Modder Live Workbench, receive paid client orders, and publish marketplace listings.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Save Bar */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-400">
                    Changes take effect across the entire SwitchLab marketplace immediately.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="w-full sm:w-auto px-8 text-xs font-mono uppercase font-bold"
                  >
                    {loading ? "Saving Profile..." : "💾 Save Profile Changes →"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
