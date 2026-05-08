import React, { useState } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiLock, 
  FiCamera, FiEdit3, FiShield, FiCheckCircle 
} from 'react-icons/fi';

const ProfileAdmin = () => {
  // Warna Navy Blue & Gold sesuai UI Dashboard Admin
  const navyBlue = '#1A233A';
  const gold = '#D9AB7B';

  const user = {
    name: 'ayu',
    role: 'SISTEM ADMINISTRATOR',
    level: 'ROOT',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
    email: 'sayu57533@gmail.com',
    whatsapp: '082282440909',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* JUDUL MANUAL DIHAPUS SUPAYA TIDAK DOUBLE DENGAN DASHBOARD */}

      {/* CARD 1: INFORMASI AKUN ADMIN (FOTO GABUNG DISINI) */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gray-100 rounded-xl text-slate-500 border border-gray-200">
             <FiUser size={22} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Informasi Akun Admin</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sisi Kiri: Foto Profil & Badge Status */}
          <div className="flex flex-col items-center gap-6 mx-auto lg:mx-0">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-[6px] border-[#F1F3F6] shadow-xl overflow-hidden relative ring-1 ring-gray-200">
                <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-2 right-2 bg-[#1A233A] text-white p-2.5 rounded-full cursor-pointer shadow-xl border-4 border-white hover:bg-black transition-all">
                <FiCamera size={18} style={{ color: gold }} />
                <input type="file" className="hidden" />
              </label>
            </div>
            
            <div className="text-center">
              <p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
                <FiShield /> {user.role}
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-500 rounded-lg text-[9px] font-black uppercase border border-green-100">Aktif</span>
                <span className="px-3 py-1 bg-[#1A233A] text-[#D9AB7B] rounded-lg text-[9px] font-black uppercase shadow-lg shadow-blue-900/20">{user.level}</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Form Input */}
          <form className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                defaultValue={user.name}
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Dinas</label>
              <input 
                type="email" 
                defaultValue={user.email}
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">WhatsApp / Nomor HP</label>
              <input 
                type="text" 
                defaultValue={user.whatsapp}
                className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" 
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="button" className="flex items-center gap-3 bg-[#1A233A] text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-black transition-all active:scale-95">
                Simpan Perubahan <FiEdit3 size={18} style={{ color: gold }} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CARD 2: KEAMANAN ROOT */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gray-100 rounded-xl text-slate-500 border border-gray-200">
             <FiLock size={22} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Keamanan Root</h3>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Password Saat Ini</label>
            <input type="password" placeholder="********" className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-red-400 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Password Baru</label>
            <input type="password" placeholder="Min. 8 Karakter" className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Konfirmasi</label>
            <input type="password" placeholder="Ulangi" className="w-full p-5 bg-[#F8F9FA] border border-gray-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-[#D9AB7B] transition-all" />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button type="button" className="flex items-center gap-3 border-2 border-slate-300 text-slate-500 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1A233A] hover:text-white hover:border-[#1A233A] transition-all active:scale-95">
              Perbarui Password <FiLock size={18} style={{ color: gold }} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileAdmin;