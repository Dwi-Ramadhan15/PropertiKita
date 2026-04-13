import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';

export default function PropertiDijual() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Filter
  const [search, setSearch] = useState('');
  const [harga, setHarga] = useState('Semua');
  const [kamar, setKamar] = useState('Semua');

  // --- State Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Fetch data awal dari API
  useEffect(() => {
    const fetchDijual = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti');
        const allData = res.data.data.features || [];
        const initialDijual = allData.filter(item => 
          item.properties.kategori?.toLowerCase() === 'dijual'
        );
        setProperties(initialDijual);
        setFilteredProperties(initialDijual);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDijual();
  }, []);

  // 2. LOGIKA LIVE SEARCH
  useEffect(() => {
    let temp = properties;

    if (search) {
      temp = temp.filter(p => 
        p.properties.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        p.properties.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (harga !== 'Semua') {
      const [min, max] = harga.split('-').map(Number);
      temp = temp.filter(p => 
        p.properties.harga >= min && (max ? p.properties.harga <= max : true)
      );
    }

    if (kamar !== 'Semua') {
      temp = temp.filter(p => p.properties.kamarTidur === Number(kamar));
    }

    setFilteredProperties(temp);
    setCurrentPage(1); // Reset ke halaman 1 tiap kali filter berubah
  }, [search, harga, kamar, properties]);

  // --- Logika Potong Data (Slice) untuk Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="px-10 py-12 max-w-7xl mx-auto">
      <div className="mb-10 text-center bg-blue-600 py-5 rounded-lg">
        <h1 className="text-3xl font-bold text-white">Unit Properti Dijual</h1>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-center mb-12 border border-gray-100">
        <div className="flex-1 relative">
           <input 
            type="text" 
            placeholder="Cari lokasi atau nama properti..." 
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 pl-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="border p-2.5 rounded-lg text-gray-600 outline-none" 
          onChange={(e) => setHarga(e.target.value)}
        >
          <option value="Semua">Semua Harga</option>
          <option value="0-500000000">Di bawah 500 Juta</option>
          <option value="500000000-1000000000">500 Juta - 1 Miliar</option>
          <option value="1000000000">Di atas 1 Miliar</option>
        </select>

        <select 
          className="border p-2.5 rounded-lg text-gray-600 outline-none" 
          onChange={(e) => setKamar(e.target.value)}
        >
          <option value="Semua">Semua Kamar</option>
          <option value="1">1 Kamar</option>
          <option value="2">2 Kamar</option>
          <option value="3">3 Kamar</option>
          <option value="4">4+ Kamar</option>
        </select>
        
        <div className="text-sm text-gray-400 font-medium px-2">
          Total: {filteredProperties.length} unit
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-gray-400 animate-pulse">Memuat data...</div>
      ) : (
        <>
          {/* RENDER LIST (Pakai currentItems) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <div key={item.properties.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-300">
                <div className="relative h-60">
                  <img src={item.properties.imageUrl} className="w-full h-full object-cover" alt="img" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Dijual</div>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-bold text-blue-600 mb-1">
                    Rp {item.properties.harga.toLocaleString('id-ID')}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-800 truncate">{item.properties.title}</h4>
                  <p className="flex items-center text-gray-500 text-sm mt-2"><MdLocationOn/> {item.properties.lokasi}</p>
                  <div className="flex gap-4 mt-4 text-gray-600 text-sm border-t pt-4">
                    <span className="flex items-center gap-1"><FaBed/> {item.properties.kamarTidur || 0}</span>
                    <span className="flex items-center gap-1"><FaBath/> {item.properties.kamarMandi || 0}</span>
                    <span className="flex items-center gap-1"><FaRulerCombined/> {item.properties.luas || 0}m²</span>
                  </div>
                  <Link to={`/properti/${item.properties.slug || item.properties.id}`} className="block text-center mt-5 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* --- UI PAGINATION --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <MdChevronLeft size={24}/>
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold border transition ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <MdChevronRight size={24}/>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}