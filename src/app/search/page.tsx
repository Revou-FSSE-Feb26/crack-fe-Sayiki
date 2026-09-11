"use client";
import { Button } from "@/components/Button";
import { useState } from "react";

// Combined data for search results with real images
const allResults = [
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
    buttonText: 'Book Service',
    searchTerm: 'linear'
  },
  {
    id: 2,
    type: 'product',
    title: '70x Pre-Lubed Gateron Linear V1',
    provider: '@DexterKeyboards',
    rating: 4.9,
    pricing: 'Rp 450,000',
    badge: 'READY STOCK',
    badgeColor: 'bg-green-100 text-green-800',
    image: '/images/switches.jpg',
    buttonText: 'Add to Cart',
    searchTerm: 'linear'
  },
  {
    id: 3,
    type: 'service',
    title: 'Custom Linear Switch Build Service',
    provider: '@KeyboardClinic',
    rating: 4.8,
    pricing: 'From Rp 200,000',
    badge: 'SERVICE',
    badgeColor: 'bg-brand-lightBg text-brand-navy border-brand-navy',
    image: '/images/prebuilt-kb.webp',
    buttonText: 'View Details',
    searchTerm: 'linear'
  },
  {
    id: 4,
    type: 'product',
    title: 'Hand-lubed Linear Gateron Yellows (x87)',
    provider: '@SwitchMaster',
    rating: 4.9,
    pricing: 'Rp 520,000',
    badge: 'READY STOCK',
    badgeColor: 'bg-green-100 text-green-800',
    image: '/images/switches.jpg',
    buttonText: 'Add to Cart',
    searchTerm: 'linear'
  }
];

type FilterType = 'all' | 'services' | 'ready-stock';

export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchInput, setSearchInput] = useState("Linear");

  const filteredResults = allResults.filter(item => {
    const matchesFilter = activeFilter === 'services' ? item.type === 'service' : activeFilter === 'ready-stock' ? item.type === 'product' : true;
    const matchesQuery = !searchInput || item.title.toLowerCase().includes(searchInput.toLowerCase()) || item.provider.toLowerCase().includes(searchInput.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ READY STOCK & SERVICES ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Marketplace Directory
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Hand-Lubed Switches • Custom Cables • Pre-built Keyboards & Tuning
              </p>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Available Items</div>
                <div className="text-xl font-mono font-bold text-brand-navy">{allResults.length} Listed</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Verified Stores</div>
                <div className="text-xl font-mono font-bold text-brand-navy">12 Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar Container */}
        <div className="max-w-2xl mb-8">
          <div className="relative flex">
            <input 
              type="text"
              placeholder="Search components, switches, services..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-5 py-3.5 pr-28 text-sm border-2 border-slate-900 focus:border-brand-navy focus:outline-none bg-white text-brand-textMain placeholder:text-brand-textMuted font-mono"
            />
            <button 
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-brand-navy text-white px-5 py-2 hover:bg-[#132856] transition-colors font-mono font-bold text-xs uppercase tracking-wider border-2 border-brand-navy"
            >
              Search
            </button>
          </div>
        </div>

        {/* Segmented Control / Tab Filter */}
        <div className="mb-8">
          <div className="inline-flex bg-brand-sidebar border-2 border-slate-900 p-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                activeFilter === 'all'
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'text-brand-textMuted border-transparent hover:text-brand-textMain'
              }`}
            >
              All Results ({allResults.length})
            </button>
            <button
              onClick={() => setActiveFilter('services')}
              className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                activeFilter === 'services'
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'text-brand-textMuted border-transparent hover:text-brand-textMain'
              }`}
            >
              Services ({allResults.filter(i => i.type === 'service').length})
            </button>
            <button
              onClick={() => setActiveFilter('ready-stock')}
              className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                activeFilter === 'ready-stock'
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'text-brand-textMuted border-transparent hover:text-brand-textMain'
              }`}
            >
              Ready Stock ({allResults.filter(i => i.type === 'product').length})
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((item) => (
            <ResultCard key={item.id} listing={item} />
          ))}
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-textMuted text-lg mb-4 font-mono">
              No {activeFilter === 'services' ? 'services' : activeFilter === 'ready-stock' ? 'products' : 'results'} found for "{searchInput}"
            </p>
            <Button variant="secondary" isLoading={false} className="inline-block w-auto">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Unified Result Card Component
function ResultCard({ listing }: { listing: any }) {
  return (
    <div className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Top Badge */}
        <div className="p-4 pb-2">
          <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-slate-900 bg-slate-100 text-slate-800">
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
        <Button variant="primary" isLoading={false} className="w-full">
          {listing.buttonText} →
        </Button>
      </div>
    </div>
  );
}