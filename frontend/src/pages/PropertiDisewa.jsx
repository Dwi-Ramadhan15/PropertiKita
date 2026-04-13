import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn } from 'react-icons/md';
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

  // 1. Ambil data dari API
  useEffect(() => {
    const fetchDisewa = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti');
        const allData = res.data.data.features || [];
        // Filter awal: Ambil yang kategorinya 'Disewakan' atau 'Disewa'
        const initialDisewa = allData.filter(item => 
          item.properties.kategori?.toLowerCase() === 'disewakan' || 
          item.properties.kategori?.toLowerCase() === 'disewa'
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

  // 2. Logika Live Search & Filter Otomatis
  useEffect(() => {
    let temp = properties;

    // Live Search Lokasi atau Nama
    if (search) {
      temp = temp.filter(p => 
        p.properties.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        p.properties.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter Rentang Harga Sewa
    if (harga !== 'Semua') {
      const [min, max] = harga.split('-').map(Number);
      temp = temp.filter(p => 
        p.properties.harga >= min && (max ? p.properties.harga <= max : true)
      );
    }

    // Filter Jumlah Kamar
    if (kamar !== 'Semua') {
      temp = temp.filter(p => p.properties.kamarTidur === Number(kamar));
    }

    setFilteredProperties(temp);
  }, [search, harga, kamar, properties]);

  return (
    <div className="px-10 py-12 max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Unit Properti Disewakan</h1>
        <p className="text-gray-500">Cari kontrakan, kos, atau apartemen sewa secara real-time.</p>
      </div>

      {/* BOX FILTER LIVE SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-center mb-12 border border-gray-100">
        <input 
          type="text" 
          placeholder="Cari lokasi atau nama properti sewa..." 
          className="flex-1 border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select 
          className="border p-2.5 rounded-lg text-gray-600 outline-none" 
          onChange={(e) => setHarga(e.target.value)}
        >
          <option value="Semua">Semua Harga</option>
          <option value="0-2000000">Di bawah 2 Juta</option>
          <option value="2000000-10000000">2 Juta - 10 Juta</option>
          <option value="10000000">Di atas 10 Juta</option>
        </select>

        <select 
          className="border p-2.5 rounded-lg text-gray-600 outline-none" 
          onChange={(e) => setKamar(e.target.value)}
        >
          <option value="Semua">Semua Kamar</option>
          <option value="1">1 Kamar</option>
          <option value="2">2 Kamar</option>
          <option value="3">3+ Kamar</option>
        </select>

        <div className="text-sm text-gray-400 font-medium px-2">
          Tersedia: {filteredProperties.length} unit
        </div>
      </div>

      {/* DAFTAR KARTU PROPERTI */}
      {loading ? (
        <div className="text-center py-20 font-bold text-gray-400 animate-pulse">Menghubungkan ke server...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProperties.map((item) => (
            <div key={item.properties.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-300">
              <div className="relative h-60">
                <img src={item.properties.imageUrl} className="w-full h-full object-cover" alt="img" />
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Disewakan</div>
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
                <Link to={`/properti/${item.properties.slug || item.properties.id}`} className="block text-center mt-5 bg-orange-50 text-orange-600 py-2 rounded-lg font-bold hover:bg-orange-500 hover:text-white transition">
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}