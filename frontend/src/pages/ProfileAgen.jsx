import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCamera, FiLock, FiUser, FiMail, FiPhone } from 'react-icons/fi';

export default function ProfileAgen() {
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

  const [fotoProfil, setFotoProfil] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('https://via.placeholder.com/150');
  const [totalListing, setTotalListing] = useState(0);

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
          setTotalListing(data.total_listing || 0);
        }
      } catch (err) {
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

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put('http://localhost:5000/api/users/profile', formData, config);
      
      if (res.data.success) {
        const updatedUser = { ...user, name: formData.name, email: formData.email, phone_number: formData.phone_number };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profil berhasil diperbarui!");
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui profil. Periksa rute backend.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    alert("Fitur ganti password segera dikoneksikan ke backend!");
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoProfil(file);
      setPreviewFoto(URL.createObjectURL(file));
      
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
          const updatedUser = { ...user, foto_profil: res.data.foto_profil };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert("Foto profil berhasil diperbarui!");
          window.location.reload();
        }
      } catch (err) {
        alert(err.response?.data?.message || "Gagal mengunggah foto profil.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center">
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-gray-50 overflow-hidden shadow-lg relative">
              <img src={previewFoto} alt="Profil" className="w-full h-full object-cover" />
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
          
          <h3 className="text-2xl font-black text-gray-900 uppercase italic">{formData.name}</h3>
          <p className="text-[#D9AB7B] font-bold text-sm tracking-widest uppercase mb-4">Agen Properti</p>
          
          <div className="w-full bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center mt-4">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Listing</span>
            <span className="text-xl font-black text-[#D9AB7B]">{totalListing}</span>
          </div>
        </div>
      </div>

      <div className="xl:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6 border-b pb-4">Informasi Pribadi</h3>
          <form onSubmit={handleUpdateProfil} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                <FiUser /> Nama Lengkap
              </label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#D9AB7B]/50" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                <FiMail /> Email
              </label>
              <input type="email" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#D9AB7B]/50" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                <FiPhone /> Nomor WhatsApp
              </label>
              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#D9AB7B]/50" value={formData.phone_number || ''} onChange={e => setFormData({...formData, phone_number: e.target.value})} required />
            </div>

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all w-full md:w-auto">
                SIMPAN PERUBAHAN
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 uppercase italic mb-6 border-b pb-4 flex items-center gap-2">
            <FiLock className="text-[#D9AB7B]" /> Keamanan Akun
          </h3>
          <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Password Saat Ini</label>
              <input type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-red-200" value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Password Baru</label>
              <input type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#D9AB7B]/50" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Konfirmasi Password Baru</label>
              <input type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#D9AB7B]/50" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
            </div>

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black shadow-sm hover:bg-red-500 hover:text-white transition-all w-full md:w-auto">
                PERBARUI PASSWORD
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}