"use client";
import { Button } from "@/components/Button";
import { useState } from "react";

// Sample data following the design guidelines with real images
const serviceListings = [
  {
    id: 1,
    type: 'service',
    title: 'Linear Switch Lubing & Filming',
    provider: '@DexterKeyboards',
    rating: 4.9,
    pricing: 'Rp 3,500 / switch',
    badge: 'SERVICE',
    badgeColor: 'bg-brand-lightBg text-brand-navy border-brand-navy',
    image: '/images/lubing-swtiches.webp',
    buttonText: 'Book Service'
  },
  {
    id: 2,
    type: 'service', 
    title: 'Stabilizer Tuning & Band-Aid Mod',
    provider: '@KeyboardClinic',
    rating: 4.8,
    pricing: 'From Rp 150,000',
    badge: 'SERVICE',
    badgeColor: 'bg-brand-lightBg text-brand-navy border-brand-navy',
    image: '/images/stabs.webp',
    buttonText: 'Book Service'
  },
  {
    id: 3,
    type: 'service',
    title: 'Custom Plate Foam Installation', 
    provider: '@ModHouse',
    rating: 4.7,
    pricing: 'Rp 75,000 / board',
    badge: 'SERVICE',
    badgeColor: 'bg-brand-lightBg text-brand-navy border-brand-navy',
    image: '/images/foam.jpg',
    buttonText: 'View Details'
  }
];

const productListings = [
  {
    id: 4,
    type: 'product',
    title: '70x Pre-Lubed Gateron V1 Switches',
    provider: '@DexterKeyboards',
    rating: 4.9,
    pricing: 'Rp 450,000',
    badge: 'READY STOCK',
    badgeColor: 'bg-green-50 text-green-700 border-green-600',
    image: '/images/switches.jpg',
    buttonText: 'Add to Cart'
  },
  {
    id: 5,
    type: 'product',
    title: 'Hand-lubed Cherry MX Black (x87)',
    provider: '@SwitchMaster',
    rating: 4.9,
    pricing: 'Rp 520,000',
    badge: 'READY STOCK', 
    badgeColor: 'bg-green-50 text-green-700 border-green-600',
    image: '/images/switches.jpg',
    buttonText: 'Add to Cart'
  },
  {
    id: 6,
    type: 'product',
    title: 'Custom Artisan Cable - Coiled',
    provider: '@CableWorks',
    rating: 4.8,
    pricing: 'Rp 320,000',
    badge: 'ITEM',
    badgeColor: 'bg-green-50 text-green-700 border-green-600', 
    image: '/images/prebuilt-kb.webp',
    buttonText: 'Add to Cart'
  }
];

const categories = [
  { name: "Lubing & Tuning", count: 24, description: "Switch and stabilizer services" },
  { name: "Custom Pre-builts", count: 18, description: "Ready-to-use keyboards" }, 
  { name: "Lubed Switches & Parts", count: 32, description: "Components and modifications" },
  { name: "Soldering/Repair", count: 12, description: "PCB and component repair" },
];

const topModders = [
  { name: "@DexterKeyboards", location: "Jakarta Selatan", specialty: "Linear Switch Specialist", rating: 4.9, jobs: 127 },
  { name: "@KeyboardClinic", location: "Bandung", specialty: "Stabilizer Tuning Expert", rating: 4.8, jobs: 89 },
  { name: "@ModHouse", location: "Surabaya", specialty: "Custom Builds & Mods", rating: 4.7, jobs: 156 },
  { name: "@SwitchMaster", location: "Yogyakarta", specialty: "Lubing & Filming", rating: 4.9, jobs: 203 },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Full-Width Hero Section */}
      <div className="w-full relative h-[480px] bg-gradient-to-r from-brand-navy/90 to-brand-navy/70 flex items-center border-b-2 border-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: `url('/images/hero.jpg')`
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white w-full">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find Expert Modders &
            <span className="block">Premium Components</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 font-medium">
            Connect with skilled modders and discover premium switches, keycaps, and custom builds
          </p>
          
          {/* Sharp Big Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex">
              <input 
                type="text"
                placeholder="Search modders, services, switches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3.5 pr-28 text-base border-2 border-slate-900 focus:border-brand-navy focus:outline-none bg-white text-brand-textMain placeholder:text-brand-textMuted font-mono"
              />
              <a 
                href="/search" 
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-brand-terracotta text-white px-5 py-2 hover:bg-opacity-90 transition-colors font-mono font-bold text-xs uppercase tracking-wider border-2 border-brand-terracotta"
              >
                Search
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Centered Max-Width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Sharp Boxes Section */}
        <div className="text-center mb-16 pt-12">
          <h2 className="text-2xl font-bold text-brand-textMain mb-2">Browse by Category</h2>
          <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mb-8">Selected Modding Specializations</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const categoryIcons = [
                '/images/lubing-swtiches.webp', // Lubing & Tuning
                '/images/prebuilt-kb.webp', // Custom Pre-builts
                '/images/switches.jpg', // Lubed Switches & Parts
                '/images/repair-kb.png'  // Soldering/Repair
              ];
              
              return (
                <div key={category.name} className="bg-brand-sidebar border-2 border-slate-900 p-5 flex flex-col items-center group cursor-pointer hover:border-brand-navy hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-brand-lightBg border-2 border-slate-800 flex items-center justify-center group-hover:border-brand-navy transition-colors mb-4 overflow-hidden">
                    <img 
                      src={categoryIcons[index]} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-brand-textMain group-hover:text-brand-navy text-center mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-brand-textMuted text-center font-mono">({category.count} items)</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Top Rated Modders Near You */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-brand-textMain">Top Rated Modders Near You</h2>
              <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted">Skilled craftsmen verified in your area</p>
            </div>
            <a href="/modders" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-navy hover:underline">View all →</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topModders.map((modder) => (
              <div key={modder.name} className="bg-brand-sidebar border-2 border-slate-900 p-6 hover:shadow-lg transition-all hover:border-brand-navy group">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-lightBg border-2 border-slate-900 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-brand-navy">{modder.name.charAt(1)}</span>
                  </div>
                  <h3 className="font-bold text-brand-textMain group-hover:text-brand-navy transition-colors">{modder.name}</h3>
                  <p className="text-xs font-mono text-brand-textMuted mb-1">{modder.location}</p>
                  <p className="text-xs text-brand-terracotta font-semibold mb-3">{modder.specialty}</p>
                  <div className="flex items-center justify-center gap-1 font-mono text-xs border-t border-slate-200 pt-3">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-slate-800">{modder.rating}</span>
                    <span className="text-brand-textMuted">({modder.jobs} jobs)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Popular Modding Services */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-brand-textMain">Popular Modding Services</h2>
              <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted">Professional keyboard modification services</p>
            </div>
            <a href="#" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-navy hover:underline">View all →</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceListings.map((service) => (
              <ServiceCard key={service.id} listing={service} />
            ))}
          </div>
        </div>

        {/* Section 4: Marketplace / Ready Stock Items */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-brand-textMain">Marketplace / Ready Stock Items</h2>
              <p className="text-xs font-mono uppercase tracking-wider text-brand-textMuted">Hand-lubed switches, custom artisan cables, built-to-order mechanical keyboards</p>
            </div>
            <a href="#" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-navy hover:underline">View all →</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productListings.map((product) => (
              <ProductCard key={product.id} listing={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Card Component with sharp 2px box and font styling
function ServiceCard({ listing }: { listing: any }) {
  return (
    <div className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Top Badge */}
        <div className="p-4 pb-2">
          <span className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 ${listing.badgeColor}`}>
            [ {listing.badge} ]
          </span>
        </div>
        
        {/* Image Area */}
        <div className="px-4 pb-2">
          <div className="h-36 bg-brand-lightBg overflow-hidden border border-slate-300">
            <img 
              src={listing.image} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 pt-2">
          <h3 className="font-bold text-base text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
            {listing.title}
          </h3>
          <p className="text-xs font-mono text-brand-textMuted mb-3">
            by {listing.provider} ({listing.rating}★)
          </p>
          <p className="text-lg font-mono font-bold text-brand-navy mb-4">
            {listing.pricing}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <a href={`/service/${listing.id}`} className="block w-full">
          <Button variant="primary" isLoading={false} className="w-full">
            {listing.buttonText} →
          </Button>
        </a>
      </div>
    </div>
  );
}

// Product Card Component with sharp 2px box and font styling
function ProductCard({ listing }: { listing: any }) {
  return (
    <div className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Top Badge */}
        <div className="p-4 pb-2">
          <span className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 ${listing.badgeColor}`}>
            [ {listing.badge} ]
          </span>
        </div>
        
        {/* Image Area */}
        <div className="px-4 pb-2">
          <div className="h-36 bg-brand-lightBg overflow-hidden border border-slate-300">
            <img 
              src={listing.image} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 pt-2">
          <h3 className="font-bold text-base text-brand-textMain mb-1.5 group-hover:text-brand-navy transition-colors">
            {listing.title}
          </h3>
          <p className="text-xs font-mono text-brand-textMuted mb-3">
            by {listing.provider} ({listing.rating}★)
          </p>
          <p className="text-lg font-mono font-bold text-brand-navy mb-4">
            {listing.pricing}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <a href={`/product/${listing.id}`} className="block w-full">
          <Button variant="primary" isLoading={false} className="w-full">
            {listing.buttonText} →
          </Button>
        </a>
      </div>
    </div>
  );
}