import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';

export default function PropertyGrid() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk menarik data dari Backend (API GET /api/properti)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti');
        // Karena backend-mu pakai format GeoJSON, datanya ada di dalam "features"
        setProperties(res.data.data.features);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Fungsi untuk merapikan angka harga jadi format Rupiah (Rp 1.000.000.000)
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return <div className="text-center py-20 text-xl font-bold text-gray-500">Memuat Data Properti...</div>;
  }

  return (
    <div className="px-10 py-12 max-w-7xl mx-auto">
      {/* Header Grid */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Properti Pilihan ({properties.length})</h2>
        <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
          <option>Terbaru</option>
          <option>Harga Terendah</option>
          <option>Harga Tertinggi</option>
        </select>
      </div>

      {/* Grid Kartu Properti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((item) => {
          // Kita ekstrak data propertinya dari format GeoJSON
          const prop = item.properties; 
          
          return (
            <div key={prop.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              
              {/* Bagian Atas: Gambar & Badge */}
              <div className="relative h-64 bg-gray-200">
                {/* Fallback kalau gambarnya kosong */}
                <img 
                  src={prop.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"} 
                  alt={prop.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Dijual
                </div>
              </div>

              {/* Bagian Bawah: Info Properti */}
              <div className="p-5">
                <h3 className="text-2xl font-bold text-primary mb-1">{formatRupiah(prop.harga)}</h3>
                <h4 className="text-lg font-semibold text-gray-800 truncate">{prop.title}</h4>
                <p className="flex items-center text-gray-500 text-sm mt-2 truncate">
                  <MdLocationOn className="mr-1 text-lg shrink-0" /> {prop.lokasi}
                </p>

                {/* Garis Pemisah */}
                <div className="border-t border-gray-100 my-4"></div>

                {/* Fasilitas (Kamar Tidur dll) */}
                <div className="flex items-center gap-5 text-gray-600 text-sm font-medium">
                  <div className="flex items-center gap-1.5"><FaBed className="text-lg" /> {prop.kamarTidur || 0}</div>
                  <div className="flex items-center gap-1.5"><FaBath className="text-lg" /> 2</div> {/* Angka dummy */}
                  <div className="flex items-center gap-1.5"><FaRulerCombined className="text-lg" /> 120m²</div> {/* Angka dummy */}
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
    </div>
  );
}