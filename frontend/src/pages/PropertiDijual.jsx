import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn, MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';

export default function PropertiDijual() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [harga, setHarga] = useState('Semua');
  const [kamar, setKamar] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchDijual = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti?limit=100');
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
    setCurrentPage(1);
  }, [search, harga, kamar, properties]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Section - Identik Figma */}
      <div className="bg-[#475569] py-20 px-6 text-center text-white">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Properti Dijual</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">Temukan hunian impian Anda dengan harga terbaik dan lokasi strategis di seluruh Indonesia.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20">
        {/* Filter Box */}
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-wrap gap-4 items-center mb-12 border border-gray-100">
          <div className="flex-1 min-w-[300px] relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Cari lokasi atau nama properti..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="px-4 py-3.5 rounded-xl border border-gray-200 outline-none text-gray-600 focus:ring-2 focus:ring-blue-500" onChange={(e) => setHarga(e.target.value)}>
            <option value="Semua">Semua Harga</option>
            <option value="0-500000000">Di bawah 500 Juta</option>
            <option value="500000000-1000000000">500 Jt - 1 Miliar</option>
            <option value="1000000000">Di atas 1 Miliar</option>
          </select>
          <select className="px-4 py-3.5 rounded-xl border border-gray-200 outline-none text-gray-600 focus:ring-2 focus:ring-blue-500" onChange={(e) => setKamar(e.target.value)}>
            <option value="Semua">Semua Kamar</option>
            <option value="1">1 Kamar</option>
            <option value="2">2 Kamar</option>
            <option value="3">3 Kamar</option>
            <option value="4">4+ Kamar</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Memuat unit pilihan...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((item) => (
                <div key={item.properties.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-50 flex flex-col">
                  <div className="relative h-64 overflow-hidden">
                    <img src={item.properties.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="properti" />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-lg">Dijual</div>
                  </div>
                  <div className="p-7 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">Rp {item.properties.harga.toLocaleString('id-ID')}</h3>
                    <h4 className="text-lg font-bold text-slate-800 line-clamp-1 mb-2">{item.properties.title}</h4>
                    <p className="flex items-center text-slate-400 text-sm mb-6"><MdLocationOn className="text-red-400 mr-1" size={18}/> {item.properties.lokasi}</p>
                    <div className="flex justify-between items-center py-5 border-t border-slate-50 text-slate-500">
                      <div className="flex items-center gap-2"><FaBed className="text-blue-400"/> <span>{item.properties.kamarTidur || 0}</span></div>
                      <div className="flex items-center gap-2"><FaBath className="text-blue-400"/> <span>{item.properties.kamarMandi || 0}</span></div>
                      <div className="flex items-center gap-2"><FaRulerCombined className="text-blue-400"/> <span>{item.properties.luas || 0}m²</span></div>
                    </div>
                    <Link to={`/properti/${item.properties.slug}`} className="mt-4 block text-center py-3.5 bg-slate-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300">Lihat Detail</Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 gap-3">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-3 bg-white border rounded-xl hover:bg-blue-50 disabled:opacity-20 shadow-sm"><MdChevronLeft size={24}/></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-12 h-12 rounded-xl font-bold border transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>{i + 1}</button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 bg-white border rounded-xl hover:bg-blue-50 disabled:opacity-20 shadow-sm"><MdChevronRight size={24}/></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}