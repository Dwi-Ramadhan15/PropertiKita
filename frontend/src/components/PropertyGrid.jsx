import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';

export default function PropertyGrid() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lokasi, setLokasi] = useState('');
  const [tipe, setTipe] = useState('');
  const [rentangHarga, setRentangHarga] = useState('');
  const [kamarTidur, setKamarTidur] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; 

  const fetchProperties = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNumber);
      params.append('limit', limit);
      
      if (lokasi) params.append('lokasi', lokasi);
      if (tipe) params.append('tipe', tipe);
    
      if (rentangHarga === 'murah') params.append('maxHarga', '500000000');
      if (rentangHarga === 'menengah') {
        params.append('minHarga', '500000000');
        params.append('maxHarga', '1000000000');
      }
      if (rentangHarga === 'mahal') params.append('minHarga', '1000000000');
      if (kamarTidur) params.append('kamar_tidur', kamarTidur);

      const res = await axios.get(`http://localhost:5000/api/properti?${params.toString()}`);
      
      setProperties(res.data.data.features || []);
      setTotalPages(res.data.data.totalPages || 1);
      setCurrentPage(res.data.data.currentPage || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProperties(1);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [lokasi, tipe, rentangHarga, kamarTidur]); 

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProperties(newPage);
      // Scroll smooth ke area grid saat ganti halaman
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="px-6 md:px-10 py-12 max-w-7xl mx-auto relative">
      {/* FORM FILTER */}
      <form 
        onSubmit={(e) => { e.preventDefault(); fetchProperties(1); }}
        className="bg-white p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-4 items-center -mt-24 relative z-20 mb-16 border border-gray-50 w-full"
      >
        <input 
          type="text" 
          placeholder="Cari lokasi..." 
          className="flex-1 w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
        />
        
        <select 
          className="w-full lg:w-48 border border-gray-200 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
          className="w-full lg:w-48 border border-gray-200 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
          className="w-full lg:w-auto bg-[#1E293B] text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-md"
        >
          Cari
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20 text-xl font-bold text-slate-400">Memuat Properti...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-xl font-bold text-slate-400">Properti tidak ditemukan.</div>
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
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-blue-600 mb-1">{formatRupiah(prop.harga)}</h3>
                    <h4 className="text-lg font-bold text-[#1E293B] truncate mb-2">{prop.title}</h4>
                    <p className="flex items-center text-slate-400 text-sm mb-6 truncate">
                      <MdLocationOn className="mr-1 text-lg shrink-0" /> {prop.lokasi}
                    </p>

                    <div className="mt-auto">
                      {/* Bagian Fasilitas - Fix 0 Data */}
                      <div className="flex items-center justify-between text-slate-600 text-sm font-bold border-t border-slate-50 pt-5">
                        <div className="flex items-center gap-1.5"><FaBed className="text-blue-500"/> {prop.kamar_tidur || 0}</div>
                        <div className="flex items-center gap-1.5"><FaBath className="text-blue-500"/> {prop.kamar_mandi || 0}</div> 
                        <div className="flex items-center gap-1.5"><FaRulerCombined className="text-blue-500"/> {prop.luas || 0}m²</div> 
                      </div>

                      <Link 
                        to={`/properti/${prop.slug}`}
                        className="block text-center mt-7 bg-slate-50 text-[#1E293B] py-4 rounded-2xl font-bold hover:bg-[#1E293B] hover:text-white transition-all duration-300 border border-slate-100"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION - Tetap Ada & Makin Cakep */}
          <div className="flex justify-center items-center mt-20 gap-3">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <MdChevronLeft size={24} className="text-slate-600" />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`w-12 h-12 rounded-xl font-bold transition-all shadow-sm ${
                  currentPage === index + 1 
                  ? 'bg-[#1E293B] text-white border-[#1E293B]' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-500'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-all shadow-sm"
            >
              <MdChevronRight size={24} className="text-slate-600" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}