import React, { useState, useEffect } from 'react';
import MapView from '../components/features/MapView';
import ListingCard from '../components/ui/ListingCard';
import { Property } from '../types/property';

const Dashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  useEffect(() => {
    setProperties([
      {
        id: 1,
        title: "Rumah Modern Minimalis",
        harga: 2500000000,
        lokasi: "BSD City, Tangerang",
        lat: -6.300,
        lng: 106.670,
        tipe: "Dijual",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=500",
        beds: 3,
        baths: 2,
        sqft: 120,
      },
      {
        id: 2,
        title: "Villa Eksklusif dengan Taman",
        harga: 4200000000,
        lokasi: "Alam Sutera, Tangerang",
        lat: -6.220,
        lng: 106.650,
        tipe: "Dijual",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500",
        beds: 5,
        baths: 4,
        sqft: 350,
      },
      {
        id: 3,
        title: "Rumah Mewah 2 Lantai",
        harga: 3800000000,
        lokasi: "Bintaro, Jakarta Selatan",
        lat: -6.280,
        lng: 106.740,
        tipe: "Disewa",
        image: "https://images.unsplash.com/photo-1600607687940-4e5a994239b3?auto=format&fit=crop&w=500",
        beds: 4,
        baths: 3,
        sqft: 220,
      },
    ]);
  }, []);

  const handleCardClick = (prop: Property) => {
    setSelectedProp(prop);
    // scroll ke peta saat klik card di mobile
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-20"> {/* pt-20 fix navbar fixed */}

      {/* HERO SECTION */}
      <header className="hero-box relative h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/40 z-0"></div>
        <div className="relative z-10 text-center px-4">
        {/* Ganti bagian h1 di HERO SECTION */}
        <h1 className="text-7xl md:text-9xl font-black text-white mb-3 drop-shadow-2xl uppercase text-center block w-full">
        Cari Hunian Impianmu
        </h1>
          <p className="text-white text-sm md:text-lg max-w-xl mx-auto opacity-90 font-medium">
            Temukan properti terbaik dengan lokasi strategis & harga terbaik
          </p>
        </div>
      </header>

      {/* SEARCH BAR (Melayang) */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-wrap md:flex-nowrap gap-3 border border-slate-100">
          <div className="flex-1 flex items-center gap-2 px-3">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Cari lokasi perumahan..."
              className="w-full outline-none text-sm font-medium"
            />
          </div>
          <select className="px-4 py-2 text-sm font-bold border-l border-slate-100 outline-none text-slate-600 bg-transparent">
            <option>Semua Tipe</option>
            <option>Rumah</option>
            <option>Villa</option>
          </select>
          <button className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Cari
          </button>
        </div>
      </div>

      {/* MAP SECTION */}
      <section id="map-section" className="max-w-6xl mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Eksplorasi Area</h2>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full">
            <span className="animate-pulse w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Live Map View</span>
          </div>
        </div>

        <div className="h-[500px] w-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white relative">
          <MapView
            properties={properties}
            selectedProp={selectedProp}
            onMarkerClick={(p) => setSelectedProp(p)}
          />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-blue-50 font-bold text-blue-600 text-[12px] whitespace-nowrap">
            📍 Menampilkan {properties.length} Properti Tersedia
          </div>
        </div>
      </section>

      {/* PROPERTY LIST SECTION */}
      <section className="max-w-6xl mx-auto px-4 mt-24 mb-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Properti Pilihan ({properties.length})
            </h2>
            <div className="h-1.5 w-20 bg-blue-600 rounded-full mb-3"></div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
              Rekomendasi Terbaik Untukmu
            </p>
          </div>
          <button className="text-blue-600 font-bold text-sm hover:underline">Lihat Semua →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p) => (
            <ListingCard
              key={p.id}
              property={p}
              isSelected={selectedProp?.id === p.id}
              onClick={() => handleCardClick(p)}
            />
          ))}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;