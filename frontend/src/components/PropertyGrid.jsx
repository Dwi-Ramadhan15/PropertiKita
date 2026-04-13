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
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="px-10 py-12 max-w-7xl mx-auto relative">
      {/* FORM FILTER */}
      <form 
        onSubmit={(e) => { e.preventDefault(); fetchProperties(1); }}
        className="bg-white p-4 rounded-xl shadow-lg flex flex-col lg:flex-row gap-4 items-center -mt-24 relative z-20 mb-12 border border-gray-100 w-full max-w-6xl mx-auto"
      >
        <input 
          type="text" 
          placeholder="Cari lokasi..." 
          className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
        />
        
        <select 
          className="w-full lg:w-48 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
          className="w-full lg:w-48 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          value={rentangHarga}
          onChange={(e) => setRentangHarga(e.target.value)}
        >
          <option value="">Rentang Harga</option>
          <option value="murah">&lt; Rp 500 Juta</option>
          <option value="menengah">Rp 500 Jt - 1 Milyar</option>
          <option value="mahal">&gt; Rp 1 Milyar</option>
        </select>

        <select 
          className="w-full lg:w-40 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          value={kamarTidur}
          onChange={(e) => setKamarTidur(e.target.value)}
        >
          <option value="">Kamar Tidur</option>
          <option value="1">1 Kamar</option>
          <option value="2">2 Kamar</option>
          <option value="3">3 Kamar</option>
          <option value="4+">4+ Kamar</option>
        </select>

        <button 
          type="submit" 
          className="w-full lg:w-auto bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Cari
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20 text-xl font-bold text-gray-500">Mencari Properti...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-xl font-bold text-gray-500">Properti tidak ditemukan.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((item) => {
              const prop = item.properties; 
              return (
                <div key={prop.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                  <div className="relative h-64 bg-gray-200">
                    <img 
                      src={prop.imageUrl || "https://via.placeholder.com/400x300"} 
                      alt={prop.title} 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* BAGIAN KATEGORI (DIJUAL / DISEWA) */}
                    <div className="absolute top-4 left-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${
                            prop.kategori?.toLowerCase() === 'dijual' ? 'bg-blue-600' : 'bg-orange-500'
                        }`}>
                            {prop.kategori || 'Properti'}
                        </span>
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
                      <div className="flex items-center gap-1.5"><FaBed /> {prop.kamarTidur || 0}</div>
                      <div className="flex items-center gap-1.5"><FaBath /> {prop.kamarMandi || 0}</div> 
                      <div className="flex items-center gap-1.5"><FaRulerCombined /> {prop.luas || 0}m²</div> 
                    </div>

                    <Link 
                      to={`/properti/${prop.slug}`}
                      className="block text-center mt-6 bg-blue-50 text-primary py-2.5 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors">
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center items-center mt-16 gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdChevronLeft size={24} />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                  currentPage === index + 1 
                  ? 'bg-primary text-white border-primary' 
                  : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdChevronRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}