import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCamera, FiLock, FiUser, FiEdit3, FiRefreshCw } from 'react-icons/fi';

export default function ProfileAgen() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const token = localStorage.getItem('token');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const [previewFoto, setPreviewFoto] = useState('https://via.placeholder.com/150');

  // Format URL Foto dari MinIO atau Backend
  const formatFotoUrl = (foto) => {
    if (!foto) return 'https://via.placeholder.com/150';
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:9000/propertikita/${foto}`;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`http://localhost:5000/api/users/${user.id}/profile`, config);

        if (res.data && res.data.success) {
          const data = res.data.data;
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone_number: data.phone_number || ''
          });
          setPreviewFoto(formatFotoUrl(data.foto_profil));
        }
      } catch (err) {
        // Fallback ke data localStorage jika API gagal
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone_number: user.phone_number || ''
        });
        setPreviewFoto(formatFotoUrl(user.foto_profil));
      }
    };

    if (user.id && token) fetchProfileData();
  }, [user.id, token]);

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put('http://localhost:5000/api/users/profile', formData, config);
      
      if (res.data.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profil berhasil diperbarui!");
      }
    } catch (err) {
      alert("Gagal memperbarui profil.");
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.append('avatar', file);

      try {
        const config = { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          } 
        };
        const res = await axios.post('http://localhost:5000/api/users/avatar', uploadData, config);
        
        if (res.data.success) {
          const newFoto = res.data.foto_profil;
          setPreviewFoto(formatFotoUrl(newFoto));
          const updatedUser = { ...user, foto_profil: newFoto };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.location.reload(); // Refresh agar foto di sidebar ikut berubah
        }
      } catch (err) {
        alert("Gagal upload foto.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* CARD 1: INFORMASI PRIBADI */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gray-100 rounded-xl text-slate-500 border border-gray-200">
             <FiUser size={22} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Detail Pribadi</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sisi Kiri: Foto Profil */}
          <div className="relative group mx-auto lg:mx-0">
            <div className="w-40 h-40 rounded-full border-[6px] border-[#F1F3F6] shadow-xl overflow-hidden relative ring-1 ring-gray-200">
              <img src={previewFoto} alt="Profil" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-2 right-2 bg-slate-900 text-white p-2.5 rounded-full cursor-pointer shadow-xl hover:bg-[#D9AB7B] transition-all duration-300 border-4 border-white">
              <FiCamera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
            </label>
          </div>

          {/* Sisi Kanan: Form Input */}
          <form onSubmit={handleUpdateProfil} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nama Lengkap Agen</label>
              <input 
                type="text" 
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all shadow-inner" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Resmi</label>
              <input 
                type="email" 
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all shadow-inner" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nomor WhatsApp</label>
              <input 
                type="text" 
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all shadow-inner" 
                value={formData.phone_number} 
                onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                required 
              />
            </div>

            {/* Tombol Simpan - Warna Emas (Sesuai Tombol Dashboard) */}
            <div className="md:col-span-2 flex justify-end mt-4">
              <button 
                type="submit" 
                className="flex items-center gap-3 bg-[#D9AB7B] text-[#1A314D] px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#D9AB7B]/20 hover:bg-[#c49a6a] hover:-translate-y-1 transition-all active:scale-95"
              >
                Simpan Perubahan <FiEdit3 size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CARD 2: KEAMANAN AKUN */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gray-100 rounded-xl text-slate-500 border border-gray-200">
             <FiLock size={22} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Keamanan Akun</h3>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Password Saat Ini</label>
            <input type="password" placeholder="********" className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-red-400 transition-all shadow-inner" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Password Baru</label>
            <input type="password" placeholder="Min. 8 Karakter" className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all shadow-inner" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Ulangi Password</label>
            <input type="password" placeholder="Konfirmasi" className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all shadow-inner" />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button type="button" className="flex items-center gap-3 border-2 border-[#D9AB7B] text-[#D9AB7B] px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#D9AB7B] hover:text-white transition-all active:scale-95">
              Perbarui Password <FiRefreshCw size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}