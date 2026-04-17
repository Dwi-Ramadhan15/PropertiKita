import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DashboardAdmin() {
  const [propertiPending, setPropertiPending] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchPendingProperti(page);
    }
  }, [page]);

  useEffect(() => {
    let timer;
    if (selectedProperty && selectedProperty.gallery && selectedProperty.gallery.length > 1) {
      timer = setInterval(() => {
        setCurrentImg((prev) => (prev + 1) % selectedProperty.gallery.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [selectedProperty]);

  const fetchPendingProperti = async (pageNum) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti?status=pending&page=${pageNum}&limit=5`);
      setPropertiPending(res.data.data.features.map(f => f.properties) || []);
      setPage(res.data.data.currentPage);
      setTotalPages(res.data.data.totalPages === 0 ? 1 : res.data.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const openReviewModal = async (p) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti/${p.slug}`);
      setSelectedProperty(res.data.data);
      setCurrentImg(0);
    } catch (err) {
      alert("Gagal mengambil detail properti dari server");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const confirmMsg = newStatus === 'approved' ? 'Setujui properti ini?' : 'Tolak properti ini?';
      if (!window.confirm(confirmMsg)) return;

      await axios.put(`http://localhost:5000/api/properti/${id}/status`, { status: newStatus });
      setSelectedProperty(null);
      fetchPendingProperti(page);
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan pada server");
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const nextImage = () => {
    if (selectedProperty && selectedProperty.gallery) {
      setCurrentImg((prev) => (prev + 1) % selectedProperty.gallery.length);
    }
  };

  const prevImage = () => {
    if (selectedProperty && selectedProperty.gallery) {
      setCurrentImg((prev) => (prev === 0 ? selectedProperty.gallery.length - 1 : prev - 1));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Panel Admin</h1>
            <p className="text-gray-500 font-bold ml-1">Halo {user?.name}, tinjau properti yang menunggu persetujuan.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="p-6">Detail Properti</th>
                <th className="p-6 text-center">Harga</th>
                <th className="p-6 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {propertiPending.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition">
                  <td className="p-6">
                    <div className="flex items-center gap-5">
                      <img src={p.imageUrl || p.image_url} className="w-24 h-20 rounded-[1.2rem] object-cover bg-gray-100" alt={p.title} />
                      <div>
                        <div className="font-black text-xl text-gray-800">{p.title}</div>
                        <div className="text-xs font-bold text-blue-500 uppercase">{p.tipe} • {p.lokasi}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="font-black text-gray-800 text-lg">{formatRupiah(p.harga)}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openReviewModal(p)} 
                        className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-black hover:bg-blue-500 hover:text-white transition text-[10px]"
                      >
                        REVIEW
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(p.id, 'approved')} 
                        className="px-5 py-2 bg-green-50 text-green-600 rounded-xl font-black hover:bg-green-500 hover:text-white transition text-[10px]"
                      >
                        TERIMA
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(p.id, 'rejected')} 
                        className="px-5 py-2 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-500 hover:text-white transition text-[10px]"
                      >
                        TOLAK
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {propertiPending.length === 0 && (
            <div className="p-20 text-center text-gray-300 font-black italic uppercase">
              Semua properti sudah ditinjau
            </div>
          )}

          {totalPages > 1 && (
            <div className="bg-gray-50/50 p-6 flex justify-between items-center border-t border-gray-100">
              <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
                className={`px-6 py-3 rounded-xl font-black text-xs transition ${page === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
              >
                SEBELUMNYA
              </button>
              <div className="font-black text-gray-500 text-sm">
                HALAMAN {page} DARI {totalPages}
              </div>
              <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
                className={`px-6 py-3 rounded-xl font-black text-xs transition ${page === totalPages ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'}`}
              >
                SELANJUTNYA
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-4xl font-black italic uppercase text-gray-900">{selectedProperty.title}</h2>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1">{selectedProperty.tipe} • {selectedProperty.lokasi}</p>
              </div>
              <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-red-500 font-black text-xl bg-gray-100 hover:bg-red-50 w-12 h-12 rounded-full flex items-center justify-center transition">X</button>
            </div>

            <div className="relative w-full h-80 rounded-[2rem] mb-8 overflow-hidden bg-gray-100 group">
              <img 
                src={selectedProperty.gallery && selectedProperty.gallery.length > 0 ? selectedProperty.gallery[currentImg] : selectedProperty.image_url} 
                alt="Properti" 
                className="w-full h-full object-cover transition-all duration-500" 
              />
              
              {selectedProperty.gallery && selectedProperty.gallery.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg font-black">&lt;</button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg font-black">&gt;</button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedProperty.gallery.map((_, idx) => (
                      <div key={idx} className={`w-2.5 h-2.5 rounded-full transition-all ${currentImg === idx ? 'bg-blue-600 w-8' : 'bg-white/60'}`}></div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-[1.5rem]">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Kamar Tidur</p>
                <p className="text-2xl font-black text-gray-800">{selectedProperty.kamar_tidur}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[1.5rem]">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Kamar Mandi</p>
                <p className="text-2xl font-black text-gray-800">{selectedProperty.kamar_mandi}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[1.5rem]">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Luas (m²)</p>
                <p className="text-2xl font-black text-gray-800">{selectedProperty.luas}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-black text-gray-400 uppercase mb-3">Fasilitas Tambahan</h3>
              <div className="flex flex-wrap gap-3">
                {selectedProperty.kolam_renang && <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs">Kolam Renang</span>}
                {selectedProperty.wifi && <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs">WiFi</span>}
                {selectedProperty.keamanan_24jam && <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs">Keamanan 24 Jam</span>}
                {selectedProperty.parkir && <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs">Parkir</span>}
                {selectedProperty.ac && <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs">AC</span>}
                {!selectedProperty.kolam_renang && !selectedProperty.wifi && !selectedProperty.keamanan_24jam && !selectedProperty.parkir && !selectedProperty.ac && <span className="text-gray-400 font-medium text-sm italic">Tidak ada fasilitas khusus yang dicantumkan.</span>}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-black text-gray-400 uppercase mb-3">Peta Lokasi</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-xl flex-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase">Latitude</p>
                  <p className="font-bold text-gray-800">{selectedProperty.latitude || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex-1">
                  <p className="text-[10px] text-gray-400 font-black uppercase">Longitude</p>
                  <p className="font-bold text-gray-800">{selectedProperty.longitude || '-'}</p>
                </div>
              </div>
              {selectedProperty.latitude && selectedProperty.longitude ? (
                <div className="w-full h-64 rounded-[1.5rem] overflow-hidden bg-gray-100 relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://maps.google.com/maps?q=${selectedProperty.latitude},${selectedProperty.longitude}&hl=id&z=15&output=embed`}
                  ></iframe>
                </div>
              ) : (
                <div className="w-full h-64 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 font-medium italic">
                  Koordinat tidak tersedia
                </div>
              )}
            </div>

            <div className="mb-10">
              <h3 className="text-sm font-black text-gray-400 uppercase mb-3">Deskripsi</h3>
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap bg-gray-50 p-6 rounded-[1.5rem]">
                {selectedProperty.deskripsi || "Tidak ada deskripsi."}
              </p>
            </div>

            <div className="flex gap-4 border-t border-gray-100 pt-8 mt-auto sticky bottom-0 bg-white">
              <div className="flex-[2] flex items-center">
                <span className="text-sm font-black text-gray-400 uppercase mr-4">Harga:</span>
                <span className="text-3xl font-black text-gray-900">{formatRupiah(selectedProperty.harga)}</span>
              </div>
              <button 
                onClick={() => handleUpdateStatus(selectedProperty.id, 'rejected')}
                className="flex-1 py-4 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-lg hover:bg-red-500 hover:text-white transition"
              >
                TOLAK
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')}
                className="flex-1 py-4 bg-green-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-green-600 transition"
              >
                TERIMA PROPERTI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}