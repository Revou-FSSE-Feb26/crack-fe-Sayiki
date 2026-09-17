"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { api } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

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

export function EditProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "MODDER">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          setName(u.name || "");
          setCity(u.locationCity || "Jakarta");
          setRole(u.role === "MODDER" ? "MODDER" : "CUSTOMER");
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setError(null);
    setLoading(true);

    const trimmedName = name.trim();
    const trimmedCity = city.trim() || "Jakarta";

    try {
      // Call backend PATCH /users/:id
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

      // Persist to localStorage
      localStorage.setItem("user", JSON.stringify(mergedUser));
      window.dispatchEvent(new Event("storage"));

      setSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(mergedUser);
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-brand-sidebar border-2 border-slate-900 shadow-2xl p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 font-mono font-bold text-lg px-2 py-1 border border-transparent hover:border-slate-400 transition-all"
          title="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
            [ PROFILE & LOCATION SETTINGS ]
          </span>
          <h2 className="text-2xl font-black text-brand-textMain tracking-tight">
            {role === "MODDER" ? "Edit Modder Studio Profile" : "Edit User Profile"}
          </h2>
          <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-1">
            {role === "MODDER"
              ? "Update your studio workbench location and directory listing name"
              : "Update your name and default city for shipping & delivery"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono mb-4">
            ⚠ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-mono font-bold mb-4 flex items-center gap-2">
            <span>✓</span> Profile & Studio Location saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Read-Only) */}
          <div>
            <label className="block text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1">
              Account Email (Read-Only)
            </label>
            <div className="w-full px-3 py-2 bg-slate-100 border-2 border-slate-300 text-slate-500 font-mono text-xs flex items-center justify-between">
              <span>{currentUser?.email || "user@example.com"}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">🔒 Linked</span>
            </div>
          </div>

          {/* Full Name / Studio Name */}
          <div>
            <Input
              label={role === "MODDER" ? "Studio / Modder Name" : "Full Name"}
              type="text"
              placeholder="e.g. Nadia Tuner or SwitchLab Studio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* City / Studio Location */}
          <div className="space-y-2">
            <Input
              label={
                role === "MODDER"
                  ? "📍 Studio City / Workshop Location (Directory Filter)"
                  : "📍 City / Region (For Courier & Walk-In Delivery)"
              }
              type="text"
              placeholder="e.g. Bandung, Jakarta, Depok..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            {/* Quick Pick City Buttons */}
            <div>
              <div className="text-[10px] font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
                Quick Select Location:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((c) => {
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

            {role === "MODDER" && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-300 text-amber-900 text-[11px] font-mono leading-tight">
                💡 <strong>Directory Visibility:</strong> Customers browsing the Modders Directory (<code>/modders</code>) use the City sidebar filter to find local studios. Setting your studio to <em>{city || "your city"}</em> allows customers to select Walk-In studio dropoff.
              </div>
            )}
          </div>

          {/* Role Toggle */}
          <div className="pt-2">
            <label className="block text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
              Account Role:
            </label>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <label
                className={`flex items-center justify-center gap-2 p-2.5 border-2 cursor-pointer transition-all ${
                  role === "CUSTOMER"
                    ? "bg-blue-50 border-brand-navy text-brand-navy font-bold"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="modalRole"
                  value="CUSTOMER"
                  checked={role === "CUSTOMER"}
                  onChange={() => setRole("CUSTOMER")}
                  className="accent-brand-navy"
                />
                Customer
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-2.5 border-2 cursor-pointer transition-all ${
                  role === "MODDER"
                    ? "bg-amber-50 border-amber-600 text-amber-900 font-bold"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="modalRole"
                  value="MODDER"
                  checked={role === "MODDER"}
                  onChange={() => setRole("MODDER")}
                  className="accent-amber-600"
                />
                🛠️ Modder
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              isLoading={false}
              onClick={onClose}
              className="px-4 text-xs font-mono uppercase font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="px-6 text-xs font-mono uppercase font-bold whitespace-nowrap"
            >
              {loading ? "Saving Profile..." : "Save Profile & Location →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
