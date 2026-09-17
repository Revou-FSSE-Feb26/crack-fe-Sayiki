"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface ServiceOption {
  id: string;
  optionName: string;
  optionType: string;
  extraPrice: number;
}

interface ServiceDetail {
  id: string;
  modderId: string;
  title: string;
  description: string;
  basePrice: number;
  category: string;
  modder?: {
    id: string;
    name: string;
    email: string;
    locationCity: string;
    avgRating: number;
  };
  options?: ServiceOption[];
}

const getCategoryFallbackImage = (category?: string) => {
  switch (category) {
    case "SWITCH_MODS":
      return "/images/lubing-swtiches.webp";
    case "STABILIZER_MODS":
      return "/images/stabs.webp";
    case "CASE_AND_ACOUSTIC":
      return "/images/foam.jpg";
    case "CUSTOMIZATION_AESTHETICS":
    default:
      return "/images/repair-kb.png";
  }
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking options state
  const [switchType, setSwitchType] = useState("linear");
  const [unitCount, setUnitCount] = useState(70);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    async function loadService() {
      if (!serviceId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await api.listings.getById(serviceId);
        if (data) {
          setService(data);
          // Default select the first option if available
          if (data.options && data.options.length > 0) {
            setSelectedOptionIds([data.options[0].id]);
          }
        } else {
          setError("Service not found in database.");
        }
      } catch (err: any) {
        console.error("Failed to load service detail:", err);
        setError("Could not load service details from backend.");
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [serviceId]);

  const toggleOption = (id: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    if (!service) return 0;
    const isPerSwitch = service.category === "SWITCH_MODS";
    let base = isPerSwitch ? service.basePrice * unitCount : service.basePrice;

    // Add selected option extra prices
    if (service.options) {
      service.options.forEach((opt) => {
        if (selectedOptionIds.includes(opt.id)) {
          base += isPerSwitch ? opt.extraPrice * unitCount : opt.extraPrice;
        }
      });
    }
    return base;
  };

  const handleAddToCart = () => {
    if (!service) return;
    setIsAddingToCart(true);

    const selectedOptionsList = (service.options || [])
      .filter((opt) => selectedOptionIds.includes(opt.id))
      .map((opt) => opt.optionName);

    const optionSummary = selectedOptionsList.length > 0
      ? ` + ${selectedOptionsList.join(", ")}`
      : "";

    const cartItem = {
      id: Date.now(),
      type: "service",
      title: `${service.title}${optionSummary}`,
      variation: service.category === "SWITCH_MODS" ? `${unitCount}x Switches (${switchType})` : "Standard Keyboard Service",
      provider: `@${service.modder?.name || "VerifiedModder"}`,
      price: calculateTotal(),
      quantity: 1,
      image: getCategoryFallbackImage(service.category),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("switchlab_cart") || "[]");
      const updated = Array.isArray(existing) ? [...existing, cartItem] : [cartItem];
      localStorage.setItem("switchlab_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cart_updated"));
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      router.push("/cart");
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full">
          <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
          <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
            Loading Service Specification...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-8">
        <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center max-w-md w-full">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-brand-textMain mb-2">Service Not Found</h2>
          <p className="text-xs font-mono text-brand-textMuted uppercase mb-6">
            {error || "The requested service does not exist in the database."}
          </p>
          <Link href="/services">
            <Button variant="primary" isLoading={false}>
              ← Back to Services Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSwitchMods = service.category === "SWITCH_MODS";

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Breadcrumbs */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-xs font-mono text-brand-textMuted flex items-center gap-2 uppercase">
            <Link href="/" className="hover:text-brand-navy font-bold">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-brand-navy font-bold">Services</Link>
            <span>/</span>
            <span className="text-brand-textMain font-bold">@{service.modder?.name || "Modder"}</span>
            <span>/</span>
            <span className="text-brand-navy font-extrabold">{service.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Visual Card */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <div className="h-80 bg-brand-lightBg overflow-hidden border-2 border-slate-800 mb-6">
                <img
                  src={getCategoryFallbackImage(service.category)}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy">
                  [ {service.category.replace(/_/g, " ")} ]
                </span>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-yellow-500 font-bold">★</span>
                  <span className="font-bold text-slate-900">{service.modder?.avgRating || 4.9}</span>
                  <span className="text-brand-textMuted">(Verified Rating)</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-brand-textMain mb-3">
                {service.title}
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Modder Profile Card */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                Assigned Verified Modder
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-navy border-2 border-slate-900 flex items-center justify-center text-white font-mono font-black text-xl">
                    {service.modder?.name?.charAt(0) || "M"}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-brand-textMain">
                      @{service.modder?.name || "Modder"}
                    </h4>
                    <p className="text-xs font-mono text-brand-textMuted">
                      📍 Location: {service.modder?.locationCity || "Indonesia"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-green-50 border border-green-600 text-green-700">
                      ✓ KTP Verified Studio
                    </span>
                  </div>
                </div>
                <Link href="/modders">
                  <Button variant="secondary" isLoading={false} className="text-xs">
                    View Modder Studio
                  </Button>
                </Link>
              </div>
            </div>

            {/* Escrow Workflow Explanation */}
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-4 pb-2 border-b-2 border-slate-900">
                SwitchLab Escrow Protection Protocol
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 border-2 border-slate-300 bg-brand-lightBg">
                  <span className="font-bold block text-brand-navy mb-1">01. VAULT LOCK</span>
                  Funds held safely in SwitchLab escrow account.
                </div>
                <div className="p-3 border-2 border-slate-300 bg-brand-lightBg">
                  <span className="font-bold block text-brand-navy mb-1">02. SEND PARTS</span>
                  Ship your switches or keyboard to modder studio.
                </div>
                <div className="p-3 border-2 border-slate-300 bg-brand-lightBg">
                  <span className="font-bold block text-brand-navy mb-1">03. SOUND TEST</span>
                  Modder uploads audio clip of completed mod.
                </div>
                <div className="p-3 border-2 border-slate-300 bg-brand-lightBg">
                  <span className="font-bold block text-brand-navy mb-1">04. RELEASE</span>
                  Confirm feel & sound to release funds.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 cols) - Interactive Booking / Cart Panel */}
          <div className="lg:col-span-5">
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6 sticky top-6 shadow-md">
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-amber-600 bg-amber-50 text-amber-800 mb-2">
                [ ESCROW BOOKING CONFIGURATOR ]
              </span>
              <h2 className="text-xl font-black text-brand-textMain mb-1">
                Configure Order
              </h2>
              <p className="text-xs font-mono text-brand-textMuted uppercase mb-6">
                Base Price: Rp {service.basePrice.toLocaleString()} {isSwitchMods ? "/ switch" : "/ board"}
              </p>

              {/* 1. Switch Type (if switch mods) */}
              {isSwitchMods && (
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <label className="block text-xs font-mono font-bold uppercase text-brand-textMain mb-2">
                    1. Switch Variety
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["linear", "tactile", "clicky"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSwitchType(type)}
                        className={`p-2 font-mono text-xs font-bold uppercase border-2 transition-all ${
                          switchType === type
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-white text-slate-800 border-slate-300 hover:border-slate-800"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Quantity / Switch Count */}
              {isSwitchMods && (
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <label className="block text-xs font-mono font-bold uppercase text-brand-textMain mb-2">
                    2. Switch Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setUnitCount(Math.max(10, unitCount - 10))}
                      className="w-9 h-9 bg-brand-lightBg border-2 border-slate-900 font-mono font-black text-sm flex items-center justify-center hover:bg-brand-navy hover:text-white"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xl px-4">{unitCount}</span>
                    <button
                      type="button"
                      onClick={() => setUnitCount(unitCount + 10)}
                      className="w-9 h-9 bg-brand-lightBg border-2 border-slate-900 font-mono font-black text-sm flex items-center justify-center hover:bg-brand-navy hover:text-white"
                    >
                      +
                    </button>
                    <span className="text-xs font-mono text-brand-textMuted ml-auto">
                      Subtotal: Rp {(service.basePrice * unitCount).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Real Database Options */}
              {service.options && service.options.length > 0 && (
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <label className="block text-xs font-mono font-bold uppercase text-brand-textMain mb-3">
                    {isSwitchMods ? "3" : "1"}. Available Add-Ons & Materials
                  </label>
                  <div className="space-y-2">
                    {service.options.map((opt) => {
                      const checked = selectedOptionIds.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-3 border-2 cursor-pointer transition-all ${
                            checked
                              ? "bg-blue-50 border-brand-navy text-brand-navy"
                              : "bg-white border-slate-300 text-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOption(opt.id)}
                              className="w-4 h-4 text-brand-navy rounded border-slate-400"
                            />
                            <span className="font-mono text-xs font-bold">{opt.optionName}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              [{opt.optionType.replace(/_/g, " ")}]
                            </span>
                          </div>
                          <span className="font-mono text-xs font-extrabold">
                            +{opt.extraPrice === 0 ? "Free" : `Rp ${opt.extraPrice.toLocaleString()}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Estimated Total & Checkout */}
              <div>
                <div className="bg-brand-lightBg border-2 border-slate-900 p-4 mb-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-brand-textMuted uppercase">Service Fee:</span>
                    <span className="font-bold text-slate-800">
                      Rp {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-textMuted uppercase">Escrow Protection:</span>
                    <span className="font-bold text-emerald-700">INCLUDED (0%)</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base">
                    <span className="font-extrabold uppercase">Total:</span>
                    <span className="font-black text-brand-navy">
                      Rp {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  isLoading={isAddingToCart}
                  onClick={handleAddToCart}
                  className="w-full text-xs py-3.5"
                >
                  Book Service (Escrow Checkout) →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}