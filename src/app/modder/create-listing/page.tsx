"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { api, syncAuthCookies } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

type ServiceCategory =
  | "SWITCH_MODS"
  | "STABILIZER_MODS"
  | "CASE_AND_ACOUSTIC"
  | "CUSTOMIZATION_AESTHETICS";

type ServiceOptionType =
  | "LUBE_TYPE"
  | "NEW_SWITCH"
  | "ADDON_SERVICE"
  | "FOAM_TYPE";

interface OptionItem {
  id: string;
  optionName: string;
  optionType: ServiceOptionType;
  extraPrice: number;
}

const CATEGORIES: { value: ServiceCategory; label: string; icon: string; desc: string }[] = [
  {
    value: "SWITCH_MODS",
    label: "Switch Mods & Lubing",
    icon: "🔘",
    desc: "Brush hand-lubing, switch filming, spring swapping, ultrasonic cleaning",
  },
  {
    value: "STABILIZER_MODS",
    label: "Stabilizer Tuning",
    icon: "⚖️",
    desc: "Wire balancing, Holee mod, band-aid dampening, rattle elimination",
  },
  {
    value: "CASE_AND_ACOUSTIC",
    label: "Case & Acoustic Dampening",
    icon: "🔊",
    desc: "Poron plate foam, tempest tape mod, force break mod, silicone pour",
  },
  {
    value: "CUSTOMIZATION_AESTHETICS",
    label: "Aesthetics & Custom Builds",
    icon: "🎨",
    desc: "Custom soldering, laser engraving, coiling cables, full keyboard assembly",
  },
];

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

const PRESET_PHOTOS = [
  { label: "Switch Lubing", url: "/images/lubing-swtiches.webp", category: "SWITCH_MODS", icon: "🔘" },
  { label: "Stabilizer Tuning", url: "/images/stabs.webp", category: "STABILIZER_MODS", icon: "⚖️" },
  { label: "Acoustic Foams", url: "/images/foam.jpg", category: "CASE_AND_ACOUSTIC", icon: "🔊" },
  { label: "Switches & Parts", url: "/images/switches.jpg", category: "SWITCH_MODS", icon: "🎛️" },
  { label: "Full Custom Build", url: "/images/repair-kb.png", category: "CUSTOMIZATION_AESTHETICS", icon: "🔧" },
  { label: "Prebuilt Keyboard", url: "/images/prebuilt-kb.webp", category: "CUSTOMIZATION_AESTHETICS", icon: "⌨️" },
];

const PRESETS = [
  {
    title: "Master Linear Switch Lubing & Filming",
    category: "SWITCH_MODS" as ServiceCategory,
    basePrice: 150000,
    imageUrl: "/images/lubing-swtiches.webp",
    desc: "Precision hand-brush lubing with Krytox 205g0 for stems/housings and Krytox 105 oil bag-lubing for springs. Includes ultrasonic degreasing and sound testing check before dispatch.",
    options: [
      { id: "1", optionName: "Krytox 205g0 + Krytox 105 Spring Oil", optionType: "LUBE_TYPE" as ServiceOptionType, extraPrice: 0 },
      { id: "2", optionName: "Durock 0.3mm Switch Films (70x-90x)", optionType: "ADDON_SERVICE" as ServiceOptionType, extraPrice: 35000 },
      { id: "3", optionName: "Spring Weight Swap (62g / 67g Double-Stage)", optionType: "NEW_SWITCH" as ServiceOptionType, extraPrice: 45000 },
    ],
  },
  {
    title: "Zero-Rattle Stabilizer Balancing & Holee Mod",
    category: "STABILIZER_MODS" as ServiceCategory,
    basePrice: 95000,
    imageUrl: "/images/stabs.webp",
    desc: "Complete wire straightening on machinist stone, stem medical tape Holee mod, housing lubing with Krytox 205g0, and wire coating with XHT-BDZ high-viscosity grease.",
    options: [
      { id: "1", optionName: "Krytox XHT-BDZ Wire Coating", optionType: "LUBE_TYPE" as ServiceOptionType, extraPrice: 0 },
      { id: "2", optionName: "PCB Band-Aid Pad Dampeners", optionType: "ADDON_SERVICE" as ServiceOptionType, extraPrice: 15000 },
    ],
  },
  {
    title: "Deep Thock Case & Acoustic Dampening Pack",
    category: "CASE_AND_ACOUSTIC" as ServiceCategory,
    basePrice: 120000,
    imageUrl: "/images/foam.jpg",
    desc: "Custom cut EVA/Poron plate foam, precision case cavity silicone pour or acoustic batting, and multi-layer tempest tape mod for clean, deep bottom-out acoustics.",
    options: [
      { id: "1", optionName: "Custom Poron Plate & Case Foam", optionType: "FOAM_TYPE" as ServiceOptionType, extraPrice: 25000 },
      { id: "2", optionName: "3-Layer Blue Painter's Tape Mod", optionType: "ADDON_SERVICE" as ServiceOptionType, extraPrice: 15000 },
    ],
  },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("SWITCH_MODS");
  const [basePrice, setBasePrice] = useState<number>(150000);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url" | "presets">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [options, setOptions] = useState<OptionItem[]>([
    {
      id: "opt_1",
      optionName: "Krytox 205g0 Brush Hand-Lubing",
      optionType: "LUBE_TYPE",
      extraPrice: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let userObj: any = null;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        userObj = JSON.parse(stored);
        setCurrentUser(userObj);
        syncAuthCookies();
      }
    } catch (e) {}

    // Security Guard: Modders and Admins only
    if (!userObj) {
      router.replace("/login?redirect=/modder/create-listing");
      return;
    }
    const role = String(userObj.role || "").toUpperCase();
    if (role !== "MODDER" && role !== "ADMIN") {
      router.replace("/orders?error=unauthorized_modder_access");
      return;
    }
  }, [router]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setBasePrice(preset.basePrice);
    setDescription(preset.desc);
    if (preset.imageUrl) {
      setImageUrl(preset.imageUrl);
    }
    setOptions(
      preset.options.map((opt, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        optionName: opt.optionName,
        optionType: opt.optionType,
        extraPrice: opt.extraPrice,
      }))
    );
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

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: `opt_${Date.now()}`,
        optionName: "",
        optionType: "ADDON_SERVICE",
        extraPrice: 25000,
      },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUpdateOption = (id: string, field: keyof OptionItem, value: any) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      setError("Session expired. Please log in again.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a service listing title.");
      return;
    }

    if (basePrice <= 0) {
      setError("Base price must be greater than Rp 0.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a detailed description of what this service includes.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Filter out empty options
      const formattedOptions = options
        .filter((o) => o.optionName.trim() !== "")
        .map((o) => ({
          optionName: o.optionName.trim(),
          optionType: o.optionType,
          extraPrice: Number(o.extraPrice) || 0,
        }));

      await api.listings.create({
        modderId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        basePrice: Number(basePrice),
        category: category,
        imageUrl: imageUrl.trim() || undefined,
        options: formattedOptions.length > 0 ? formattedOptions : undefined,
      });

      // Notify the modder
      addNotification({
        targetRole: "MODDER",
        targetUserId: currentUser.id,
        type: "WORKBENCH",
        title: "✨ Service Listing Published!",
        message: `Your service "${title.trim()}" is now live in the Marketplace and Services directory. Customers can now book tuning with Escrow protection.`,
        link: "/services",
      });

      // Redirect back to Modder Dashboard with success parameter
      router.push("/modder/dashboard?tab=services&created=true");
    } catch (err: any) {
      console.error("Failed to create listing:", err);
      setError(err.message || "Failed to publish listing to marketplace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="p-8 bg-brand-sidebar border-2 border-slate-900 shadow-md text-center max-w-sm w-full">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-navy border-t-transparent mb-4"></div>
          <h2 className="text-base font-bold font-mono text-brand-textMain uppercase">Checking Studio Access...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightBg py-8 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase text-brand-textMuted mb-6 font-bold">
          <Link href="/modder/dashboard" className="hover:text-brand-navy hover:underline">
            🛠️ Workbench
          </Link>
          <span>/</span>
          <span className="text-brand-navy">Create Service / Marketplace Listing</span>
        </div>

        {/* Page Header */}
        <div className="bg-brand-sidebar border-2 border-slate-900 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-amber-600 bg-amber-50 text-amber-900 mb-2">
                [ MODDER STUDIO LISTING CREATOR ]
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-brand-textMain tracking-tight">
                Publish a Tuning Service to Marketplace
              </h1>
              <p className="text-xs text-brand-textMuted uppercase tracking-wider mt-1">
                Studio: @{currentUser.name} • Location: {currentUser.locationCity || "Jakarta, Indonesia"}
              </p>
            </div>

            <Link href="/modder/dashboard">
              <Button variant="secondary" className="text-xs uppercase font-bold">
                ← Back to Workbench
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Pre-fill Suggestion Templates */}
        <div className="mb-8 p-4 bg-white border-2 border-slate-800">
          <div className="text-xs font-bold uppercase text-brand-navy mb-2 flex items-center gap-1.5">
            <span>⚡ Quick-Start Service Templates:</span>
            <span className="text-[10px] text-slate-500 font-normal">(Click to auto-populate form)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left p-2.5 bg-brand-lightBg hover:bg-amber-50 border border-slate-300 hover:border-slate-800 transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-brand-navy">
                  {p.title}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">
                  Rp {p.basePrice.toLocaleString()} • {p.options.length} options
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

        {/* Main Grid: Form + Live Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column (2 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase text-brand-textMain border-b border-slate-200 pb-2">
                1. Service Identification
              </h2>

              <Input
                label="Service / Listing Title"
                type="text"
                placeholder="e.g. Master Linear Switch Lubing & Filming"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                  Category Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.value;
                    return (
                      <div
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`p-3 border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-brand-navy text-white border-brand-navy shadow-xs"
                            : "bg-white border-slate-800 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                          {cat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Service Cover Photo & Media */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <h2 className="text-sm font-bold uppercase text-brand-textMain">
                    2. Service Cover Photo & Media
                  </h2>
                  <p className="text-[10px] text-brand-textMuted">
                    Add a picture for your listing (Upload local image, choose a preset, or paste URL)
                  </p>
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase underline cursor-pointer"
                  >
                    ✕ Clear Photo
                  </button>
                )}
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex border-b border-slate-200 gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                    imageInputMode === "upload"
                      ? "bg-brand-navy text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  📁 Upload Device Photo
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("presets")}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                    imageInputMode === "presets"
                      ? "bg-brand-navy text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🖼️ Studio Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                    imageInputMode === "url"
                      ? "bg-brand-navy text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🌐 Image URL Link
                </button>
              </div>

              {/* Mode 1: Local File Upload */}
              {imageInputMode === "upload" && (
                <div className="space-y-3">
                  <label className="border-2 border-dashed border-slate-400 hover:border-brand-navy p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <span className="text-3xl mb-2">{uploadingImage ? "⚙️" : "📷"}</span>
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      {uploadingImage ? "Processing image..." : "Click to choose photo from computer/phone"}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Supports JPG, PNG, WebP • Auto-optimized for fast load
                    </span>
                  </label>
                </div>
              )}

              {/* Mode 2: Studio Presets */}
              {imageInputMode === "presets" && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    Select a curated mechanical keyboard tuning photo:
                  </span>
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
                          <div className="h-16 overflow-hidden bg-slate-100 mb-1 border border-slate-200">
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
                </div>
              )}

              {/* Mode 3: Custom URL */}
              {imageInputMode === "url" && (
                <div>
                  <label className="block text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                    Image Direct URL (https://...)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://i.imgur.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-800 focus:border-brand-navy text-brand-textMain font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Paste any public image link (Unsplash, Discord CDN, Imgur, Cloudinary)
                  </span>
                </div>
              )}

              {/* Active Image Thumbnail / Confirmation */}
              {imageUrl && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-200 border border-slate-400 overflow-hidden shrink-0">
                      <img src={imageUrl} alt="Selected Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        ✓ Photo Selected & Attached
                      </span>
                      <span className="text-[10px] text-emerald-700 truncate max-w-xs block">
                        Will be displayed on your service card in Marketplace and Catalog
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="px-2.5 py-1 text-[11px] font-bold uppercase bg-white border border-red-300 text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Pricing & Description */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase text-brand-textMain border-b border-slate-200 pb-2">
                3. Pricing & Scope Description
              </h2>

              <div>
                <label className="block text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                  Base Price (IDR / Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">Rp</span>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-slate-800 focus:border-brand-navy text-brand-textMain font-mono text-sm focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
                  <span>Formatted: Rp {Number(basePrice || 0).toLocaleString()}</span>
                  <span className="text-emerald-700 font-bold">
                    Escrow Payout: Rp {Math.round(Number(basePrice || 0) * 0.95).toLocaleString()} (95%)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-brand-textMuted uppercase tracking-wider mb-1">
                  Service Description & Tuning Procedure
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe lubricants used (e.g. Krytox 205g0), step-by-step procedure, turnaround time, sound testing QC, and what the customer should send..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-800 focus:border-brand-navy text-brand-textMain font-mono text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Configurable Options / Add-ons */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <h2 className="text-sm font-bold uppercase text-brand-textMain">
                    4. Configurable Add-ons & Options
                  </h2>
                  <p className="text-[10px] text-brand-textMuted">
                    Options customers can select during checkout (e.g. lube types, switch films)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase transition-colors"
                >
                  ➕ Add Option
                </button>
              </div>

              {options.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No add-ons configured. Customers will pay standard base price.
                </p>
              ) : (
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="p-3 bg-brand-lightBg border border-slate-300 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 text-xs"
                    >
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Option Name (e.g. Durock 0.3mm Films)"
                          value={opt.optionName}
                          onChange={(e) => handleUpdateOption(opt.id, "optionName", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-400 text-xs font-mono focus:outline-none focus:border-brand-navy"
                        />
                      </div>

                      <div className="w-full sm:w-36">
                        <select
                          value={opt.optionType}
                          onChange={(e) => handleUpdateOption(opt.id, "optionType", e.target.value as ServiceOptionType)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-400 text-[11px] font-mono focus:outline-none"
                        >
                          <option value="LUBE_TYPE">Lube Type</option>
                          <option value="ADDON_SERVICE">Addon Service</option>
                          <option value="NEW_SWITCH">New Switch</option>
                          <option value="FOAM_TYPE">Foam Type</option>
                        </select>
                      </div>

                      <div className="w-full sm:w-32 flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold">+Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={opt.extraPrice}
                          onChange={(e) => handleUpdateOption(opt.id, "extraPrice", Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-2 py-1.5 bg-white border border-slate-400 text-xs font-mono focus:outline-none text-right"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-red-600 hover:text-red-800 p-1.5 font-bold uppercase text-xs"
                        title="Delete option"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/modder/dashboard">
                <Button type="button" variant="secondary" className="text-xs uppercase font-bold">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={loading} className="text-xs uppercase font-bold">
                {loading ? "Publishing to Marketplace..." : "🚀 Publish Service Listing →"}
              </Button>
            </div>
          </form>

          {/* Live Card Preview Column (1 col) */}
          <div className="space-y-4">
            <div className="sticky top-24">
              <span className="block text-xs font-bold uppercase text-brand-navy mb-2">
                👁️ Live Marketplace Preview:
              </span>

              <div className="bg-white border-2 border-slate-900 p-5 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-brand-navy bg-brand-lightBg text-brand-navy">
                    {category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    📍 {currentUser.locationCity || "Jakarta"}
                  </span>
                </div>

                {/* Cover Photo Preview */}
                <div className="h-36 bg-brand-lightBg overflow-hidden border border-slate-300 mb-3 relative group">
                  <img
                    src={imageUrl || getCategoryFallbackImage(category)}
                    alt={title || "Service Preview"}
                    className="w-full h-full object-cover"
                  />
                  {imageUrl && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] px-1.5 py-0.5 font-mono font-bold">
                      ✓ Custom Photo
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-brand-textMain mb-2 leading-tight">
                  {title || "Untitled Tuning Service"}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {description || "Service procedure and specifications will appear here..."}
                </p>

                <div className="p-3 bg-brand-lightBg border border-slate-200 mb-4">
                  <div className="text-[10px] uppercase text-brand-textMuted">Base Price</div>
                  <div className="text-lg font-bold text-brand-navy">
                    Rp {Number(basePrice || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    ✓ Escrow Protected Payout
                  </div>
                </div>

                {options.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Available Options ({options.length}):
                    </span>
                    <div className="space-y-1">
                      {options.slice(0, 3).map((opt, i) => (
                        <div key={i} className="text-[10px] text-slate-700 flex justify-between">
                          <span className="truncate max-w-[150px]">• {opt.optionName || "Custom Option"}</span>
                          <span className="font-bold text-slate-900">+Rp {opt.extraPrice.toLocaleString()}</span>
                        </div>
                      ))}
                      {options.length > 3 && (
                        <div className="text-[9px] text-slate-400">+{options.length - 3} more options</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold">By @{currentUser.name}</span>
                  <span className="text-amber-500 font-bold">★ 5.0</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-[11px] text-amber-900 leading-snug">
                💡 <strong>Instant Marketplace Sync:</strong> When published, this listing will be immediately discoverable by keyboard enthusiasts on the <strong>Services Catalog</strong> and <strong>Marketplace</strong> pages!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
