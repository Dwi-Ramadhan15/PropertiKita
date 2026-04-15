import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Agen() {
  const [daftarAgen, setDaftarAgen] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Ambil data agen dari API Backend
  useEffect(() => {
    const fetchAgen = async () => {
      try {
        // Mengambil data agen dari database melalui API
        const res = await axios.get('http://localhost:5000/api/agen');
        if (res.data.success) {
          setDaftarAgen(res.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data agen:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgen();
  }, []);

  // 2. Fungsi Proteksi WhatsApp dengan IF-ELSE Ketat
  const handleWhatsApp = (ag) => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Jika token tidak ada, munculkan alert dan pindah ke login
      alert("Wajib Login! Bestie harus masuk akun dulu untuk menghubungi agen.");
      navigate('/login');
    } else {
      // HANYA JIKA ADA TOKEN, blok kode ini dijalankan
      const phone = ag.no_whatsapp.replace(/\D/g, ''); 
      const message = encodeURIComponent(`Halo ${ag.nama_agen}, saya tertarik dengan properti Anda di PropertiKita.`);
      
      // Membuka tab WhatsApp hanya setelah verifikasi token berhasil
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-10 min-h-screen bg-[#F8FAFC]">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Agen Properti Profesional</h1>
        <p className="text-gray-500 mt-3 text-lg">Temukan agen terbaik untuk membantu transaksi properti Anda</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {daftarAgen.map((ag) => (
            <div 
              key={ag.id} 
              className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center group"
            >
              {/* Profil Agen */}
              <div className="relative w-36 h-36 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-dashed animate-[spin_10s_linear_infinite] opacity-30"></div>
                <img 
                  src={ag.foto_profil || "https://via.placeholder.com/150"} 
                  alt={ag.nama_agen} 
                  className="w-full h-full rounded-full object-cover p-2"
                />
                <div className="absolute bottom-3 right-3 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-1">{ag.nama_agen}</h3>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-8">Certified Agent</p>
              
              <div className="flex flex-col gap-4">
                {/* Tombol WhatsApp dengan Proteksi Login */}
                <button 
                  onClick={() => handleWhatsApp(ag)}
                  className="flex items-center justify-center gap-3 bg-[#12CF5F] hover:bg-[#0fa94d] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  <FaWhatsapp size={22} />
                  WhatsApp
                </button>

                {/* Tombol Daftar Properti Agen (Data ditarik dari API) */}
                <button 
                  onClick={() => navigate(`/properti?agen=${ag.id}`)}
                  className="flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl transition-all border border-gray-100"
                >
                  <FaHome size={18} className="text-blue-600" />
                  Daftar Properti Agen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}