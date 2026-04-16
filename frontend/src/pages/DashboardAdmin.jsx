import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DashboardAdmin() {
  const [propertiPending, setPropertiPending] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert("Akses Ditolak! Halaman ini khusus Admin.");
      navigate('/login');
    } else {
      fetchPendingProperti();
    }
  }, []);

  const fetchPendingProperti = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/properti?status=pending');
      setPropertiPending(res.data.data.features.map(f => f.properties) || []);
    } catch (err) {
      console.error("Gagal load data properti pending");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const confirmMsg = newStatus === 'approved' ? 'Setujui properti ini?' : 'Tolak properti ini?';
      if (!window.confirm(confirmMsg)) return;

      await axios.put(`http://localhost:5000/api/properti/${id}/status`, { status: newStatus });
      alert(`Properti berhasil di-${newStatus}!`);
      
      fetchPendingProperti();
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan pada server");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Panel Admin</h1>
            <p className="text-gray-500 font-bold ml-1">Halo {user?.name}, tinjau properti yang menunggu persetujuan.</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-white border-2 border-red-100 text-red-500 px-6 py-4 rounded-[1.5rem] font-black hover:bg-red-50 transition"
          >
            LOGOUT
          </button>
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
                      <img src={p.imageUrl} className="w-24 h-20 rounded-[1.2rem] object-cover bg-gray-100" />
                      <div>
                        <div className="font-black text-xl text-gray-800">{p.title}</div>
                        <div className="text-xs font-bold text-blue-500 uppercase">{p.tipe} • {p.lokasi}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="font-black text-gray-800 text-lg">Rp {parseInt(p.harga).toLocaleString()}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleUpdateStatus(p.id, 'approved')} 
                        className="px-6 py-3 bg-green-50 text-green-600 rounded-xl font-black hover:bg-green-500 hover:text-white transition text-xs"
                      >
                        TERIMA
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(p.id, 'rejected')} 
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-500 hover:text-white transition text-xs"
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
        </div>
      </div>
    </div>
  );
}