import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCamera, FiLock, FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi';

export default function ProfileAdmin() {
  // Mengambil data dari localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [previewFoto, setPreviewFoto] = useState('https://via.placeholder.com/150');

  // Helper untuk format URL foto sesuai logika backend MinIO kamu
  const formatFotoUrl = (foto) => {
    if (!foto) return 'https://via.placeholder.com/150';
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:9000/propertikita/${foto}`;
  };

  // Ambil data profil saat komponen dimuat
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Endpoint sesuai dengan getUserProfile di backend kamu
        const res = await axios.get(`/_/backend/api/users/${user.id}/profile`, config);

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
        console.error("Gagal mengambil data profil:", err);
        // Fallback ke data localStorage jika API gagal
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone_number: user.phone_number || ''
        });
        setPreviewFoto(formatFotoUrl(user.foto_profil));
      }
    };

    if (user.id && token) {
      fetchProfileData();
    }
  }, [user.id, token]);

  // Handler Update Profil (Nama, Email, HP)
  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put('/_/backend/api/users/profile', formData, config);
      
      if (res.data.success) {
        // Update localStorage agar nama di navbar juga berubah
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profil Admin berhasil diperbarui!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui profil.");
    }
  };

  // Handler Ganti Foto (Upload ke MinIO via Backend)
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.append('avatar', file); // 'avatar' sesuai dengan req.file di backend

      try {
        const config = { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          } 
        };
        const res = await axios.post('/_/backend/api/users/avatar', uploadData, config);
        
        if (res.data.success) {
          const newFoto = res.data.foto_profil;
          setPreviewFoto(formatFotoUrl(newFoto));
          
          // Update localStorage
          const updatedUser = { ...user, foto_profil: newFoto };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert("Foto profil Admin diperbarui!");
          window.location.reload(); // Reload untuk sinkronisasi seluruh aplikasi
        }
      } catch (err) {
        alert(err.response?.data?.message || "Gagal mengunggah foto.");
      }
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }
    alert("Fitur update password sedang disiapkan di backend.");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 p-4">
      {/* KARTU PROFIL KIRI */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-slate-900 overflow-hidden shadow-lg relative">
              <img src={previewFoto} alt="Profil Admin" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <FiCamera className="text-white text-3xl" />
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFotoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 uppercase italic">{formData.name || 'Admin'}</h3>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
            <FiShield className="text-red-500" /> Administrator
          </p>
          
          <div className="w-full bg-slate-900 text-white p-4 rounded-2xl mt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Akses Level</p>
            <p className="text-lg font-black text-red-400 uppercase tracking-tighter">Full System Access</p>
          </div>
        </div>
      </div>

      {/* FORM INPUT KANAN */}
      <div className="xl:col-span-2 space-y-8">
        {/* Informasi Pribadi */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6 border-b pb-4">Pengaturan Akun Admin</h3>
          <form onSubmit={handleUpdateProfil} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                <FiUser /> Nama Administrator
              </label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900/20" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                <FiMail /> Email Dinas
              </label>
              <input 
                type="email" 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900/20" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                <FiPhone /> Nomor Kontak
              </label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900/20" 
                value={formData.phone_number} 
                onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                required 
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all w-full md:w-auto">
                SIMPAN PROFIL ADMIN
              </button>
            </div>
          </form>
        </div>

        {/* Keamanan */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6 border-b pb-4 flex items-center gap-2">
            <FiLock className="text-red-500" /> Keamanan Root
          </h3>
          <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Password Saat Ini</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-200" 
                onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Password Baru</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900/20" 
                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Konfirmasi Password Baru</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900/20" 
                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black shadow-sm hover:bg-red-600 hover:text-white transition-all w-full md:w-auto">
                GANTI PASSWORD ADMIN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}