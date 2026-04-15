import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';

export default function PropertiDisewa() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Filter
  const [search, setSearch] = useState('');
  const [harga, setHarga] = useState('Semua');
  const [kamar, setKamar] = useState('Semua');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // 1. Ambil data dari API
  useEffect(() => {
    const fetchDisewa = async () => {
      try {
        // Tambahkan limit besar agar 11 data tertarik semua dari backend
        const res = await axios.get('http://localhost:5000/api/properti?limit=100');
        const allData = res.data.data.features || [];
        
        // Filter berdasarkan kategori 'Sewa' (id_kategori 2 di pgAdmin)
        const initialDisewa = allData.filter(item => 
          item.properties.kategori?.toLowerCase().includes('sewa') || 
          item.properties.kategori?.toLowerCase().includes('kontrakan') ||
          item.properties.kategori?.toLowerCase().includes('kos')
        );
        
        setProperties(initialDisewa);
        setFilteredProperties(initialDisewa);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDisewa();
  }, []);

  // 2. Logika Filter Otomatis
  useEffect(() => {
    let temp = properties;

    if (search) {
      temp = temp.filter(p => 
        (p.properties.lokasi && p.properties.lokasi.toLowerCase().includes(search.toLowerCase())) ||
        (p.properties.title && p.properties.title.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (harga !== 'Semua') {
      const [min, max] = harga.split('-').map(Number);
      temp = temp.filter(p => 
        p.properties.harga >= min && (max ? p.properties.harga <= max : true)
      );
    }

    if (kamar !== 'Semua') {
      // Sesuai Controller: p.properties.kamarTidur (CamelCase)
      temp = temp.filter(p => p.properties.kamarTidur === Number(kamar));
    }

    setFilteredProperties(temp);
    setCurrentPage(1); 
  }, [search, harga, kamar, properties]);

  // Logika Pagination
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
      {/* HEADER JUDUL */}
      <div className="mb-10 text-center bg-blue-600 py-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Unit Properti Disewakan</h1>
      </div>

      {/* BOX FILTER & TOTAL UNIT */}
      <div className="bg-white p-5 rounded-2xl shadow-md flex flex-wrap gap-4 items-center mb-12 border border-gray-100">
        <input 
          type="text" 
          placeholder="Cari lokasi atau nama properti..." 
          className="flex-1 min-w-[250px] border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select 
          className="border p-3 rounded-xl text-gray-600 outline-none focus:border-blue-400" 
          onChange={(e) => setHarga(e.target.value)}
        >
          <option value="Semua">Semua Harga</option>
          <option value="0-2000000">Di bawah 2 Juta</option>
          <option value="2000000-10000000">2 Juta - 10 Juta</option>
          <option value="10000000-50000000">10 Juta - 50 Juta</option>
          <option value="50000000">Di atas 50 Juta</option>
        </select>

        <select 
          className="border p-3 rounded-xl text-gray-600 outline-none focus:border-blue-400" 
          onChange={(e) => setKamar(e.target.value)}
        >
          <option value="Semua">Semua Kamar</option>
          <option value="1">1 Kamar</option>
          <option value="2">2 Kamar</option>
          <option value="3">3+ Kamar</option>
        </select>

        {/* TOTAL UNIT DI SAMPING FILTER */}
        <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-xl font-bold border border-blue-100 shadow-sm">
          Tersedia: {filteredProperties.length} Unit
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-gray-400 animate-pulse text-xl">
          Menyambungkan ke database PropertiKita...
        </div>
      ) : (
        <>
          {/* GRID KARTU PROPERTI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item) => (
              <div key={item.properties.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition duration-500 flex flex-col">
                <div className="relative h-64">
                  {/* Sesuai Controller: item.properties.imageUrl */}
                  <img 
                    src={item.properties.imageUrl || 'https://via.placeholder.com/400x300'} 
                    className="w-full h-full object-cover" 
                    alt={item.properties.title} 
                  />
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    Disewakan
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">
                    Rp {item.properties.harga ? item.properties.harga.toLocaleString('id-ID') : '0'}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-800 line-clamp-1">{item.properties.title}</h4>
                  <p className="flex items-center text-gray-500 text-sm mt-3">
                    <MdLocationOn className="mr-1 text-orange-500" size={18}/> {item.properties.lokasi}
                  </p>
                  
                  <div className="flex justify-between mt-5 text-gray-600 text-sm border-t pt-5">
                    <span className="flex items-center gap-1.5 font-medium"><FaBed className="text-blue-500"/> {item.properties.kamarTidur || 0} Kamar</span>
                    <span className="flex items-center gap-1.5 font-medium"><FaBath className="text-blue-500"/> {item.properties.kamarMandi || 0} Mandi</span>
                    <span className="flex items-center gap-1.5 font-medium"><FaRulerCombined className="text-blue-500"/> {item.properties.luas || 0} m²</span>
                  </div>

                  <Link 
                    to={`/properti/${item.properties.slug}`} 
                    className="block text-center mt-6 bg-gray-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-50"
                  >
                    Lihat Detail Properti
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-16 gap-3">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-3 border rounded-xl hover:bg-blue-50 disabled:opacity-30 transition shadow-sm"
              >
                <MdChevronLeft size={24}/>
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i+1} 
                  onClick={() => paginate(i+1)} 
                  className={`w-12 h-12 rounded-xl font-bold border transition-all ${
                    currentPage === i+1 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i+1}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-3 border rounded-xl hover:bg-blue-50 disabled:opacity-30 transition shadow-sm"
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