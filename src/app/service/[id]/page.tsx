"use client";
import { Button } from "@/components/Button";
import { useState } from "react";

// Sample service data
const serviceData = {
  id: 1,
  type: 'service',
  title: 'Linear Switch Lubing & Filming',
  provider: '@DexterKeyboards',
  rating: 4.9,
  reviewCount: 127,
  badge: 'SERVICE',
  basePrice: 3500,
  priceUnit: 'per switch',
  image: '/images/lubing-swtiches.webp',
  gallery: [
    '/images/lubing-swtiches.webp',
    '/images/switches.jpg',
    '/images/stabs.webp'
  ],
  description: 'Professional switch lubing and filming service using premium lubricants. Each switch is hand-lubed for optimal smoothness and consistency.',
  modderProfile: {
    name: 'DexterKeyboards',
    location: 'Jakarta Selatan',
    specialty: 'Linear Switch Specialist',
    completedJobs: 127,
    equipment: ['Krytox 205g0', 'Tribosys 3203', 'Kelowna switch openers']
  },
  process: [
    'Book & Pay (Held in Escrow)',
    'Ship your board/parts to the modder',
    'Modder works & sends sound test',
    'Shipped back & funds released'
  ]
};

export default function ServiceDetailPage() {
  const [switchType, setSwitchType] = useState('linear');
  const [switchCount, setSwitchCount] = useState(70);
  const [addFilms, setAddFilms] = useState(false);
  const [tuneStabs, setTuneStabs] = useState(false);

  const calculateTotal = () => {
    let total = serviceData.basePrice * switchCount;
    if (addFilms) total += 1000 * switchCount; // +Rp 1,000 per switch for films
    if (tuneStabs) total += 50000; // +Rp 50,000 flat for stab tuning
    return total;
  };

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Breadcrumbs */}
      <div className="bg-brand-sidebar border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-brand-textMuted">
            <a href="/" className="hover:text-brand-navy">Home</a> &gt; 
            <a href="#" className="hover:text-brand-navy"> {serviceData.provider}</a> &gt; 
            <span className="text-brand-textMain"> {serviceData.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT COLUMN (60% width) - Visuals and Information */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Main Image Gallery */}
            <div className="bg-brand-sidebar rounded-lg overflow-hidden border border-brand-border">
              <img 
                src={serviceData.image} 
                alt={serviceData.title}
                className="w-full h-80 object-cover"
              />
              <div className="p-4">
                <div className="flex gap-2">
                  {serviceData.gallery.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`Gallery ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border border-brand-border cursor-pointer hover:border-brand-navy"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded">
                  [ {serviceData.badge} ]
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium">{serviceData.rating}</span>
                  <span className="text-brand-textMuted">({serviceData.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-brand-textMain">{serviceData.title}</h1>
              <p className="text-lg text-brand-textMuted mt-2">{serviceData.description}</p>
            </div>

            {/* Modder Profile Card */}
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-brand-navy rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{serviceData.modderProfile.name.charAt(1)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-textMain">{serviceData.modderProfile.name}</h3>
                  <p className="text-brand-textMuted">{serviceData.modderProfile.location}</p>
                  <p className="text-brand-terracotta text-sm">{serviceData.modderProfile.specialty}</p>
                </div>
                <Button variant="secondary" isLoading={false} className="ml-auto">
                  Chat with Modder
                </Button>
              </div>
              <p className="text-sm text-brand-textMuted mb-2">
                <strong>Equipment:</strong> {serviceData.modderProfile.equipment.join(', ')}
              </p>
            </div>

            {/* Process Accordion */}
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
              <h3 className="font-semibold text-brand-textMain mb-4">How the Process Works</h3>
              <div className="space-y-3">
                {serviceData.process.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-brand-navy text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-brand-textMain">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews & Portfolio */}
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
              <h3 className="font-semibold text-brand-textMain mb-4">Recent Work & Reviews</h3>
              <p className="text-brand-textMuted">Portfolio shots and customer reviews would go here...</p>
            </div>
          </div>

          {/* RIGHT COLUMN (40% width) - Service Booking Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
                <h2 className="text-xl font-bold text-brand-textMain mb-1">SERVICE BOOKING</h2>
                <p className="text-brand-textMuted mb-6">Base Price: Rp {serviceData.basePrice.toLocaleString()} / switch</p>
                
                {/* 1. Select Switch Type */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-3">1. Select Switch Type</label>
                  <div className="flex gap-3">
                    {['linear', 'tactile', 'clicky'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="switchType"
                          value={type}
                          checked={switchType === type}
                          onChange={(e) => setSwitchType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Number of Switches */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-3">2. Number of Switches</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSwitchCount(Math.max(1, switchCount - 1))}
                      className="w-8 h-8 bg-brand-border rounded flex items-center justify-center text-brand-textMain hover:bg-brand-navy hover:text-white"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg">{switchCount}</span>
                    <button 
                      onClick={() => setSwitchCount(switchCount + 1)}
                      className="w-8 h-8 bg-brand-border rounded flex items-center justify-center text-brand-textMain hover:bg-brand-navy hover:text-white"
                    >
                      +
                    </button>
                    <span className="text-brand-textMuted ml-2">(Total Base: Rp {(serviceData.basePrice * switchCount).toLocaleString()})</span>
                  </div>
                </div>

                {/* 3. Add-ons */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-3">3. Add-ons (Optional)</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={addFilms}
                        onChange={(e) => setAddFilms(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Add Switch Films (+Rp 1,000/pc)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tuneStabs}
                        onChange={(e) => setTuneStabs(e.target.checked)}
                        className="mr-2"
                      />
                      <span>Tune Stabilizers (+Rp 50,000 flat)</span>
                    </label>
                  </div>
                </div>

                {/* 4. Queue Estimate */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-2">4. Queue Estimate: 3-5 Days</label>
                </div>

                {/* Total & Book Button */}
                <div className="border-t border-brand-border pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-brand-textMain">Estimated Total:</span>
                    <span className="text-xl font-bold text-brand-navy">Rp {calculateTotal().toLocaleString()}</span>
                  </div>
                  <Button variant="primary" isLoading={false} className="w-full text-lg py-3">
                    [ Book Service (Escrow) ]
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}