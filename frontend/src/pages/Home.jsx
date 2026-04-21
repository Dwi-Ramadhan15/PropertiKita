import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lokasi, setLokasi] = useState('');
  const [tipe, setTipe] = useState('');
  const [rentangHarga, setRentangHarga] = useState('');
  const [kamarTidur, setKamarTidur] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;
  const fetchProperties = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNumber);
      params.append('limit', limit);
      
      if (lokasi) params.append('lokasi', lokasi);
      if (tipe) params.append('tipe', tipe);
      if (kamarTidur) params.append('kamar_tidur', kamarTidur);

      // Logika Rentang Harga
      if (rentangHarga === 'murah') params.append('maxHarga', '500000000');
      if (rentangHarga === 'menengah') {
        params.append('minHarga', '500000000');
        params.append('maxHarga', '1000000000');
      }
      if (rentangHarga === 'mahal') params.append('minHarga', '1000000000');

      const res = await axios.get(`http://localhost:5000/api/properti?${params.toString()}`);
      
      setProperties(res.data.data.features || []);
      setTotalPages(res.data.data.totalPages || 1);
      setCurrentPage(res.data.data.currentPage || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [lokasi, tipe, rentangHarga, kamarTidur]);

  // Effect untuk auto-search dengan debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProperties(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [lokasi, tipe, rentangHarga, kamarTidur, fetchProperties]);

  // --- HANDLERS ---
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProperties(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <main className="bg-[#F8FAFC] min-h-screen">
      {/* 1. Hero Banner */}
      <HeroCarousel />

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 relative">
        
        {/* FORM FILTER (Floating di atas Hero) */}
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchProperties(1); }}
          className="bg-white p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-4 items-center -mt-24 relative z-20 mb-16 border border-gray-50 w-full"
        >
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="Cari lokasi (cth: Bandar Lampung)..." 
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>
          
          <select 
            className="w-full lg:w-48 border border-gray-200 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            value={tipe}
            onChange={(e) => setTipe(e.target.value)}
          >
            <option value="">Semua Tipe</option>
            <option value="Rumah">Rumah</option>
            <option value="Kosan">Kosan</option>
            <option value="Villa">Villa</option>
            <option value="Apartemen">Apartemen</option>
          </select>

          <select 
            className="w-full lg:w-48 border border-gray-200 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
            value={rentangHarga}
            onChange={(e) => setRentangHarga(e.target.value)}
          >
            <option value="">Rentang Harga</option>
            <option value="murah">&lt; Rp 500 Juta</option>
            <option value="menengah">Rp 500 Jt - 1 Milyar</option>
            <option value="mahal">&gt; Rp 1 Milyar</option>
          </select>

          <button 
            type="submit" 
            className="w-full lg:w-auto bg-[#1E293B] text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-md uppercase text-sm tracking-wider"
          >
            Cari
          </button>
        </form>

        {/* PROPERTI SECTION */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-bold text-slate-400">Memuat Properti...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-dashed border-gray-200">
            <p className="text-xl font-bold text-slate-400 uppercase italic">Properti tidak ditemukan.</p>
          </div>
        ) : (
          <>
            {/* GRID PROPERTI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {properties.map((item) => {
                const prop = item.properties; 
                return (
                  <div key={prop.id} className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-50 flex flex-col group">
                    <div className="relative h-64 bg-slate-100 overflow-hidden">
                      <img 
                        src={prop.image_url || prop.imageUrl || "https://via.placeholder.com/400x300"} 
                        alt={prop.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{prop.tipe}</p>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      <h3 className="text-2xl font-black text-blue-600 mb-1">{formatRupiah(prop.harga)}</h3>
                      <h4 className="text-lg font-bold text-[#1E293B] truncate mb-2">{prop.title}</h4>
                      <p className="flex items-center text-slate-400 text-sm mb-6 truncate">
                        <MdLocationOn className="mr-1 text-lg shrink-0 text-red-400" /> {prop.lokasi}
                      </p>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-slate-600 text-sm font-bold border-t border-slate-50 pt-5">
                          <div className="flex items-center gap-1.5"><FaBed className="text-blue-500"/> {prop.kamar_tidur || 0}</div>
                          <div className="flex items-center gap-1.5"><FaBath className="text-blue-500"/> {prop.kamar_mandi || 0}</div> 
                          <div className="flex items-center gap-1.5"><FaRulerCombined className="text-blue-500"/> {prop.luas || 0} m²</div> 
                        </div>

                        <Link 
                          to={`/properti/${prop.slug}`}
                          className="block text-center mt-7 bg-slate-50 text-[#1E293B] py-4 rounded-2xl font-bold hover:bg-[#1E293B] hover:text-white transition-all duration-300 border border-slate-100 uppercase text-xs tracking-widest"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center mt-20 gap-3">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md disabled:opacity-20 transition-all shadow-sm"
              >
                <MdChevronLeft size={24} className="text-slate-600" />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-12 h-12 rounded-xl font-bold transition-all shadow-sm ${
                    currentPage === index + 1 
                    ? 'bg-[#1E293B] text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md disabled:opacity-20 transition-all shadow-sm"
              >
                <MdChevronRight size={24} className="text-slate-600" />
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}