import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';

export default function PropertyGrid() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // State baru untuk menyimpan ketikan user di kolom pencarian
  const [lokasi, setLokasi] = useState('');
  const [tipe, setTipe] = useState('');

  // Fungsi narik data yang sudah di-upgrade biar bisa nerima filter
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lokasi) params.append('lokasi', lokasi);
      if (tipe) params.append('tipe', tipe);

      // Sekarang URL-nya dinamis mengikuti apa yang diketik user
      const res = await axios.get(`http://localhost:5000/api/properti?${params.toString()}`);
      setProperties(res.data.data.features || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tetap narik semua data saat web pertama kali dibuka
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fungsi yang jalan saat tombol "Cari" diklik
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties(); // Tarik ulang data sesuai filter
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="px-10 py-12 max-w-7xl mx-auto relative">
      
      {/* INI YANG BARU: KOTAK PENCARIAN (SEARCH BAR) */}
      <form 
        onSubmit={handleSearch}
        className="bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center -mt-24 relative z-20 mb-12 border border-gray-100 w-full max-w-4xl mx-auto"
      >
        <input 
          type="text" 
          placeholder="Cari lokasi... (cth: Rajabasa, Way Halim)" 
          className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
        />
        <select 
          className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          value={tipe}
          onChange={(e) => setTipe(e.target.value)}
        >
          <option value="">Semua Tipe</option>
          <option value="Rumah">Rumah</option>
          <option value="Kosan">Kosan</option>
          <option value="Villa">Villa</option>
        </select>
        <button 
          type="submit" 
          className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Cari
        </button>
      </form>
      {/* BATAS KOTAK PENCARIAN */}

      {/* Header Grid */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Properti Pilihan ({properties.length})</h2>
        <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
          <option>Terbaru</option>
          <option>Harga Terendah</option>
          <option>Harga Tertinggi</option>
        </select>
      </div>

      {/* Logika kalau lagi loading atau data kosong */}
      {loading ? (
        <div className="text-center py-20 text-xl font-bold text-gray-500">Mencari Properti...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-xl font-bold text-gray-500">Yah, properti di lokasi tersebut belum tersedia.</div>
      ) : (
        /* Grid Kartu Properti */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((item) => {
            const prop = item.properties; 
            
            return (
              <div key={prop.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-64 bg-gray-200">
                  <img 
                    src={prop.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"} 
                    alt={prop.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    Dijual
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-bold text-primary mb-1">{formatRupiah(prop.harga)}</h3>
                  <h4 className="text-lg font-semibold text-gray-800 truncate">{prop.title}</h4>
                  <p className="flex items-center text-gray-500 text-sm mt-2 truncate">
                    <MdLocationOn className="mr-1 text-lg shrink-0" /> {prop.lokasi}
                  </p>

                  <div className="border-t border-gray-100 my-4"></div>

                  <div className="flex items-center gap-5 text-gray-600 text-sm font-medium">
                    <div className="flex items-center gap-1.5"><FaBed className="text-lg" /> {prop.kamarTidur || 0}</div>
                    <div className="flex items-center gap-1.5"><FaBath className="text-lg" /> 2</div> 
                    <div className="flex items-center gap-1.5"><FaRulerCombined className="text-lg" /> 120m²</div> 
                  </div>

                  <Link 
                    to={`/properti/${prop.id}`}
                    className="block text-center mt-6 bg-blue-50 text-primary py-2.5 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors border border-blue-100">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}