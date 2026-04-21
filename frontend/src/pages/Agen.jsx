import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaHome, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Agen() {
  const [daftarAgen, setDaftarAgen] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mengambil data user yang sedang login dari localStorage
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const formatFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:9000/propertikita/${foto}`;
  };

  useEffect(() => {
    const fetchAgen = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/agen');
        if (res.data.success || res.data.data) {
          setDaftarAgen(res.data.data || res.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchAgen();
  }, []);

  const handleWhatsApp = (ag) => {
    const token = localStorage.getItem('token');

    if (!token || !currentUser) {
      alert("Wajib Login! Bestie harus masuk akun dulu untuk menghubungi agen.");
      navigate('/login');
    } else {
      const phone = ag.no_whatsapp.replace(/\D/g, ''); 
      // Menambahkan nama user yang sedang login ke dalam template pesan
      const message = encodeURIComponent(`Halo ${ag.nama_agen}, perkenalkan saya ${currentUser.name}. Saya tertarik dengan properti Anda yang ada di PropertiKita dan ingin berdiskusi lebih lanjut.`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#475569] py-20 px-10 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Agen Properti Profesional
        </h1>
        <p className="text-blue-50 text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Tim agen berpengalaman siap membantu Anda menemukan properti impian
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : daftarAgen.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">Belum ada agen yang terdaftar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {daftarAgen.map((ag) => (
              <div 
                key={ag.id} 
                className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center group"
              >
                <div className="relative w-36 h-36 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-[#3B82F6] border-dashed animate-[spin_10s_linear_infinite] opacity-30"></div>
                  <div className="w-full h-full rounded-full overflow-hidden p-2 bg-white relative z-10">
                    {formatFotoUrl(ag.foto_profil) ? (
                      <img 
                        src={formatFotoUrl(ag.foto_profil)} 
                        alt={ag.nama_agen} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <FaUserCircle size={100} />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm z-20"></div>
                </div>

                <h3 className="text-2xl font-bold text-[#1E293B] mb-1">{ag.nama_agen}</h3>
                <p className="text-[#3B82F6] font-bold text-xs uppercase tracking-[0.2em] mb-8">Certified Agent</p>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => handleWhatsApp(ag)}
                    className="flex items-center justify-center gap-3 bg-[#22C55E] hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                  >
                    <FaWhatsapp size={22} /> WhatsApp
                  </button>

                  <button 
                    onClick={() => navigate(`/properti?agen=${ag.id}`)}
                    className="flex items-center justify-center gap-3 bg-[#1E293B] hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
                  >
                    <FaHome size={18} /> Lihat Properti
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}