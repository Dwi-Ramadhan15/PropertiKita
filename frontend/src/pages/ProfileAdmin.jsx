import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiUser, FiLock, FiCamera, FiEdit3, FiShield 
} from 'react-icons/fi';

const ProfileAdmin = () => {
  const navyBlue = '#1A233A';
  const gold = '#D9AB7B';

  const userStr = localStorage.getItem('user');
  const [user, setUser] = useState(userStr ? JSON.parse(userStr) : {});
  const token = localStorage.getItem('token');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [avatarPreview, setAvatarPreview] = useState('https://via.placeholder.com/150');

  const formatFotoUrl = (foto) => {
    if (!foto) return `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=1A314D&color=fff`;
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:9000/propertikita/${foto}`;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5000/api/users/profile', config);

        if (res.data && res.data.success) {
          const data = res.data.data;
          setName(data.name || '');
          setEmail(data.email || '');
          setWhatsapp(data.phone_number || '');
          setAvatarPreview(formatFotoUrl(data.foto_profil));
        }
      } catch (err) {
        setName(user.name || '');
        setAvatarPreview(formatFotoUrl(user.foto_profil));
      }
    };

    if (user.id && token) fetchProfileData();
  }, [user.id, token]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.put('http://localhost:5000/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        const newAvatarUrl = res.data.foto_profil.startsWith('http') 
            ? res.data.foto_profil 
            : `http://127.0.0.1:9000/propertikita/${res.data.foto_profil}`;
        
        setAvatarPreview(newAvatarUrl);
        const updatedUser = { ...user, foto_profil: res.data.foto_profil };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert('Foto profil berhasil diperbarui!');
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengupload foto profil');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', {
        name,
        email,
        phone_number: whatsapp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const updatedUser = { ...user, name, email, phone_number: whatsapp };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert('Profil berhasil diperbarui!');
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return alert('Konfirmasi password tidak cocok!');
    }

    if (newPassword.length < 8) {
      return alert('Password baru minimal 8 karakter!');
    }

    try {
      const res = await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('Password berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui password');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gray-100 rounded-xl text-slate-500 border border-gray-200">
             <FiUser size={22} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Informasi Akun Admin</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-[6px] border-[#F1F3F6] shadow-xl overflow-hidden relative ring-1 ring-gray-200">
                <img src={avatarPreview} alt="Admin" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-2 right-2 bg-[#1A233A] text-white p-2.5 rounded-full cursor-pointer shadow-xl border-4 border-white hover:bg-black transition-all">
                <FiCamera size={18} style={{ color: gold }} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            
            <div className="text-center">
              <p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
                <FiShield /> {user.role === 'admin' ? 'SISTEM ADMINISTRATOR' : user.role}
              </p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-500 rounded-lg text-[9px] font-black uppercase border border-green-100">Aktif</span>
                <span className="px-3 py-1 bg-[#1A233A] text-[#D9AB7B] rounded-lg text-[9px] font-black uppercase shadow-lg shadow-blue-900/20">ROOT</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Dinas</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">WhatsApp / Nomor HP</label>
              <input 
                type="text" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="submit" className="flex items-center gap-3 bg-[#D9AB7B] text-[#1A233A] px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#D9AB7B]/20 hover:bg-[#c49a6a] transition-all active:scale-95">
                Simpan Perubahan <FiEdit3 size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gray-100 rounded-xl text-slate-500 border border-gray-200">
             <FiLock size={22} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Keamanan Root</h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Password Saat Ini</label>
            <input 
              type="password" 
              placeholder="********" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Password Baru</label>
            <input 
              type="password" 
              placeholder="Min. 8 Karakter" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Konfirmasi</label>
            <input 
              type="password" 
              placeholder="Ulangi" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button type="submit" className="flex items-center gap-3 border-2 border-slate-300 text-slate-500 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1A233A] hover:text-white hover:border-[#1A233A] transition-all active:scale-95">
              Perbarui Password <FiLock size={18} className="text-[#D9AB7B] group-hover:text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileAdmin;