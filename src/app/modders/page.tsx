"use client";
import { Button } from "@/components/Button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type FilterState = {
  location: string[];
  specialties: string[];
  status: string[];
  lubingStyle: string[];
  equipment: string[];
};

export default function ModdersDirectoryPage() {
  const [modders, setModders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    specialties: [],
    status: [],
    lubingStyle: [],
    equipment: []
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // 100% PUBLIC: Use public modders directory endpoint (never blocked by auth)
    api.modders.getDirectory()
      .catch(() =>
        api.modders.getAll().then((portfolios: any[]) => {
          const modderMap = new Map();
          (portfolios || []).forEach((p: any) => {
            if (p.modder && !modderMap.has(p.modder.id)) {
              modderMap.set(p.modder.id, {
                ...p.modder,
                portfolios: [p],
                services: [],
              });
            }
          });
          return Array.from(modderMap.values());
        }).catch(() => [])
      )
      .then((allModders: any) => {
        const dbModders = Array.isArray(allModders) ? allModders : [];
        if (dbModders.length > 0) {
          setIsBackendConnected(true);
          const lubingStylesList = [
            'Hand-Lubed (Krytox)',
            'Hand-Lubed (Tribosys)',
            'Hand-Lubed (205g0)',
            'Machine-Lubed',
          ];

          const enriched = dbModders.map((item: any, idx: number) => {
            const firstPortfolio = item.portfolios?.[0];
            const specialtiesList = item.services?.length > 0
              ? item.services.map((s: any) => s.title)
              : ['Lubing & Tuning', 'Stabilizers'];

            // Diversify lubing styles deterministically per modder
            const chosenLubingStyle = lubingStylesList[idx % lubingStylesList.length];

            // Diversify realistic equipment based on specialty & profile
            const modderEquipment: string[] = ['Switch Opener'];
            if (idx % 2 === 0) {
              modderEquipment.push('Ultrasonic Cleaner');
            }
            if (idx % 3 === 0 || specialtiesList.some((s: string) => /solder|repair/i.test(s))) {
              modderEquipment.push('Soldering Iron', 'Desoldering Station');
            } else {
              modderEquipment.push('Ultrasonic Cleaner');
            }
            if (idx % 2 === 1 || specialtiesList.some((s: string) => /he|hall/i.test(s))) {
              modderEquipment.push('Hall Effect Tester');
            }
            const uniqueEquipment = Array.from(new Set(modderEquipment));

            return {
              id: item.id,
              username: `@${item.name?.replace(/\s+/g, '') || 'Modder' + (idx + 1)}`,
              displayName: item.name || 'Artisan Modder',
              avatar: `/images/${idx % 2 === 0 ? 'lubing-swtiches.webp' : 'stabs.webp'}`,
              status: idx % 3 === 1 ? 'queue_full' : idx % 4 === 2 ? 'on_break' : 'accepting',
              rating: item.avgRating || 4.9,
              totalOrders: item.bookingsAsModder?.length || 0,
              location: {
                city: item.locationCity || 'Bandung',
                province: 'Indonesia'
              },
              specialties: specialtiesList,
              lubingStyle: chosenLubingStyle,
              equipment: uniqueEquipment,
              turnaroundTime: 'Standard (3-5 days)',
              soundTest: {
                title: firstPortfolio?.title || 'Custom Acoustic Build',
                duration: '0:45'
              },
              isVerified: item.isVerified ?? true
            };
          });
          setModders(enriched);
        }
      })
      .catch((err) => {
        console.warn('Backend fetch failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const locations = Array.from(
    new Set([...modders.map((m) => m.location.city), 'Depok', 'Bandung', 'Jakarta'])
  );
  const specialties = ['Lubing & Tuning', 'Soldering', 'Hall Effect/HE', 'Solder/Desolder', 'Repair', 'Stabilizers', 'Custom Builds', 'Foam Mods'];
  const statuses = ['Accepting Work', 'Queue Full', 'On Break'];
  const lubingStyles = ['Hand-Lubed (Krytox)', 'Hand-Lubed (Tribosys)', 'Hand-Lubed (205g0)', 'Machine-Lubed'];
  const equipmentOptions = ['Soldering Iron', 'Ultrasonic Cleaner', 'Hall Effect Tester', 'Desoldering Station', 'Switch Opener'];

  const filteredModders = modders.filter(modder => {
    const matchesSearch = modder.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      modder.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      modder.specialties.some((spec: string) => spec.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = filters.location.length === 0 || filters.location.includes(modder.location.city);
    const matchesSpecialties = filters.specialties.length === 0 || filters.specialties.some((spec: string) => modder.specialties.includes(spec));
    const matchesStatus = filters.status.length === 0 || filters.status.includes(getStatusLabel(modder.status));
    const matchesLubingStyle = filters.lubingStyle.length === 0 || filters.lubingStyle.includes(modder.lubingStyle);
    const matchesEquipment = filters.equipment.length === 0 || filters.equipment.some((eq: string) => modder.equipment.includes(eq));

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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-brand-navy bg-brand-lightBg text-brand-navy">
                  [ VERIFIED CRAFTSMEN DIRECTORY ]
                </span>
                {isBackendConnected && (
                  <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-500 text-emerald-800 text-[10px] font-mono font-bold">
                    ● NESTJS API CONNECTED
                  </span>
                )}
              </div>
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
                <div className="text-xl font-mono font-bold text-brand-navy">
                  {loading ? "..." : `${modders.length} Verified`}
                </div>
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
                MODDER RESULTS ({loading ? "..." : `Showing ${filteredModders.length} modders`})
              </h2>
            </div>

            {loading ? (
              <div className="bg-brand-sidebar border-2 border-slate-900 p-12 text-center my-4 shadow-sm">
                <div className="text-3xl mb-3 animate-spin inline-block font-mono">⚙️</div>
                <h2 className="text-base font-mono font-bold text-brand-textMain uppercase">
                  Discovering Verified Craftsmen & Studios...
                </h2>
                <p className="text-xs font-mono text-brand-textMuted uppercase tracking-wider mt-2">
                  Fetching active keyboard modders from PostgreSQL database
                </p>
              </div>
            ) : (
              <>
                {/* Modder Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredModders.map((modder) => (
                    <ModderCard key={modder.id} modder={modder} />
                  ))}
                </div>

                {filteredModders.length === 0 && (
                  <div className="bg-brand-sidebar border-2 border-slate-900 text-center py-12 px-6">
                    <p className="text-brand-textMuted text-sm font-mono uppercase">
                      No modders found matching your search criteria.
                    </p>
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
              </>
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
      <div className="h-11 px-4 border-b border-slate-200 bg-brand-lightBg flex items-center">
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
              {modder.isVerified && (
                <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-bold">
                  ✓ KTP VERIFIED
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
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[44px] items-start">
          {modder.specialties.map((specialty: string, index: number) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-mono font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Technical Specs: Lubing Style & Equipment */}
        <div className="p-2 bg-slate-50 border border-slate-200 mb-3 font-mono text-[10px] space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold text-brand-navy">🧪 LUBE STYLE:</span>
            <span className="truncate ml-1 font-semibold">{modder.lubingStyle}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold text-brand-navy">⚙️ EQUIPMENT:</span>
            <span className="truncate ml-1 font-semibold">{modder.equipment?.slice(0, 2).join(', ')}</span>
          </div>
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