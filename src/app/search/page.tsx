"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface MarketplaceItem {
  id: string;
  category: "switches" | "stabilizers" | "lube" | "prebuilt";
  title: string;
  description: string;
  provider: string;
  rating: number;
  price: number;
  pricing: string;
  badge: string;
  badgeColor: string;
  image: string;
  locationCity: string;
  stock: number;
  variation?: string;
}

const MARKETPLACE_HARDWARE_ITEMS: MarketplaceItem[] = [
  {
    id: "part-oilking-90",
    category: "switches",
    title: "Gateron Oil King Linears (90x Pack)",
    description: "Deep thock linear switches with black nylon housing, factory precision lubed with 55g actuation spring.",
    provider: "@RakaModder",
    rating: 4.9,
    price: 630000,
    pricing: "Rp 630.000",
    badge: "SWITCHES",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-900",
    image: "/images/switches.jpg",
    locationCity: "Bandung",
    stock: 15,
    variation: "90x Pack (Factory Lubed)",
  },
  {
    id: "part-vertex-v1",
    category: "switches",
    title: "Vertex V1 Linears (70x Hand-Lubed)",
    description: "Ultra-smooth custom linear switches hand-lubed with Krytox 205g0 + 105 spring oil for pure acoustic clarity.",
    provider: "@NadiaTuner",
    rating: 4.9,
    price: 490000,
    pricing: "Rp 490.000",
    badge: "HAND-LUBED SWITCHES",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-900",
    image: "/images/lubing-swtiches.webp",
    locationCity: "Depok",
    stock: 8,
    variation: "70x Pack (Hand-Lubed)",
  },
  {
    id: "part-cherry-hyperglide",
    category: "switches",
    title: "Cherry MX Black Hyperglide (90x Broken-in)",
    description: "Broken in over 600,000 actuations on automated machine, filmed with Deskeys 0.3mm and lubed with 205g0.",
    provider: "@RakaModder",
    rating: 5.0,
    price: 720000,
    pricing: "Rp 720.000",
    badge: "PREMIUM SWITCHES",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-900",
    image: "/images/switches.jpg",
    locationCity: "Bandung",
    stock: 6,
    variation: "90x Broken-In Pack",
  },
  {
    id: "part-staebies-v2",
    category: "stabilizers",
    title: "Staebies V2.1 Screw-in Stabilizers Set",
    description: "Zambumon Staebies with revised stems for tight keycap fit, zero wire rattle, and syringe-lubed Permatex wire.",
    provider: "@RakaModder",
    rating: 4.9,
    price: 280000,
    pricing: "Rp 280.000",
    badge: "STABILIZERS",
    badgeColor: "bg-amber-50 text-amber-950 border-amber-900",
    image: "/images/stabs.webp",
    locationCity: "Bandung",
    stock: 20,
    variation: "Full TKL Set (4x2u + 1x6.25u)",
  },
  {
    id: "part-tx-ap-stabs",
    category: "stabilizers",
    title: "TX AP Plate-Mount Stabilizer Kit (White)",
    description: "TX Almost Perfect plate mount stabilizers with tight tolerance POM housing and stainless steel balanced wire.",
    provider: "@NadiaTuner",
    rating: 4.8,
    price: 245000,
    pricing: "Rp 245.000",
    badge: "STABILIZERS",
    badgeColor: "bg-amber-50 text-amber-950 border-amber-900",
    image: "/images/stabs.webp",
    locationCity: "Depok",
    stock: 12,
    variation: "Plate-Mount Set",
  },
  {
    id: "part-durock-v2",
    category: "stabilizers",
    title: "Durock V2 PCB Screw-in Stabs (Gold Wire)",
    description: "Gold-plated steel wire with smokey nylon housing, includes Holee mod washers and anti-drop wire clips.",
    provider: "@RakaModder",
    rating: 4.8,
    price: 260000,
    pricing: "Rp 260.000",
    badge: "STABILIZERS",
    badgeColor: "bg-amber-50 text-amber-950 border-amber-900",
    image: "/images/stabs.webp",
    locationCity: "Bandung",
    stock: 18,
    variation: "Screw-in TKL Kit",
  },
  {
    id: "part-krytox-205g0",
    category: "lube",
    title: "Krytox GPL 205g0 Genuine Switch Lube (5g)",
    description: "Authentic Chemours Krytox GPL 205g0 packaged in airtight UV glass jar. Perfect for linear switches and stabilizer stems.",
    provider: "@SwitchLabOfficial",
    rating: 5.0,
    price: 95000,
    pricing: "Rp 95.000",
    badge: "LUBRICANTS",
    badgeColor: "bg-emerald-50 text-emerald-950 border-emerald-900",
    image: "/images/lubing-swtiches.webp",
    locationCity: "Jakarta",
    stock: 35,
    variation: "5g UV Glass Jar",
  },
  {
    id: "part-krytox-105",
    category: "lube",
    title: "Krytox GPL 105 Spring Oil (10ml Dropper)",
    description: "High viscosity lubricating oil for bag lubing switch springs to eliminate ping and spring resonance.",
    provider: "@SwitchLabOfficial",
    rating: 4.9,
    price: 85000,
    pricing: "Rp 85.000",
    badge: "LUBRICANTS",
    badgeColor: "bg-emerald-50 text-emerald-950 border-emerald-900",
    image: "/images/lubing-swtiches.webp",
    locationCity: "Jakarta",
    stock: 28,
    variation: "10ml Dropper Bottle",
  },
  {
    id: "part-poron-films",
    category: "lube",
    title: "Poron Switch Pads & Deskeys Film Pack (120x)",
    description: "Precision laser cut poron dampeners and compressible gasket switch films for eliminating switch wobble.",
    provider: "@SwitchLabOfficial",
    rating: 4.8,
    price: 75000,
    pricing: "Rp 75.000",
    badge: "TUNING SUPPLIES",
    badgeColor: "bg-emerald-50 text-emerald-950 border-emerald-900",
    image: "/images/foam.jpg",
    locationCity: "Jakarta",
    stock: 40,
    variation: "120x Film Sheets",
  },
  {
    id: "board-artisan-75",
    category: "prebuilt",
    title: "SwitchLab Artisan 75% Custom Mechanical Board",
    description: "Fully assembled custom board with anodized aluminum case, brass weight, hand-tuned Oil Kings, and Staebies V2.1.",
    provider: "@RakaModder",
    rating: 5.0,
    price: 2850000,
    pricing: "Rp 2.850.000",
    badge: "PRE-BUILT KEYBOARD",
    badgeColor: "bg-purple-50 text-purple-950 border-purple-900",
    image: "/images/prebuilt-kb.webp",
    locationCity: "Bandung",
    stock: 2,
    variation: "Ready to Ship (Deep Thock)",
  },
  {
    id: "board-alu-65",
    category: "prebuilt",
    title: "Tuned Aluminum 65% Hot-Swap Board",
    description: "Compact 65% gasket-mount mechanical keyboard, tape-modded with poron plate foam, tuned TX AP stabs, and PBT caps.",
    provider: "@NadiaTuner",
    rating: 4.9,
    price: 2400000,
    pricing: "Rp 2.400.000",
    badge: "PRE-BUILT KEYBOARD",
    badgeColor: "bg-purple-50 text-purple-950 border-purple-900",
    image: "/images/hero.jpg",
    locationCity: "Depok",
    stock: 3,
    variation: "Ready to Ship (Creamy Acoustic)",
  },
];

type FilterType = "all" | "switches" | "stabilizers" | "lube" | "prebuilt";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [items, setItems] = useState<MarketplaceItem[]>(MARKETPLACE_HARDWARE_ITEMS);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Listing Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"prebuilt" | "switches" | "stabilizers" | "lube">("prebuilt");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newDescription, setNewDescription] = useState("");
  const [newCity, setNewCity] = useState("Jakarta");
  const [newStock, setNewStock] = useState<number>(1);
  const [newImage, setNewImage] = useState("/images/prebuilt-kb.webp");
  const [newVariation, setNewVariation] = useState("Pre-Modded (Ready to Ship)");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        if (u.locationCity) setNewCity(u.locationCity);
      }

      const storedItems = localStorage.getItem("switchlab_marketplace_items");
      if (storedItems) {
        const parsed = JSON.parse(storedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems([...parsed, ...MARKETPLACE_HARDWARE_ITEMS]);
        }
      }
    } catch (e) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyTemplate = (type: "prebuilt75" | "prebuiltTkl" | "switchesLubed") => {
    if (type === "prebuilt75") {
      setNewTitle("Custom MonsGeek M1W 75% (Lubed Akko Cream Yellow, Tape Mod)");
      setNewCategory("prebuilt");
      setNewPrice(1950000);
      setNewDescription("Anodized purple aluminum case, PC plate, 3-layer tempest tape mod, poron gasket socks, tuned Akko Cream Yellow switches with Krytox 205g0.");
      setNewImage("/images/prebuilt-kb.webp");
      setNewVariation("75% Wireless Custom Build");
      setNewStock(1);
    } else if (type === "prebuiltTkl") {
      setNewTitle("Tuned Tiger Lite TKL (Gateron Oil Kings, Staebies V2.1)");
      setNewCategory("prebuilt");
      setNewPrice(2300000);
      setNewDescription("Clear smokey polycarbonate chassis, brass internal weight, hand-lubed and filmed Gateron Oil Kings, Lubed Staebies with zero rattle.");
      setNewImage("/images/hero.jpg");
      setNewVariation("TKL Complete Board (Thock Profile)");
      setNewStock(1);
    } else {
      setNewTitle("Vertex V1 Linear Switch Pack (90x Hand-Lubed & Filmed)");
      setNewCategory("switches");
      setNewPrice(590000);
      setNewDescription("90x custom linear switches lubed with Krytox 205g0 on stems/rails, 105 spring oil, Deskeys 0.3mm gasket film. Tested on hotswap tester.");
      setNewImage("/images/switches.jpg");
      setNewVariation("90x Hand-Tuned Pack");
      setNewStock(5);
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice || Number(newPrice) <= 0) {
      alert("Please provide a valid product title and price.");
      return;
    }

    const priceNum = Number(newPrice);
    const supplierName = currentUser ? `@${currentUser.name?.replace(/\s+/g, "") || "Artisan"}` : "@CommunityArtisan";

    let badgeText = "COMMUNITY LISTING";
    let badgeStyle = "bg-blue-50 text-blue-900 border-blue-900";
    if (newCategory === "prebuilt") {
      badgeText = "PRE-BUILT KEYBOARD";
      badgeStyle = "bg-purple-50 text-purple-950 border-purple-900";
    } else if (newCategory === "switches") {
      badgeText = "CUSTOM SWITCHES";
      badgeStyle = "bg-blue-50 text-blue-900 border-blue-900";
    } else if (newCategory === "stabilizers") {
      badgeText = "STABILIZERS";
      badgeStyle = "bg-amber-50 text-amber-950 border-amber-900";
    } else if (newCategory === "lube") {
      badgeText = "TUNING SUPPLIES";
      badgeStyle = "bg-emerald-50 text-emerald-950 border-emerald-900";
    }

    const newItem: MarketplaceItem = {
      id: `custom-part-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim() || "Hand-inspected custom mechanical keyboard hardware tuned for optimum sound and feel.",
      provider: supplierName,
      rating: 5.0,
      price: priceNum,
      pricing: `Rp ${priceNum.toLocaleString("id-ID")}`,
      badge: badgeText,
      badgeColor: badgeStyle,
      image: newImage,
      locationCity: newCity,
      stock: Number(newStock) || 1,
      variation: newVariation || "Ready to Ship",
    };

    const updated = [newItem, ...items];
    setItems(updated);

    try {
      const storedCustom = localStorage.getItem("switchlab_marketplace_items");
      const existingCustom = storedCustom ? JSON.parse(storedCustom) : [];
      localStorage.setItem("switchlab_marketplace_items", JSON.stringify([newItem, ...existingCustom]));
    } catch (err) {}

    setIsSellModalOpen(false);
    // Reset fields
    setNewTitle("");
    setNewPrice("");
    setNewDescription("");
    showToast(`✓ Successfully published "${newItem.title}" to Marketplace!`);
  };

  const handleAddToCart = (item: MarketplaceItem) => {
    try {
      const stored = localStorage.getItem("switchlab_cart");
      let cart: any[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) cart = parsed;
        } catch (e) {}
      }

      const existingIndex = cart.findIndex((i: any) => i.title === item.title);
      if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push({
          id: Date.now(),
          type: "product",
          title: item.title,
          variation: item.variation || "Standard Pack",
          provider: item.provider,
          price: item.price,
          quantity: 1,
          image: item.image,
        });
      }

      localStorage.setItem("switchlab_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart_updated"));
      showToast(`✓ Added "${item.title}" to cart!`);
    } catch (e) {
      showToast(`Failed to add item to cart.`);
    }
  };

  const filteredResults = items
    .filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.category === activeFilter;

      const query = searchInput.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.provider.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.locationCity.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query);

      const city = item.locationCity.toLowerCase();
      const matchesCity =
        selectedCity === "all" || city.includes(selectedCity.toLowerCase());

      return matchesFilter && matchesQuery && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating_desc") return b.rating - a.rating;
      if (sortBy === "name_asc") return a.title.localeCompare(b.title);
      return 0; // featured
    });

  const availableCities = Array.from(
    new Set(items.map((i) => i.locationCity))
  );

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 border-2 border-brand-navy shadow-lg font-mono text-xs flex items-center gap-3 animate-bounce">
          <span>{toastMessage}</span>
          <Link href="/cart" className="underline font-bold text-amber-400 hover:text-white">
            View Cart ➔
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ HARDWARE &amp; PARTS MARKETPLACE ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Mechanical Parts &amp; Hardware
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Raw &amp; Lubed Switches • Stabilizer Kits • Krytox Lube • Pre-Built Keyboards
              </p>
            </div>

            {/* Quick Stats & Sell Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
                <div>
                  <div className="text-xs font-mono text-brand-textMuted uppercase">Stocked Items</div>
                  <div className="text-xl font-mono font-bold text-brand-navy">{items.length} In Stock</div>
                </div>
                <div className="border-l-2 border-slate-300 pl-6">
                  <div className="text-xs font-mono text-brand-textMuted uppercase">Verified Suppliers</div>
                  <div className="text-xl font-mono font-bold text-brand-navy">
                    {new Set(items.map((i) => i.provider)).size} Verified
                  </div>
                </div>
              </div>

              {/* Sell Modded Keyboard / Part Button */}
              <button
                type="button"
                onClick={() => setIsSellModalOpen(true)}
                className="px-5 py-4 bg-brand-navy hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-brand-navy flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <span className="text-base">➕</span>
                <span>List Item for Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cross-Link Banner to Services */}
        <div className="mb-6 p-4 bg-amber-50 border-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛠️</span>
            <div>
              <span className="font-bold text-amber-950 uppercase block">
                Looking for artisan keyboard tuning instead of raw parts?
              </span>
              <span className="text-amber-800 text-[11px]">
                Ship your board to verified modders with 5-stage escrow protection.
              </span>
            </div>
          </div>
          <Link
            href="/services"
            className="px-3.5 py-1.5 bg-brand-navy text-white font-bold uppercase tracking-wider border-2 border-brand-navy hover:bg-slate-800 shrink-0"
          >
            Go to Modding Services Catalog →
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search parts, switches (e.g. Oil King, Staebies, Krytox 205g0, 75% Custom)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 bg-white border-2 border-slate-900 font-mono text-xs md:text-sm text-brand-textMain placeholder:text-brand-textMuted focus:outline-none focus:border-brand-navy shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-400 font-mono text-xs font-bold text-slate-700 cursor-pointer"
              >
                Clear ✕
              </button>
            )}
          </div>

          {/* Primary Hardware Categories */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex flex-wrap bg-brand-sidebar border-2 border-slate-900 p-1">
                {[
                  { key: "all", label: `All Hardware (${items.length})` },
                  { key: "switches", label: "Switches & Packs" },
                  { key: "stabilizers", label: "Stabilizers & Kits" },
                  { key: "lube", label: "Lube & Tuning Tools" },
                  { key: "prebuilt", label: "Pre-Built Keyboards" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key as FilterType)}
                    className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                      activeFilter === tab.key
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "text-brand-textMuted border-transparent hover:text-brand-textMain"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {(activeFilter !== "all" || selectedCity !== "all" || searchInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setSelectedCity("all");
                    setSearchInput("");
                    setSortBy("featured");
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border-2 border-red-500 font-mono text-xs font-bold text-red-700 transition-colors cursor-pointer"
                >
                  ✕ Reset Filters
                </button>
              )}
            </div>

            {/* Secondary Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-brand-sidebar border-2 border-slate-900">
              {/* Location Selector */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-textMuted mb-1">
                  📍 Supplier Location:
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
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-brand-textMuted mb-1">
                  🔄 Sort Parts:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-slate-800 px-2.5 py-1.5 text-xs font-mono font-bold text-brand-textMain focus:border-brand-navy focus:outline-none uppercase"
                >
                  <option value="featured">Featured / In Stock</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated Provider</option>
                  <option value="name_asc">Part Name (A-Z)</option>
                </select>
              </div>

              {/* Cart Quick Link */}
              <div className="col-span-2 sm:col-span-1 flex items-end">
                <Link href="/cart" className="w-full">
                  <button
                    type="button"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase py-2 px-3 border border-slate-900 flex items-center justify-center gap-1.5"
                  >
                    <span>🛒 View Shopping Cart</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-xs font-mono text-brand-textMuted uppercase tracking-wider flex items-center justify-between">
          <span>
            Showing {filteredResults.length} hardware product{filteredResults.length === 1 ? "" : "s"}
          </span>
          <span className="text-emerald-700 font-bold">
            ✓ In Stock &amp; Ready for Delivery
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between"
            >
              {/* Top Section */}
              <div>
                <div className="p-4 pb-2 flex justify-between items-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 ${item.badgeColor}`}
                  >
                    [ {item.badge} ]
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    ● {item.stock} in stock
                  </span>
                </div>

                <div className="px-4 pb-2">
                  <div className="h-40 bg-brand-lightBg overflow-hidden border border-slate-300">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                <div className="p-4 pt-2">
                  <h3 className="font-bold text-base text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-textMuted mb-2 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center text-xs font-mono border-t border-slate-200 pt-2 mb-2">
                    <span className="text-brand-textMuted">
                      Supplier: <strong className="text-brand-navy">{item.provider}</strong> ({item.rating}★)
                    </span>
                    <span className="text-brand-textMuted">
                      📍 {item.locationCity}
                    </span>
                  </div>

                  <p className="text-lg font-mono font-bold text-brand-navy mb-2">
                    {item.pricing}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <Button
                  variant="primary"
                  isLoading={false}
                  className="w-full uppercase font-bold text-xs"
                  onClick={() => handleAddToCart(item)}
                >
                  🛒 Add to Cart ({item.pricing})
                </Button>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-brand-textMuted">
                    Ships via JNE / SiCepat / Instant Kurir
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-8">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-black text-brand-textMain uppercase mb-1">
              No Hardware Items Found
            </h3>
            <p className="text-brand-textMuted text-xs font-mono uppercase mb-4">
              No matching parts found {searchInput ? `for "${searchInput}"` : ""}.
            </p>
            <Button
              variant="secondary"
              isLoading={false}
              onClick={() => {
                setSearchInput("");
                setActiveFilter("all");
                setSelectedCity("all");
              }}
              className="inline-block w-auto"
            >
              Reset Search &amp; Filters
            </Button>
          </div>
        )}

        {/* Sell / List Item Modal */}
        {isSellModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white border-4 border-slate-900 max-w-xl w-full p-6 shadow-2xl my-8 font-mono">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy bg-blue-50 border border-brand-navy px-2 py-0.5 inline-block mb-1">
                    [ COMMUNITY MARKETPLACE SELLER ]
                  </span>
                  <h2 className="text-xl font-black text-brand-textMain uppercase tracking-tight">
                    List Item for Sale
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 font-bold text-slate-900 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Template Buttons for Instant Demo */}
              <div className="mb-4 p-3 bg-amber-50 border-2 border-slate-900">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-950 mb-2">
                  ⚡ 1-Click Quick Pre-fill Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("prebuilt75")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-900 text-[10px] font-bold text-slate-900 uppercase cursor-pointer"
                  >
                    ⌨️ Pre-Modded 75% Board
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("prebuiltTkl")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-900 text-[10px] font-bold text-slate-900 uppercase cursor-pointer"
                  >
                    ⌨️ Tuned TKL Board
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("switchesLubed")}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-900 text-[10px] font-bold text-slate-900 uppercase cursor-pointer"
                  >
                    🔘 Hand-Lubed Switches
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                    Item Title &amp; Model:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MonsGeek M1W 75% Custom (Lubed Oil Kings, Tape Mod)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 focus:border-brand-navy focus:outline-none font-mono text-xs"
                  />
                </div>

                {/* Category & Price Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Category:
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-900 font-mono text-xs uppercase"
                    >
                      <option value="prebuilt">Pre-Built / Modded Keyboard</option>
                      <option value="switches">Switches &amp; Packs</option>
                      <option value="stabilizers">Stabilizers &amp; Parts</option>
                      <option value="lube">Lube &amp; Tuning Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Price (IDR):
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      placeholder="e.g. 1950000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-900 focus:border-brand-navy focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                {/* City & Stock Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Shipping Location (City):
                    </label>
                    <select
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-900 font-mono text-xs uppercase"
                    >
                      <option value="Jakarta">Jakarta</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Depok">Depok</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Semarang">Semarang</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                      <option value="Bali">Bali</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Stock Quantity:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border-2 border-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Photo Preset */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                    Select Product Image:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Pre-Built KB", url: "/images/prebuilt-kb.webp" },
                      { label: "Custom Alu", url: "/images/hero.jpg" },
                      { label: "Switches", url: "/images/switches.jpg" },
                      { label: "Lube / Mod", url: "/images/lubing-swtiches.webp" },
                    ].map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setNewImage(p.url)}
                        className={`p-1 border-2 text-center transition-all ${
                          newImage === p.url
                            ? "border-brand-navy bg-blue-50 ring-2 ring-brand-navy"
                            : "border-slate-300 hover:border-slate-800"
                        }`}
                      >
                        <div className="h-12 bg-slate-100 overflow-hidden mb-1">
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="block text-[9px] uppercase font-bold truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                    Specifications &amp; Modding Details:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List all specs, modding techniques performed (e.g. tape mod, lubing lubricant brand, stabilizer wire tuning, switch specs)..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 focus:border-brand-navy focus:outline-none font-mono text-xs"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t-2 border-slate-900 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSellModalOpen(false)}
                    className="px-4 py-2 border-2 border-slate-900 hover:bg-slate-100 font-bold uppercase tracking-wider text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-navy hover:bg-slate-800 text-white border-2 border-brand-navy font-bold uppercase tracking-wider text-xs shadow-xs"
                  >
                    Publish to Marketplace →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
          <div className="p-8 bg-brand-sidebar border-2 border-slate-900 shadow-md text-center max-w-sm w-full">
            <div className="text-3xl mb-3 animate-spin inline-block">⚙️</div>
            <h2 className="text-base font-bold font-mono text-brand-textMain uppercase tracking-wide">
              Loading Marketplace...
            </h2>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}