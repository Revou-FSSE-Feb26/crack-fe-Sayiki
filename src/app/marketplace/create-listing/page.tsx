"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { addNotification } from "@/lib/notifications";

type HardwareCategory = "prebuilt" | "switches" | "stabilizers" | "lube";

interface HardwareTemplate {
  title: string;
  category: HardwareCategory;
  price: number;
  condition: string;
  variation: string;
  image: string;
  city: string;
  stock: number;
  specs: string[];
  description: string;
}

const TEMPLATES: HardwareTemplate[] = [
  {
    title: "Wobkey Rainy75 Deep Thock Edition (Custom Built)",
    category: "prebuilt",
    price: 1450000,
    condition: "Artisan Modded (Pre-built)",
    variation: "Anodized Silver • FR4 Plate",
    image: "/images/prebuilt-kb.webp",
    city: "Jakarta",
    stock: 2,
    specs: ["Hand-lubed HMX Violet Switches (205g0)", "Wire-balanced Staebies V2.1", "3-layer Tempest Tape Mod", "Force Break Mod on case"],
    description: "Full custom-built Wobkey Rainy75 tuned for maximum acoustic marbly thock. Fully wire-balanced stabilizers with zero rattle on Spacebar/Enter/Backspace. Shipped in original box with all accessories.",
  },
  {
    title: "Gateron Oil King Linear Switches (90x Pack)",
    category: "switches",
    price: 450000,
    condition: "Brand New (Precision Lubed)",
    variation: "90x Switches (5-Pin PCB Mount)",
    image: "/images/switches.jpg",
    city: "Bandung",
    stock: 5,
    specs: ["Hand-brushed Krytox 205g0 on stems", "Krytox 105 bag-lubed 55g springs", "Deskeys 0.3mm Black Gasket Films"],
    description: "Factory-fresh Gateron Oil Kings hand-lubed by verified artisan. Ultra-deep sound signature with butter smooth travel and tight stem tolerances.",
  },
  {
    title: "Staebies V2.1 PCB Screw-In Stabilizers Kit",
    category: "stabilizers",
    price: 265000,
    condition: "Artisan Tuned & Balanced",
    variation: "Clear Housing / Black Stem (6.25u + 4x 2u)",
    image: "/images/stabs.webp",
    city: "Surabaya",
    stock: 4,
    specs: ["Machinist stone wire balancing (zero tick)", "Krytox XHT-BDZ wire coating", "PCB Band-aid dampening washers included"],
    description: "Ready-to-install Staebies V2.1 stabilizer set. Every wire is precision-flattened and tolerance checked on a machinist granite slab. Guaranteed tick-free.",
  },
  {
    title: "Krytox GPL 205g0 + 105 Spring Oil & Brush Tuning Bundle",
    category: "lube",
    price: 85000,
    condition: "Brand New (Genuine Miller-Stephenson)",
    variation: "5g Jar 205g0 + 5ml Dropper 105 + 2x Brushes",
    image: "/images/lubing-swtiches.webp",
    city: "Jakarta",
    stock: 12,
    specs: ["Authentic Miller-Stephenson Krytox 205g0", "Fine #00 detailing brush", "Stem holder grabber tool included"],
    description: "Everything needed to lube your mechanical keyboard switches and stabilizers like a pro. Authentic formulation repackaged in airtight UV-resistant jars.",
  },
];

const PRESET_PHOTOS = [
  { label: "Pre-Built Custom Keyboard", url: "/images/prebuilt-kb.webp", category: "prebuilt", icon: "⌨️" },
  { label: "Artisan Assembly Bench", url: "/images/repair-kb.png", category: "prebuilt", icon: "🔧" },
  { label: "Switches Pack", url: "/images/switches.jpg", category: "switches", icon: "🔘" },
  { label: "Stabilizer Kit", url: "/images/stabs.webp", category: "stabilizers", icon: "⚖️" },
  { label: "Switch Lubing Bench", url: "/images/lubing-swtiches.webp", category: "lube", icon: "🧈" },
  { label: "Case & Plate Dampeners", url: "/images/foam.jpg", category: "prebuilt", icon: "🔊" },
];

export default function CreateMarketplaceListingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HardwareCategory>("prebuilt");
  const [price, setPrice] = useState<number | "">(1450000);
  const [condition, setCondition] = useState("Artisan Modded (Pre-built)");
  const [variation, setVariation] = useState("Pre-Modded (Ready to Ship)");
  const [city, setCity] = useState("Jakarta");
  const [stock, setStock] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState("/images/prebuilt-kb.webp");
  const [imageInputMode, setImageInputMode] = useState<"presets" | "upload" | "url">("presets");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [description, setDescription] = useState("");
  const [specsText, setSpecsText] = useState("Hand-lubed switches\nWire-balanced stabilizers\nTempest tape mod");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.locationCity) setCity(u.locationCity);
      }
    } catch (e) {}
  }, []);

  const applyTemplate = (tpl: HardwareTemplate) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setPrice(tpl.price);
    setCondition(tpl.condition);
    setVariation(tpl.variation);
    setImageUrl(tpl.image);
    setCity(tpl.city);
    setStock(tpl.stock);
    setSpecsText(tpl.specs.join("\n"));
    setDescription(tpl.description);
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large (max 10MB).");
      return;
    }

    setUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const optimized = canvas.toDataURL("image/jpeg", 0.85);
          setImageUrl(optimized);
        } catch (err) {
          setImageUrl(event.target?.result as string);
        } finally {
          setUploadingImage(false);
        }
      };
      img.onerror = () => {
        setUploadingImage(false);
        setError("Failed to process image file.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadingImage(false);
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter an item title.");
      return;
    }

    const priceNum = Number(price);
    if (!priceNum || priceNum <= 0) {
      setError("Please enter a valid price in Rupiah.");
      return;
    }

    if (!description.trim()) {
      setError("Please write a short description or modification details.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supplierName = currentUser ? currentUser.name : "Artisan Studio";

      let badgeText = "MODDED KEYBOARD";
      let badgeStyle = "bg-purple-50 text-purple-950 border-purple-900";
      if (category === "switches") {
        badgeText = "SWITCHES";
        badgeStyle = "bg-blue-50 text-blue-950 border-blue-900";
      } else if (category === "stabilizers") {
        badgeText = "STABILIZERS";
        badgeStyle = "bg-amber-50 text-amber-950 border-amber-900";
      } else if (category === "lube") {
        badgeText = "TUNING SUPPLIES";
        badgeStyle = "bg-emerald-50 text-emerald-950 border-emerald-900";
      }

      const newItem = {
        id: `custom-part-${Date.now()}`,
        category,
        title: title.trim(),
        description: description.trim(),
        provider: supplierName,
        rating: 5.0,
        price: priceNum,
        pricing: `Rp ${priceNum.toLocaleString("id-ID")}`,
        badge: badgeText,
        badgeColor: badgeStyle,
        image: imageUrl || "/images/prebuilt-kb.webp",
        locationCity: city || "Jakarta",
        stock: Number(stock) || 1,
        variation: variation.trim() || condition || "Ready to Ship",
      };

      // Persist to localStorage
      const storedCustom = localStorage.getItem("switchlab_marketplace_items");
      const existingCustom = storedCustom ? JSON.parse(storedCustom) : [];
      localStorage.setItem("switchlab_marketplace_items", JSON.stringify([newItem, ...existingCustom]));

      // Create notification
      addNotification({
        targetRole: "ALL",
        targetUserId: currentUser?.id || "guest",
        type: "WORKBENCH",
        title: "📦 Marketplace Listing Published!",
        message: `Your item "${title.trim()}" is now live in the Mechanical Parts & Hardware Marketplace.`,
        link: "/search",
      });

      // Redirect back to search with success flag
      router.push("/search?created=true");
    } catch (err: any) {
      console.error("Failed to publish marketplace listing:", err);
      setError("Failed to publish listing. Please try again.");
      setLoading(false);
    }
  };

  const getCategoryBadge = () => {
    switch (category) {
      case "prebuilt":
        return { label: "MODDED KEYBOARD", style: "bg-purple-50 text-purple-950 border-purple-900" };
      case "switches":
        return { label: "SWITCHES", style: "bg-blue-50 text-blue-950 border-blue-900" };
      case "stabilizers":
        return { label: "STABILIZERS", style: "bg-amber-50 text-amber-950 border-amber-900" };
      case "lube":
        return { label: "TUNING SUPPLIES", style: "bg-emerald-50 text-emerald-950 border-emerald-900" };
    }
  };

  const badgeInfo = getCategoryBadge();

  return (
    <div className="min-h-screen bg-brand-lightBg font-mono pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs uppercase text-brand-textMuted mb-6 font-bold">
          <Link href="/search" className="hover:text-brand-navy hover:underline">
            🛒 Marketplace
          </Link>
          <span>/</span>
          <span className="text-brand-navy">Create Hardware &amp; Keyboard Listing</span>
        </div>

        {/* Page Header */}
        <div className="bg-brand-sidebar border-2 border-slate-900 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ COMMUNITY MARKETPLACE SELLER ]
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-brand-textMain tracking-tight">
                Publish Keyboard or Hardware to Marketplace
              </h1>
              <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-1">
                Seller: @{currentUser ? currentUser.name : "Community Member"} • City: {city || "Jakarta, Indonesia"}
              </p>
            </div>

            <Link href="/search">
              <Button variant="secondary" className="text-xs uppercase font-bold">
                ← Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Pre-fill Suggestion Templates */}
        <div className="mb-8 p-4 bg-white border-2 border-slate-900 shadow-xs">
          <div className="text-xs font-bold uppercase text-brand-navy mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>⚡ Quick-Start Hardware Templates:</span>
              <span className="text-[10px] text-slate-500 font-normal">(Click to auto-populate form instantly)</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-left p-3 bg-brand-lightBg hover:bg-amber-50 border-2 border-slate-300 hover:border-slate-900 transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-brand-navy line-clamp-1">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">
                  Rp {tpl.price.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {tpl.condition}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-mono mb-6">
            ⚠ {error}
          </div>
        )}

        {/* 2-Column Creator Layout: Form on Left (2 cols), Live Preview on Right (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Column */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Step 1: Basic Information */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-textMain">
                  Item Identity &amp; Category
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wobkey Rainy75 Deep Thock Edition (Custom Built)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs md:text-sm text-brand-textMain focus:outline-none focus:border-brand-navy shadow-xs"
                    required
                  />
                </div>

                {/* Category Radio Group */}
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                    Hardware Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: "prebuilt", label: "Modded Keyboards", icon: "⌨️" },
                      { val: "switches", label: "Switches", icon: "🔘" },
                      { val: "stabilizers", label: "Stabilizers", icon: "⚖️" },
                      { val: "lube", label: "Lubes & Tools", icon: "🧈" },
                    ].map((cat) => {
                      const isSelected = category === cat.val;
                      return (
                        <button
                          key={cat.val}
                          type="button"
                          onClick={() => setCategory(cat.val as HardwareCategory)}
                          className={`p-3 border-2 text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-brand-navy bg-blue-50/70 shadow-xs"
                              : "border-slate-300 hover:border-slate-800 bg-white"
                          }`}
                        >
                          <div className="text-xl mb-1">{cat.icon}</div>
                          <div className="text-xs font-bold text-brand-textMain">{cat.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condition & Variation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                      Item Condition *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs focus:outline-none focus:border-brand-navy"
                    >
                      <option value="Artisan Modded (Pre-built)">Artisan Modded (Pre-built &amp; Tuned)</option>
                      <option value="Brand New (Precision Lubed)">Brand New (Precision Lubed)</option>
                      <option value="Brand New (Unopened)">Brand New (Unopened / In Box)</option>
                      <option value="Lightly Used (Cleaned)">Lightly Used (Cleaned &amp; Tested)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                      Variant / Spec Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Anodized Silver • FR4 Plate"
                      value={variation}
                      onChange={(e) => setVariation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs text-brand-textMain focus:outline-none focus:border-brand-navy shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Pricing, Stock & Location */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-textMain">
                  Pricing, Stock &amp; Location
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Price (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    placeholder="e.g. 1450000"
                    value={price === "" ? "" : price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs md:text-sm font-bold text-emerald-800 focus:outline-none focus:border-brand-navy shadow-xs"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {price ? `Rp ${Number(price).toLocaleString("id-ID")}` : "Enter amount"}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={stock}
                    onChange={(e) => setStock(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs md:text-sm text-brand-textMain focus:outline-none focus:border-brand-navy shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Dispatch City Location *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs focus:outline-none focus:border-brand-navy"
                  >
                    <option value="Jakarta">Jakarta</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Tangerang">Tangerang</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Medan">Medan</option>
                    <option value="Bali">Bali</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Photos & Visual Presentation */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-textMain">
                  Cover Photo &amp; Visuals
                </h2>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                {[
                  { mode: "presets", label: "📸 Preset Photos" },
                  { mode: "upload", label: "📤 Upload Image" },
                  { mode: "url", label: "🔗 Image URL" },
                ].map((tab) => (
                  <button
                    key={tab.mode}
                    type="button"
                    onClick={() => setImageInputMode(tab.mode as any)}
                    className={`px-3 py-1.5 text-xs font-bold border-2 cursor-pointer transition-all ${
                      imageInputMode === tab.mode
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mode 1: Presets Gallery */}
              {imageInputMode === "presets" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_PHOTOS.map((photo, i) => {
                    const isSelected = imageUrl === photo.url;
                    return (
                      <div
                        key={i}
                        onClick={() => setImageUrl(photo.url)}
                        className={`border-2 p-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-navy bg-blue-50"
                            : "border-slate-300 hover:border-slate-800 bg-white"
                        }`}
                      >
                        <div className="h-18 overflow-hidden bg-slate-100 mb-1 border border-slate-200">
                          <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                          <span className="truncate">{photo.icon} {photo.label}</span>
                          {isSelected && <span className="text-brand-navy">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mode 2: File Upload */}
              {imageInputMode === "upload" && (
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                    Upload Photo from Computer (Max 10MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-xs font-mono text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:border-2 file:border-slate-900 file:text-xs file:font-bold file:bg-brand-navy file:text-white hover:file:bg-slate-800 file:cursor-pointer"
                  />
                  {uploadingImage && (
                    <div className="text-xs text-brand-navy font-bold mt-2">
                      Optimizing and processing image...
                    </div>
                  )}
                </div>
              )}

              {/* Mode 3: Direct URL */}
              {imageInputMode === "url" && (
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Direct Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or public image link"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs text-brand-textMain focus:outline-none focus:border-brand-navy shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* Step 4: Modifications & Description */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-textMain">
                  Modifications &amp; Description
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Artisan Modification Specs (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hand-lubed switches with Krytox 205g0&#10;Wire-balanced stabilizers&#10;Tempest tape mod"
                    value={specsText}
                    onChange={(e) => setSpecsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs focus:outline-none focus:border-brand-navy"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    These highlight items show up as badges and feature tags on your card.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Full Description &amp; Build Details *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what's included, acoustics, sound test info, or package contents..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 font-mono text-xs focus:outline-none focus:border-brand-navy"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Banner */}
            <div className="p-4 bg-brand-sidebar border-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-brand-textMuted">
                ✓ Once published, your listing is immediately available for purchase with escrow protection.
              </div>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full sm:w-auto px-8 py-3 uppercase font-bold text-xs tracking-wider"
              >
                {loading ? "Publishing to Marketplace..." : "🚀 Publish Marketplace Listing →"}
              </Button>
            </div>
          </form>

          {/* Right Column: Live Marketplace Card Preview (Sticky) */}
          <div className="space-y-4">
            <div className="sticky top-24">
              <span className="block text-xs font-bold uppercase text-brand-navy mb-2">
                👁️ Live Marketplace Card Preview:
              </span>

              {/* The Exact Neubrutalist Card as in Search / Marketplace */}
              <div className="bg-white border-2 border-slate-900 flex flex-col justify-between hover:border-brand-navy transition-colors shadow-xs">
                {/* Image & Badge */}
                <div className="relative h-44 bg-slate-100 border-b-2 border-slate-900 overflow-hidden">
                  <img
                    src={imageUrl || "/images/prebuilt-kb.webp"}
                    alt={title || "Preview"}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeInfo.style}`}
                  >
                    {badgeInfo.label}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/95 border border-slate-900 text-slate-800">
                    📍 {city || "Jakarta"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-brand-textMuted mb-1">
                      <span className="font-bold text-brand-navy truncate max-w-[150px]">
                        @{currentUser ? currentUser.name : "Community Member"}
                      </span>
                      <span className="text-amber-500 font-bold">★ 5.0 (New)</span>
                    </div>

                    <h3 className="font-bold text-sm text-brand-textMain mb-1.5 leading-snug line-clamp-2">
                      {title || "Untitled Mechanical Keyboard Listing"}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {description || "Item description and artisan build specifications will appear here."}
                    </p>

                    {/* Modification Tags */}
                    {specsText.trim() && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {specsText
                          .split("\n")
                          .filter((s) => s.trim())
                          .slice(0, 2)
                          .map((spec, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 text-[10px] text-slate-700 font-mono truncate max-w-[180px]"
                            >
                              ✓ {spec}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing & Stock */}
                  <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-brand-textMuted uppercase">Price</div>
                      <div className="text-base font-bold text-brand-navy">
                        Rp {Number(price || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300 font-bold block">
                        {stock} in stock
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Buy/Cart Button */}
                <div className="p-3 bg-brand-lightBg border-t-2 border-slate-900">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2 bg-brand-navy text-white text-xs font-bold uppercase tracking-wider border-2 border-brand-navy opacity-90 cursor-not-allowed"
                  >
                    Add to Cart 🛒
                  </button>
                </div>
              </div>

              {/* Informational Callout */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-[11px] text-amber-900 leading-snug">
                💡 <strong>Instant Marketplace Sync:</strong> When published, this listing appears at the very top of the <strong>Marketplace</strong> and can be added directly to cart by buyers!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
