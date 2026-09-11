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
}

export default function ModdersDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    specialties: [],
    status: [],
    lubingStyle: [],
    equipment: []
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const locations = ['Depok', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Medan'];
  const specialties = ['Lubing & Tuning', 'Soldering', 'Hall Effect/HE', 'Solder/Desolder', 'Repair', 'Stabilizers', 'Custom Builds', 'Foam Mods'];
  const statuses = ['Accepting Work', 'Queue Full', 'On Break'];
  const lubingStyles = ['Hand-Lubed (Krytox)', 'Hand-Lubed (Tribosys)', 'Hand-Lubed (205g0)', 'Machine-Lubed'];
  const equipmentOptions = ['Soldering Iron', 'Ultrasonic Cleaner', 'Hall Effect Tester', 'Desoldering Station', 'Switch Opener'];

  const filteredModders = moddersData.filter(modder => {
    const matchesSearch = modder.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         modder.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         modder.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = filters.location.length === 0 || filters.location.includes(modder.location.city);
    const matchesSpecialties = filters.specialties.length === 0 || filters.specialties.some(spec => modder.specialties.includes(spec));
    const matchesStatus = filters.status.length === 0 || filters.status.includes(getStatusLabel(modder.status));
    const matchesLubingStyle = filters.lubingStyle.length === 0 || filters.lubingStyle.includes(modder.lubingStyle);
    const matchesEquipment = filters.equipment.length === 0 || filters.equipment.some(eq => modder.equipment.includes(eq));

    return matchesSearch && matchesLocation && matchesSpecialties && matchesStatus && matchesLubingStyle && matchesEquipment;
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
      {/* Header Banner */}
      <div className="bg-brand-sidebar border-b-2 border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy mb-2">
                [ VERIFIED CRAFTSMEN DIRECTORY ]
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-brand-textMain tracking-tight">
                Find Expert Modders
              </h1>
              <p className="text-sm font-mono text-brand-textMuted uppercase tracking-wider mt-1">
                Verified Modders • Sound Test Audio Station • Custom Builds
              </p>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-brand-lightBg border-2 border-slate-900 p-4 flex gap-6">
              <div>
                <div className="text-xs font-mono text-brand-textMuted uppercase">Active Modders</div>
                <div className="text-xl font-mono font-bold text-brand-navy">{moddersData.length} Verified</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-6">
                <div className="text-xs font-mono text-brand-textMuted uppercase">Avg Rating</div>
                <div className="text-xl font-mono font-bold text-brand-navy">4.9 ★</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar Container */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex flex-1 max-w-2xl">
            <input 
              type="text"
              placeholder="Search modders by name, city, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 pr-28 text-sm border-2 border-slate-900 focus:border-brand-navy focus:outline-none bg-white text-brand-textMain placeholder:text-brand-textMuted font-mono"
            />
            <button 
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-brand-navy text-white px-5 py-2 hover:bg-[#132856] transition-colors font-mono font-bold text-xs uppercase tracking-wider border-2 border-brand-navy"
            >
              Search
            </button>
          </div>
          <Button 
            variant="secondary" 
            isLoading={false} 
            className="lg:hidden w-auto px-4 py-3.5"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            Filters
          </Button>
        </div>
        <div className="flex gap-8">
          {/* SIDEBAR FILTERS */}
          <div className={`lg:w-80 lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:static fixed inset-0 lg:inset-auto bg-brand-lightBg lg:bg-transparent z-50 lg:z-auto p-4 lg:p-0`}>
            <div className="bg-brand-sidebar border-2 border-slate-900 p-6 max-h-[80vh] overflow-y-auto shadow-sm">
              <div className="flex items-center justify-between mb-4 lg:mb-6 pb-2 border-b-2 border-slate-900">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">Sidebar Filters</h2>
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
            </div>
          </div>

          {/* MODDER RESULTS */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-slate-900">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain">
                MODDER RESULTS (Showing {filteredModders.length} modders)
              </h2>
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
                      equipment: []
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
    <div className="mb-5 pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-2.5">
        {title}
      </h3>
      <div className="space-y-1.5">
        {options.map((option) => (
          <label 
            key={option} 
            className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-brand-textMain hover:text-brand-navy py-0.5 group select-none"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="w-4 h-4 rounded-none border-2 border-slate-900 text-brand-navy focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand-navy shrink-0"
            />
            <span className={`transition-colors ${selected.includes(option) ? 'font-bold text-brand-navy' : 'text-slate-700 group-hover:text-brand-navy'}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Modder Card Component
function ModderCard({ modder }: { modder: any }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-brand-sidebar border-2 border-slate-900 overflow-hidden hover:shadow-xl transition-all group hover:border-brand-navy flex flex-col justify-between h-full">
      {/* Top Status Strip */}
      <div className="h-11 px-4 border-b border-slate-200 bg-brand-lightBg flex items-center justify-between">
        {modder.status === 'accepting' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse inline-block"></span>
            ACCEPTING WORK
          </span>
        ) : modder.status === 'queue_full' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-amber-500 inline-block"></span>
            QUEUE FULL
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-rose-500 inline-block"></span>
            ON BREAK
          </span>
        )}
        <span className="text-[10px] font-mono text-brand-textMuted uppercase tracking-wider font-semibold">
          MODDER #{modder.id}
        </span>
      </div>

      {/* Main Info */}
      <div className="p-5 pb-3">
        {/* Profile Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 shrink-0 border-2 border-slate-900 bg-slate-200 relative overflow-hidden flex items-center justify-center font-mono font-bold text-slate-600 text-sm">
            <img 
              src={modder.avatar} 
              alt={modder.displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute select-none pointer-events-none text-brand-navy font-black text-sm">
              {modder.displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h3 className="font-bold text-base text-brand-textMain group-hover:text-brand-navy transition-colors truncate">
                {modder.username}
              </h3>
              {modder.isPro && (
                <span className="px-1.5 py-0.5 bg-brand-navy text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  PRO
                </span>
              )}
              {modder.isVerified && (
                <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-300 text-brand-navy text-[10px] font-mono font-bold">
                  ✓ VERIFIED
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-brand-textMuted truncate">
              📍 {modder.location.city}, {modder.location.province}
            </p>
          </div>
        </div>

        {/* Reputation & Orders */}
        <div className="flex items-center gap-2 p-2.5 bg-brand-lightBg border border-slate-200 mb-4 font-mono text-xs">
          <span className="text-yellow-500 font-bold text-sm">★</span>
          <span className="font-bold text-slate-900 text-sm">{modder.rating}</span>
          <span className="text-brand-textMuted text-xs">({modder.totalOrders}+ completed orders)</span>
        </div>

        {/* Specialty Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4 min-h-[52px] items-start">
          {modder.specialties.map((specialty: string, index: number) => (
            <span 
              key={index} 
              className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-mono font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Audio Sound Test Player Station */}
        <div className="border border-slate-300 bg-brand-lightBg p-3">
          <div className="flex justify-between items-center text-[11px] font-mono mb-2">
            <span className="font-bold text-brand-textMain truncate">
              🎧 Sound Test: {modder.soundTest.title}
            </span>
            <span className="text-brand-navy font-bold shrink-0 ml-2">
              {modder.soundTest.duration}
            </span>
          </div>
          <div className="flex items-center gap-2.5 bg-white p-2 border border-slate-200">
            <button 
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause Sound Test" : "Play Sound Test"}
              className="w-7 h-7 bg-brand-navy text-white text-xs flex items-center justify-center hover:bg-[#132856] transition-colors shrink-0 active:scale-95 cursor-pointer font-mono"
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <div className="flex-1 h-2 bg-slate-200 border border-slate-300 relative overflow-hidden">
              <div 
                className={`h-full bg-brand-navy transition-all duration-300 ${isPlaying ? 'w-4/5 animate-pulse' : 'w-2/5'}`}
              ></div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold">
              {isPlaying ? "PLAYING" : "WAV"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-5 pt-0">
        <a href={`/modders/${modder.id}`} className="block w-full">
          <Button variant="primary" isLoading={false} className="w-full">
            View Profile & Portfolio →
          </Button>
        </a>
      </div>
    </div>
  );
}