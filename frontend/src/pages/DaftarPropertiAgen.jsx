import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import useAgenProperties from '../hooks/useAgenProperties';

export default function DaftarPropertiAgen() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const agenId = query.get('agen');

  const { properti, loading } = useAgenProperties(agenId);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 font-bold text-gray-400">
        Memuat koleksi properti...
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="bg-[#1E293B] py-20 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            Koleksi Properti Agen
          </h1>

          <p className="text-slate-300 text-xl font-medium">
            Temukan properti terbaik yang dipublikasikan oleh agen.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-10">
        <button
          onClick={() => navigate('/agen')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#C9925F] font-semibold mt-15 mb-10 transition-all group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Agen
        </button>

        <div className="w-full flex justify-center mb-12 relative z-10">
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md flex items-center justify-center">
            <div className="px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap bg-blue-100 text-blue-600">
              {properti.length} Unit Properti
            </div>
          </div>
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
              const p = item.properties;

              const kategori = p.kategori
                ? p.kategori.toLowerCase()
                : "";

              const isDijual = kategori === "dijual";

              const imageUrl = p.image_url
                ? p.image_url.startsWith('http')
                  ? p.image_url
                  : `http://127.0.0.1:9000/propertikita/${p.image_url}`
                : "https://via.placeholder.com/400x300";

              return (
                <Link
                  key={p.id || index}
                  to={`/properti/${p.slug}`}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group overflow-hidden flex flex-col relative"
                >
                  {/* Image */}
                  <div className="h-60 overflow-hidden relative z-20">
                    <div
                      className={`absolute top-4 left-4 z-30 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
                        isDijual
                          ? "bg-[#C9925F] text-white"
                          : "bg-slate-800/80 text-white backdrop-blur-sm"
                      }`}
                    >
                      {p.kategori || 'Properti'}
                    </div>

                    {p.status !== 'approved' && (
                      <div className="absolute top-4 right-4 z-30 bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                        {p.status.toUpperCase()}
                      </div>
                    )}

                    <img
                      src={imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-[#C9925F] font-bold text-xl mb-1">
                      {formatRupiah(p.harga)}
                    </h3>

                    <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-[#C9925F] transition-colors">
                      {p.title}
                    </p>

                    <p className="text-gray-400 flex items-center text-sm mb-4">
                      <MdLocationOn className="mr-1 text-red-400" />
                      {p.lokasi || 'Lokasi tidak disebutkan'}
                    </p>

                    <div className="flex justify-between text-sm text-slate-500 border-t pt-4 mt-auto">
                      <span className="flex items-center gap-1">
                        <FaBed /> {p.kamar_tidur || 0}
                      </span>

                      <span className="flex items-center gap-1">
                        <FaBath /> {p.kamar_mandi || 0}
                      </span>

                      <span className="flex items-center gap-1">
                        <FaRulerCombined /> {p.luas || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}