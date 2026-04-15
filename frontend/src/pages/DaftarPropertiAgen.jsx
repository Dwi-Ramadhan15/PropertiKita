import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

export default function DaftarPropertiAgen() {
  const [properti, setProperti] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const agenId = query.get('agen');

  useEffect(() => {
    const fetchPropertiByAgen = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/properti?agen=${agenId}`);
        if (res.data.success && res.data.data.features) {
          setProperti(res.data.data.features);
        } else {
          setProperti([]);
        }
      } catch (error) {
        console.error(error);
        setProperti([]);
      } finally {
        setLoading(false);
      }
    };
    if (agenId) fetchPropertiByAgen();
  }, [agenId]);

  if (loading) return <div className="text-center py-20 font-bold text-blue-600">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 min-h-screen bg-[#F8FAFC]">
      <button onClick={() => navigate('/agen')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold mb-8 transition-all">
        <FaArrowLeft /> Kembali ke Daftar Agen
      </button>

      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900">Koleksi Properti</h1>
        <p className="text-gray-500">Ditemukan {properti.length} unit</p>
      </div>

      {properti.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-400 text-xl font-medium">Data tidak ditemukan untuk Agen ID: {agenId}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properti.map((item) => {
            const p = item.properties;
            return (
              <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                <div className="relative h-64">
                  <img src={p.imageUrl || "https://via.placeholder.com/400x300"} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">{p.tipe}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-1">Rp {p.harga ? parseInt(p.harga).toLocaleString('id-ID') : '0'}</h3>
                  <h2 className="text-lg font-bold text-gray-800 line-clamp-1 mb-2">{p.title}</h2>
                  <p className="text-gray-500 text-sm flex items-center gap-2 mb-6"><FaMapMarkerAlt className="text-red-400" /> {p.lokasi}</p>
                  <div className="flex justify-between items-center py-4 border-t border-gray-50 text-gray-600">
                    <div className="flex items-center gap-2"><FaBed /> <span>{p.kamar_tidur || 0}</span></div>
                    <div className="flex items-center gap-2"><FaBath /> <span>{p.kamar_mandi || 0}</span></div>
                    <div className="flex items-center gap-2"><FaRulerCombined /> <span>{p.luas || 0} m²</span></div>
                  </div>
                  <button onClick={() => navigate(`/properti/${p.slug}`)} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">Lihat Detail</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}