"use client";
import { Button } from "@/components/Button";
import { useState } from "react";

// Sample modder data with rich profile information
const moddersData = [
  {
    id: 1,
    username: '@DexterKeyboards',
    displayName: 'DexterKeyboards',
    avatar: '/images/lubing-swtiches.webp',
    status: 'accepting', // accepting, queue_full, on_break
    rating: 4.9,
    totalOrders: 142,
    location: {
      city: 'Depok',
      province: 'West Java'
    },
    specialties: ['Lubing & Tuning', 'Solder', 'Stabilizers'],
    lubingStyle: 'Hand-Lubed (Krytox)',
    equipment: ['Soldering Iron', 'Ultrasonic Cleaner', 'Switch Opener'],
    turnaroundTime: 'Standard (3-5 days)',
    soundTest: {
      title: 'Neo80 Linear Build',
      duration: '0:45'
    },
    isVerified: true,
    isPro: true
  },
  {
    id: 2,
    username: '@ClackSmiths',
    displayName: 'ClackSmiths',
    avatar: '/images/stabs.webp',
    status: 'accepting',
    rating: 4.8,
    totalOrders: 89,
    location: {
      city: 'Bandung',
      province: 'West Java'
    },
    specialties: ['Lubing & Tuning', 'Hall Effect/HE'],
    lubingStyle: 'Hand-Lubed (Tribosys)',
    equipment: ['Hall Effect Tester', 'Switch Films'],
    turnaroundTime: 'Express (1-2 days)',
    soundTest: {
      title: 'Wooting HE Build',
      duration: '1:12'
    },
    isVerified: true,
    isPro: false
  },
  {
    id: 3,
    username: '@KeyboardClinic',
    displayName: 'Keyboard Clinic',
    avatar: '/images/repair-kb.png',
    status: 'queue_full',
    rating: 4.7,
    totalOrders: 203,
    location: {
      city: 'Jakarta',
      province: 'DKI Jakarta'
    },
    specialties: ['Solder/Desolder', 'Repair', 'Stabilizers'],
    lubingStyle: 'Machine-Lubed',
    equipment: ['Desoldering Station', 'PCB Repair Kit', 'Hotswap Sockets'],
    turnaroundTime: 'Standard (5-7 days)',
    soundTest: {
      title: 'Restored Vintage AT101',
      duration: '0:38'
    },
    isVerified: true,
    isPro: true
  },
  {
    id: 4,
    username: '@SwitchMaster',
    displayName: 'SwitchMaster',
    avatar: '/images/switches.jpg',
    status: 'accepting',
    rating: 4.9,
    totalOrders: 156,
    location: {
      city: 'Yogyakarta',
      province: 'Special Region of Yogyakarta'
    },
    specialties: ['Lubing & Tuning', 'Custom Builds'],
    lubingStyle: 'Hand-Lubed (Krytox)',
    equipment: ['Switch Opener', 'Lube Station', 'Films Collection'],
    turnaroundTime: 'Express (2-3 days)',
    soundTest: {
      title: 'Tactile Perfection',
      duration: '0:52'
    },
    isVerified: true,
    isPro: false
  },
  {
    id: 5,
    username: '@ModHouse',
    displayName: 'ModHouse',
    avatar: '/images/prebuilt-kb.webp',
    status: 'on_break',
    rating: 4.6,
    totalOrders: 67,
    location: {
      city: 'Surabaya',
      province: 'East Java'
    },
    specialties: ['Custom Builds', 'Foam Mods'],
    lubingStyle: 'Hand-Lubed (205g0)',
    equipment: ['Foam Cutting Tools', 'Case Mods'],
    turnaroundTime: 'Standard (4-6 days)',
    soundTest: {
      title: 'Gasket Mount Perfection',
      duration: '1:05'
    },
    isVerified: false,
    isPro: false
  },
  {
    id: 6,
    username: '@TactileTuner',
    displayName: 'Tactile Tuner',
    avatar: '/images/lubing-swtiches.webp',
    status: 'accepting',
    rating: 4.8,
    totalOrders: 94,
    location: {
      city: 'Medan',
      province: 'North Sumatra'
    },
    specialties: ['Lubing & Tuning', 'Tactile Specialists'],
    lubingStyle: 'Hand-Lubed (Tribosys)',
    equipment: ['Tactile Switch Collection', 'Precision Tools'],
    turnaroundTime: 'Standard (3-5 days)',
    soundTest: {
      title: 'Holy Panda Perfection',
      duration: '0:41'
    },
    isVerified: true,
    isPro: false
  }
];

type FilterState = {
  location: string[];
  specialties: string[];
  status: string[];
  lubingStyle: string[];
  equipment: string[];
  turnaroundTime: string[];
}

export default function ModdersDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    specialties: [],
    status: [],
    lubingStyle: [],
    equipment: [],
    turnaroundTime: []
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const locations = ['Depok', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Medan'];
  const specialties = ['Lubing & Tuning', 'Soldering', 'Hall Effect/HE', 'Solder/Desolder', 'Repair', 'Stabilizers', 'Custom Builds', 'Foam Mods'];
  const statuses = ['Accepting Work', 'Queue Full', 'On Break'];
  const lubingStyles = ['Hand-Lubed (Krytox)', 'Hand-Lubed (Tribosys)', 'Hand-Lubed (205g0)', 'Machine-Lubed'];
  const equipmentOptions = ['Soldering Iron', 'Ultrasonic Cleaner', 'Hall Effect Tester', 'Desoldering Station', 'Switch Opener'];
  const turnaroundOptions = ['Express (1-2 days)', 'Express (2-3 days)', 'Standard (3-5 days)', 'Standard (4-6 days)', 'Standard (5-7 days)'];

  const filteredModders = moddersData.filter(modder => {
    const matchesSearch = modder.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         modder.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         modder.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = filters.location.length === 0 || filters.location.includes(modder.location.city);
    const matchesSpecialties = filters.specialties.length === 0 || filters.specialties.some(spec => modder.specialties.includes(spec));
    const matchesStatus = filters.status.length === 0 || filters.status.includes(getStatusLabel(modder.status));
    const matchesLubingStyle = filters.lubingStyle.length === 0 || filters.lubingStyle.includes(modder.lubingStyle);
    const matchesEquipment = filters.equipment.length === 0 || filters.equipment.some(eq => modder.equipment.includes(eq));
    const matchesTurnaround = filters.turnaroundTime.length === 0 || filters.turnaroundTime.includes(modder.turnaroundTime);

    return matchesSearch && matchesLocation && matchesSpecialties && matchesStatus && matchesLubingStyle && matchesEquipment && matchesTurnaround;
  });

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header */}
      <div className="bg-brand-sidebar border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <nav className="text-sm text-brand-textMuted mb-4">
            <a href="/" className="hover:text-brand-navy">Home</a> &gt; 
            <span className="text-brand-textMain"> Find a Modder</span>
          </nav>
          
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="Search modders by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 text-lg border-2 border-brand-border rounded-xl focus:border-brand-navy focus:outline-none bg-brand-sidebar text-brand-textMain placeholder:text-brand-textMuted"
              />
            </div>
            <Button 
              variant="secondary" 
              isLoading={false} 
              className="lg:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* SIDEBAR FILTERS */}
          <div className={`lg:w-80 lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:static fixed inset-0 lg:inset-auto bg-brand-lightBg lg:bg-transparent z-50 lg:z-auto p-4 lg:p-0`}>
            <div className="bg-brand-sidebar rounded-lg border border-brand-border p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg font-bold text-brand-textMain">SIDEBAR FILTERS</h2>
                <Button 
                  variant="secondary" 
                  isLoading={false} 
                  className="lg:hidden text-sm px-3 py-1"
                  onClick={() => setShowMobileFilters(false)}
                >
                  ✕
                </Button>
              </div>
              
              <FilterSection 
                title="Location" 
                options={locations} 
                selected={filters.location}
                onChange={(value) => handleFilterChange('location', value)}
              />
              
              <FilterSection 
                title="Specialties" 
                options={specialties} 
                selected={filters.specialties}
                onChange={(value) => handleFilterChange('specialties', value)}
              />
              
              <FilterSection 
                title="Status" 
                options={statuses} 
                selected={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              />
              
              <FilterSection 
                title="Lubing Style" 
                options={lubingStyles} 
                selected={filters.lubingStyle}
                onChange={(value) => handleFilterChange('lubingStyle', value)}
              />
              
              <FilterSection 
                title="Equipment" 
                options={equipmentOptions} 
                selected={filters.equipment}
                onChange={(value) => handleFilterChange('equipment', value)}
              />
              
              <FilterSection 
                title="Turnaround Time" 
                options={turnaroundOptions} 
                selected={filters.turnaroundTime}
                onChange={(value) => handleFilterChange('turnaroundTime', value)}
              />
            </div>
          </div>

          {/* MODDER RESULTS */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-brand-textMain">
                MODDER RESULTS (Showing {filteredModders.length} modders)
              </h1>
            </div>
            
            {/* Modder Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModders.map((modder) => (
                <ModderCard key={modder.id} modder={modder} />
              ))}
            </div>

            {filteredModders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-brand-textMuted text-lg">No modders found matching your criteria.</p>
                <Button 
                  variant="secondary" 
                  isLoading={false} 
                  className="mt-4"
                  onClick={() => {
                    setFilters({
                      location: [],
                      specialties: [],
                      status: [],
                      lubingStyle: [],
                      equipment: [],
                      turnaroundTime: []
                    });
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get status labels
function getStatusLabel(status: string): string {
  const statusMap = {
    'accepting': 'Accepting Work',
    'queue_full': 'Queue Full',
    'on_break': 'On Break'
  };
  return statusMap[status as keyof typeof statusMap] || status;
}

// Filter Section Component
function FilterSection({ title, options, selected, onChange }: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-brand-textMain mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="mr-2 rounded"
            />
            <span className="text-sm text-brand-textMain">[ ] {option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Modder Card Component
function ModderCard({ modder }: { modder: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepting': return 'bg-green-100 text-green-800';
      case 'queue_full': return 'bg-yellow-100 text-yellow-800';
      case 'on_break': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepting': return '●';
      case 'queue_full': return '●';
      case 'on_break': return '●';
      default: return '●';
    }
  };

  return (
    <div className="bg-brand-sidebar border border-brand-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-brand-navy group">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-3">
          <div className="relative">
            <img 
              src={modder.avatar} 
              alt={modder.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-border"
            />
            {modder.isVerified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-brand-textMain group-hover:text-brand-navy transition-colors">
                {modder.username}
              </h3>
              {modder.isPro && (
                <span className="px-2 py-0.5 bg-brand-navy text-white text-xs font-bold rounded">[PRO]</span>
              )}
            </div>
            <p className="text-sm text-brand-textMuted mb-2">{modder.location.city}, {modder.location.province}</p>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(modder.status)}`}>
                <span>{getStatusIcon(modder.status)}</span>
                {getStatusLabel(modder.status)}
              </span>
            </div>

            {/* Trust Score */}
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-bold text-brand-textMain">{modder.rating}</span>
              <span className="text-brand-textMuted text-sm">({modder.totalOrders}+ orders)</span>
            </div>
          </div>
        </div>

        {/* Specialty Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {modder.specialties.map((specialty, index) => (
            <span key={index} className="px-2 py-1 bg-brand-lightBg text-brand-textMain text-xs rounded border">
              [{specialty}]
            </span>
          ))}
        </div>
      </div>

      {/* Body Section - Recent Work/Sound Test */}
      <div className="px-6 pb-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-brand-textMain mb-2">Recent Work / Audio clip</p>
          <div className="flex items-center gap-2 p-3 bg-brand-lightBg rounded border">
            <button className="w-8 h-8 bg-brand-navy text-white rounded-full flex items-center justify-center hover:bg-brand-navy/90">
              ▶
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-textMain">[▶ Sound Test: {modder.soundTest.title}]</p>
              <p className="text-xs text-brand-textMuted">{modder.soundTest.duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-6 pb-6">
        <a href={`/modder/${modder.id}`} className="block w-full">
          <Button variant="primary" isLoading={false} className="w-full">
            [ View Profile ]
          </Button>
        </a>
      </div>
    </div>
  );
}