import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import useAgenProperties from '../hooks/useAgenProperties';

export default function DaftarPropertiAgen() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const agenId = query.get('agen');

  const { properti, loading } = useAgenProperties(agenId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 font-bold text-blue-600 animate-pulse">
        Memuat koleksi properti...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 min-h-screen bg-[#F8FAFC]">
      {/* Tombol Kembali */}
      <button
        onClick={() => navigate('/agen')}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold mb-8 transition-all group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        Kembali ke Daftar Agen
      </button>

      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900">Koleksi Properti</h1>
        <p className="text-gray-500">Ditemukan {properti.length} unit tersedia</p>
      </div>

      {properti.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-gray-400 text-xl font-medium">
            Belum ada properti yang dipublikasikan oleh agen ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properti.map((item, index) => {
            // Mengambil properties dari struktur GeoJSON
            const p = item.properties;

            return (
              <div
                key={p.id || index}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={p.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={p.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                    {p.tipe || 'Properti'}
                  </div>
                  {p.status !== 'approved' && (
                     <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-lg">
                        {p.status.toUpperCase()}
                     </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">
                    Rp {p.harga ? parseInt(p.harga).toLocaleString('id-ID') : '0'}
                  </h3>
                  
                  <h2 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 min-h-[3.5rem]">
                    {p.title}
                  </h2>

                  <p className="text-gray-500 text-sm flex items-start gap-2 mb-6">
                    <FaMapMarkerAlt className="text-red-400 mt-1 shrink-0" /> 
                    <span className="line-clamp-1">{p.lokasi || 'Lokasi tidak disebutkan'}</span>
                  </p>

                  {/* Spesifikasi */}
                  <div className="flex justify-between items-center py-4 border-t border-gray-100 text-gray-600 mt-auto">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <FaBed className="text-blue-500" /> {p.kamar_tidur || 0}
                      </div>
                      <span className="text-[10px] uppercase text-gray-400">Tidur</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <FaBath className="text-blue-500" /> {p.kamar_mandi || 0}
                      </div>
                      <span className="text-[10px] uppercase text-gray-400">Mandi</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <FaRulerCombined className="text-blue-500" /> {p.luas || 0}
                      </div>
                      <span className="text-[10px] uppercase text-gray-400">m²</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/properti/${p.slug}`)}
                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-blue-200 shadow-lg transition-all active:scale-95"
                  >
                    Lihat Detail Unit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}