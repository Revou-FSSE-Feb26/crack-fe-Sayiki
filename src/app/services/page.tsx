"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface ServiceOption {
  id: string;
  optionName: string;
  optionType: string;
  extraPrice: number;
}

interface ServiceModder {
  id: string;
  name: string;
  email: string;
  locationCity: string;
  avgRating: number;
}

interface ServiceListing {
  id: string;
  modderId: string;
  title: string;
  description: string;
  basePrice: number;
  category: "SWITCH_MODS" | "STABILIZER_MODS" | "CASE_AND_ACOUSTIC" | "CUSTOMIZATION_AESTHETICS" | string;
  imageUrl?: string;
  modder?: ServiceModder;
  options?: ServiceOption[];
}

const getCategoryFallbackImage = (category: string) => {
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

const getCategoryTurnaround = (category: string) => {
  switch (category) {
    case "SWITCH_MODS":
      return "2-3 Days";
    case "STABILIZER_MODS":
      return "1-2 Days";
    case "CASE_AND_ACOUSTIC":
      return "1 Day";
    default:
      return "2-4 Days";
  }
};

const formatCategoryBadge = (category: string) => {
  return category.replace(/_/g, " ");
};

export default function ServicesCatalogPage() {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [turnaround, setTurnaround] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [minRating, setMinRating] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {}

    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get("search") || urlParams.get("q");
        if (q) setSearchQuery(q);
        const cat = urlParams.get("category");
        if (cat) setActiveCategory(cat);
      }
    } catch (e) {}

    async function loadServices() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.listings.getAll();
        setServices(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Failed to load services from backend:", err);
        setError("Unable to connect to SwitchLab backend service catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  // Collect available cities from database modders
  const availableCities = Array.from(
    new Set(
      services
        .map((s) => s.modder?.locationCity)
        .filter((c): c is string => Boolean(c))
    )
  );

  const resetAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSelectedCity("all");
    setPriceRange("all");
    setTurnaround("all");
    setSortBy("recommended");
    setMinRating(0);
  };

  const activeFiltersCount =
    (activeCategory !== "all" ? 1 : 0) +
    (selectedCity !== "all" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (turnaround !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (sortBy !== "recommended" ? 1 : 0);

  const filteredServices = services
    .filter((service) => {
      const matchesCategory =
        activeCategory === "all" ||
        service.category === activeCategory ||
        (activeCategory === "SWITCH_MODS" && service.category === "SWITCH_MODS") ||
        (activeCategory === "STABILIZER_MODS" && service.category === "STABILIZER_MODS") ||
        (activeCategory === "CASE_AND_ACOUSTIC" && service.category === "CASE_AND_ACOUSTIC") ||
        (activeCategory === "CUSTOMIZATION_AESTHETICS" && service.category === "CUSTOMIZATION_AESTHETICS");

      const city = (service.modder?.locationCity || "").toLowerCase();
      const matchesCity = selectedCity === "all" || city.includes(selectedCity.toLowerCase());

      const turnaroundStr = getCategoryTurnaround(service.category);
      const isFast = turnaroundStr.includes("1 Day") || turnaroundStr.includes("1-2");
      const matchesTurnaround =
        turnaround === "all" ||
        (turnaround === "fast" && isFast) ||
        (turnaround === "standard" && !isFast);

      const price = service.basePrice;
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "under25k" && price < 25000) ||
        (priceRange === "25k-100k" && price >= 25000 && price <= 100000) ||
        (priceRange === "above100k" && price > 100000);

      const rating = service.modder?.avgRating || 4.9;
      const matchesRating = minRating === 0 || rating >= minRating;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.title.toLowerCase().includes(q) ||
        (service.description && service.description.toLowerCase().includes(q)) ||
        (service.modder?.name && service.modder.name.toLowerCase().includes(q)) ||
        (service.category && service.category.toLowerCase().includes(q)) ||
        (service.options && service.options.some((opt) => opt.optionName.toLowerCase().includes(q)));

      return (
        matchesCategory &&
        matchesCity &&
        matchesTurnaround &&
        matchesPrice &&
        matchesRating &&
        matchesSearch
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.basePrice - b.basePrice;
      if (sortBy === "price_desc") return b.basePrice - a.basePrice;
      if (sortBy === "rating_desc") return (b.modder?.avgRating || 0) - (a.modder?.avgRating || 0);
      if (sortBy === "name_asc") return a.title.localeCompare(b.title);
      return 0; // default / recommended
    });

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ ESCROW PROTECTED SERVICES ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Keyboard Modding Services
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Live Database Catalog • Verified Modders • Escrow Payment Protection
              </p>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Services</div>
                <div className="text-xl font-mono font-bold text-brand-navy">{services.length} Listed</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Modder Network</div>
                <div className="text-xl font-mono font-bold text-brand-navy">
                  {new Set(services.map((s) => s.modderId)).size} Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modder Quick Callout Banner */}
        {currentUser && (currentUser.role === "MODDER" || currentUser.role === "ADMIN") && (
          <div className="bg-amber-50 border-2 border-slate-900 mb-8 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛠️</span>
              <div>
                <span className="font-mono text-xs font-bold uppercase text-amber-950 block">
                  Modder Studio Portal • Offer Your Keyboard Tuning
                </span>
                <p className="text-[11px] font-mono text-amber-800">
                  You are signed in as verified modder @{currentUser.name}. Publish a new tuning service to appear in this catalog.
                </p>
              </div>
            </div>
            <Link href="/modder/create-listing">
              <Button variant="primary" className="text-xs uppercase font-bold shrink-0">
                ➕ Create Service Listing →
              </Button>
            </Link>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="space-y-4 mb-8">
          {/* Service Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search services (e.g. Switch Lubing, Stabilizer Tuning, Holee Mod, Foam, Modder name)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 bg-white border-2 border-slate-900 font-mono text-xs md:text-sm text-brand-textMain placeholder:text-brand-textMuted focus:outline-none focus:border-brand-navy shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-400 font-mono text-xs font-bold text-slate-700 cursor-pointer"
              >
                Clear ✕
              </button>
            )}
          </div>

          {/* Primary Category Tabs */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex flex-wrap bg-brand-sidebar border-2 border-slate-900 p-1">
                {[
                  { key: "all", label: "All Services" },
                  { key: "SWITCH_MODS", label: "Switch Mods" },
                  { key: "STABILIZER_MODS", label: "Stabilizers" },
                  { key: "CASE_AND_ACOUSTIC", label: "Acoustics & Foam" },
                  { key: "CUSTOMIZATION_AESTHETICS", label: "Custom / Aesthetics" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                      activeCategory === tab.key
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "text-brand-textMuted border-transparent hover:text-brand-textMain"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Reset Filters Button if active */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border-2 border-red-500 font-mono text-xs font-bold text-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>✕ Clear All Filters</span>
                  <span className="bg-red-600 text-white px-1.5 py-0.2 text-[10px] rounded-full">
                    {activeFiltersCount}
                  </span>
                </button>
              )}
            </div>

            {/* Secondary Granular Filters (Price, Turnaround, Location, Sorting) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-brand-sidebar border-2 border-slate-900">
              {/* Price Filter */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-textMuted mb-1">
                  💰 Price Range:
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-white border border-slate-800 px-2.5 py-1.5 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase"
                >
                  <option value="all">All Prices</option>
                  <option value="under25k">&lt; Rp 25.000 / unit</option>
                  <option value="25k-100k">Rp 25.000 - Rp 100.000</option>
                  <option value="above100k">&gt; Rp 100.000 / board</option>
                </select>
              </div>

              {/* Turnaround Time */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-textMuted mb-1">
                  ⏳ Turnaround:
                </label>
                <select
                  value={turnaround}
                  onChange={(e) => setTurnaround(e.target.value)}
                  className="w-full bg-white border border-slate-800 px-2.5 py-1.5 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase"
                >
                  <option value="all">All Durations</option>
                  <option value="fast">⚡ Fast (1-2 Days)</option>
                  <option value="standard">Standard (2-4 Days)</option>
                </select>
              </div>

              {/* Location Selector */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-textMuted mb-1">
                  📍 Modder City:
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white border border-slate-800 px-2.5 py-1.5 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase"
                >
                  <option value="all">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city.toLowerCase()}>
                      {city}
                    </option>
                  ))}
                  {availableCities.length === 0 && (
                    <>
                      <option value="jakarta">Jakarta</option>
                      <option value="bandung">Bandung</option>
                      <option value="depok">Depok</option>
                      <option value="surabaya">Surabaya</option>
                    </>
                  )}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-textMuted mb-1">
                  🔄 Sort Catalog:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-slate-800 px-2.5 py-1.5 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase"
                >
                  <option value="recommended">Featured / Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Modder Rating</option>
                  <option value="name_asc">Service Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Link Banner to Marketplace */}
        <div className="mb-6 p-3 bg-blue-50 border-2 border-brand-navy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-base">📦</span>
            <span className="text-brand-navy font-bold">
              Looking for raw hardware, custom switches, or lube kits?
            </span>
            <span className="text-brand-textMuted hidden md:inline">
              Shop standalone parts without booking a modder.
            </span>
          </div>
          <Link
            href="/search"
            className="text-brand-navy font-bold underline hover:text-brand-terracotta shrink-0"
          >
            Visit Hardware &amp; Parts Marketplace →
          </Link>
        </div>

        {/* Status / Loading / Error Indicator */}
        {loading && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
            <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
              Fetching Services from Database...
            </h2>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-600 p-6 my-8 text-center font-mono text-xs text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Results Count & Empty State */}
        {!loading && (
          <div className="mb-4 text-xs font-mono text-brand-textMuted uppercase tracking-wider flex items-center justify-between">
            <span>
              Showing {filteredServices.length} live database service{filteredServices.length === 1 ? "" : "s"}
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-brand-navy font-bold">
                ({activeFiltersCount} filter{activeFiltersCount === 1 ? "" : "s"} applied)
              </span>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <div className="bg-white border-2 border-slate-900 p-12 text-center my-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-black text-brand-textMain uppercase mb-1">
              No Services Match Your Filters
            </h3>
            <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mb-5">
              Try adjusting your price range, turnaround time, or search keywords.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-brand-navy text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Reset All Filters ✕
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between"
              >
                {/* Card Top */}
                <div>
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy">
                      [ {formatCategoryBadge(service.category)} ]
                    </span>
                    <span className="text-xs font-mono text-brand-textMuted">
                      ⏳ {getCategoryTurnaround(service.category)}
                    </span>
                  </div>

                  <div className="px-4 pb-2">
                    <div className="h-40 bg-brand-lightBg overflow-hidden border border-slate-300">
                      <img
                        src={service.imageUrl || getCategoryFallbackImage(service.category)}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="p-4 pt-2">
                    <h3 className="font-bold text-lg text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-brand-textMuted mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Modder Meta */}
                    <div className="flex justify-between items-center text-xs font-mono border-t border-slate-200 pt-2 mb-3">
                      <span className="font-semibold text-brand-navy">
                        @{service.modder?.name || "VerifiedModder"}
                      </span>
                      <span className="text-brand-textMuted">
                        📍 {service.modder?.locationCity || "Indonesia"}
                      </span>
                    </div>

                    {/* Rating & Price */}
                    <div className="flex justify-between items-baseline mb-4">
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold text-slate-800">
                          {service.modder?.avgRating || 4.9}
                        </span>
                        <span className="text-brand-textMuted">
                          ({service.options?.length || 2} options)
                        </span>
                      </div>
                      <div className="text-lg font-mono font-extrabold text-brand-navy">
                        Rp {service.basePrice.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-brand-textMuted">
                          {service.category === "SWITCH_MODS" ? "/ switch" : "/ board"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 pt-0">
                  <Link href={`/service/${service.id}`} className="block w-full">
                    <Button variant="primary" isLoading={false} className="w-full">
                      Configure & Book (Escrow) →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <p className="text-brand-textMuted font-mono text-base mb-4 uppercase">
              {searchQuery
                ? `No services found matching "${searchQuery}".`
                : "No services found matching your selected filters."}
            </p>
            <Button
              variant="secondary"
              isLoading={false}
              onClick={() => {
                setActiveCategory("all");
                setSelectedCity("all");
                setSearchQuery("");
              }}
              className="inline-block w-auto"
            >
              Reset Filters & Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
