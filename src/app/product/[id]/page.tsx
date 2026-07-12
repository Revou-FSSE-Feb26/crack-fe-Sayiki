"use client";
import { Button } from "@/components/Button";
import { useState } from "react";

// Sample product data
const productData = {
  id: 4,
  type: 'product',
  title: '70x Pre-Lubed Gateron V1 Switches',
  provider: '@DexterKeyboards',
  rating: 4.9,
  reviewCount: 89,
  badge: 'READY STOCK',
  price: 450000,
  image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  gallery: [
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1714205/pexels-photo-1714205.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  ],
  description: 'Premium pre-lubed Gateron linear switches. Hand-lubed with Krytox 205g0 for buttery smooth keystrokes. Perfect for gaming and typing.',
  condition: 'Brand New',
  specifications: {
    switchType: 'Linear',
    springWeight: '62g bottom out',
    housingMaterial: 'Nylon',
    stemMaterial: 'POM',
    actuation: '2.0mm',
    travel: '4.0mm'
  },
  variations: [
    { name: '70x Pack', price: 450000, stock: 3 },
    { name: '90x Pack', price: 550000, stock: 2 },
    { name: '110x Pack', price: 650000, stock: 1 }
  ],
  shippingOptions: ['Instant', 'Same Day', 'Regular']
};

export default function ProductDetailPage() {
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState('Regular');

  const currentVariation = productData.variations[selectedVariation];
  const subtotal = currentVariation.price * quantity;

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Breadcrumbs */}
      <div className="bg-brand-sidebar border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-brand-textMuted">
            <a href="/" className="hover:text-brand-navy">Home</a> &gt; 
            <a href="#" className="hover:text-brand-navy"> {productData.provider}</a> &gt; 
            <span className="text-brand-textMain"> {productData.title}</span>
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
                src={productData.image} 
                alt={productData.title}
                className="w-full h-80 object-cover"
              />
              <div className="p-4">
                <div className="flex gap-2">
                  {productData.gallery.map((img, index) => (
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
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                  [ {productData.badge} ]
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                  {productData.condition}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium">{productData.rating}</span>
                  <span className="text-brand-textMuted">({productData.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-brand-textMain">{productData.title}</h1>
              <p className="text-lg text-brand-textMuted mt-2">{productData.description}</p>
            </div>

            {/* Item Specs Table */}
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
              <h3 className="font-semibold text-brand-textMain mb-4">Item Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(productData.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-brand-textMuted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-brand-textMain font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Tag */}
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
              <h3 className="font-semibold text-brand-textMain mb-4">Condition & Quality</h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded">
                  {productData.condition}
                </span>
                <p className="text-brand-textMuted">
                  These switches are brand new, hand-lubed by our expert modders using premium Krytox 205g0 lubricant.
                </p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-navy rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{productData.provider.charAt(1)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-textMain">{productData.provider}</h3>
                  <p className="text-brand-textMuted">Verified Seller</p>
                  <p className="text-brand-terracotta text-sm">Premium Switch Specialist</p>
                </div>
                <Button variant="secondary" isLoading={false} className="ml-auto">
                  View Store
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (40% width) - Product Purchase Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6">
                <h2 className="text-xl font-bold text-brand-textMain mb-1">READY STOCK ITEM</h2>
                <p className="text-2xl font-bold text-brand-navy mb-6">Rp {currentVariation.price.toLocaleString()}</p>
                
                {/* 1. Select Variation */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-3">1. Select Variation</label>
                  <div className="space-y-2">
                    {productData.variations.map((variation, index) => (
                      <label key={index} className="flex items-center justify-between p-3 border rounded cursor-pointer hover:border-brand-navy">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation === index}
                            onChange={() => setSelectedVariation(index)}
                            className="mr-3"
                          />
                          <span>{variation.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">Rp {variation.price.toLocaleString()}</span>
                          <p className="text-xs text-brand-textMuted">Stock: {variation.stock} left</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Quantity */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-3">2. Quantity</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 bg-brand-border rounded flex items-center justify-center text-brand-textMain hover:bg-brand-navy hover:text-white"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg min-w-[3rem] text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(currentVariation.stock, quantity + 1))}
                      className="w-8 h-8 bg-brand-border rounded flex items-center justify-center text-brand-textMain hover:bg-brand-navy hover:text-white"
                    >
                      +
                    </button>
                    <span className="text-brand-textMuted ml-2">(Stock: {currentVariation.stock} packs left)</span>
                  </div>
                </div>

                {/* 3. Shipping Options */}
                <div className="mb-6">
                  <label className="block font-medium text-brand-textMain mb-3">3. Shipping Options</label>
                  <div className="space-y-2">
                    {productData.shippingOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="shipping"
                          value={option}
                          checked={selectedShipping === option}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="mr-2"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Total & Purchase Buttons */}
                <div className="border-t border-brand-border pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-brand-textMain">Subtotal:</span>
                    <span className="text-xl font-bold text-brand-navy">Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="primary" isLoading={false} className="w-full text-lg py-3">
                      [ Add to Cart ]
                    </Button>
                    <Button variant="secondary" isLoading={false} className="w-full text-lg py-3">
                      [ Buy Now ]
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}