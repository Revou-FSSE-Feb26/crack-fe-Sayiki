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
    badgeColor: 'bg-purple-100 text-purple-800',
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
    badgeColor: 'bg-purple-100 text-purple-800',
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
  const searchQuery = "Linear"; // This would come from URL params in a real app

  const filteredResults = allResults.filter(item => {
    if (activeFilter === 'services') return item.type === 'service';
    if (activeFilter === 'ready-stock') return item.type === 'product';
    return true; // 'all' shows everything
  });

  return (
    <div className="min-h-screen bg-brand-lightBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-textMain mb-2">
            Search results for "{searchQuery}"
          </h1>
          <p className="text-brand-textMuted">
            Found {filteredResults.length} results
          </p>
        </div>

        {/* Segmented Control / Tab Filter */}
        <div className="mb-8">
          <div className="inline-flex bg-brand-sidebar border border-brand-border rounded-lg p-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeFilter === 'all'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-brand-textMuted hover:text-brand-textMain'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setActiveFilter('services')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeFilter === 'services'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-brand-textMuted hover:text-brand-textMain'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveFilter('ready-stock')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeFilter === 'ready-stock'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-brand-textMuted hover:text-brand-textMain'
              }`}
            >
              Ready Stock
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
            <p className="text-brand-textMuted text-lg mb-4">
              No {activeFilter === 'services' ? 'services' : activeFilter === 'ready-stock' ? 'products' : 'results'} found for "{searchQuery}"
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
    <div className="bg-brand-sidebar border border-brand-border rounded-lg overflow-hidden hover:shadow-lg transition-all group hover:border-brand-navy">
      {/* Top Badge */}
      <div className="p-4 pb-2">
        <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wide ${listing.badgeColor}`}>
          [ {listing.badge} ]
        </span>
      </div>
      
      {/* Image Area */}
      <div className="px-4 pb-2">
        <div className="h-32 bg-brand-lightBg rounded overflow-hidden border border-brand-border">
          <img 
            src={listing.image} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 pt-2">
        <h3 className="font-semibold text-brand-textMain mb-2 group-hover:text-brand-navy transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-brand-textMuted mb-2">
          by {listing.provider} ({listing.rating}★)
        </p>
        <p className="text-lg font-bold text-brand-navy mb-4">
          {listing.pricing}
        </p>
        <Button variant="primary" isLoading={false} className="w-full">
          [ {listing.buttonText} ]
        </Button>
      </div>
    </div>
  );
}