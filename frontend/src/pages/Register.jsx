import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';

// Menggunakan nama file asli dari folder assets kamu
import bgImage from '../assets/rumah-mewah-Armada.jpg'; 

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' 
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Pastikan backend kamu sudah jalan di port 5000
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert(`Registrasi Berhasil! OTP dikirim ke ${formData.role === 'user' ? 'WhatsApp' : 'Email'}.`);
      
      // Kirim state ke halaman Verify
      navigate('/verify', { 
        state: { 
          email: formData.email, 
          phone: formData.phone, 
          role: formData.role 
        } 
      });
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan koneksi"));
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat pt-10 px-4 pb-16 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay Gelap agar form lebih menonjol */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Container Form */}
      <div className="bg-white/95 p-10 rounded-[3rem] shadow-2xl w-full max-w-lg border border-gray-100 relative z-20 backdrop-blur-sm">
        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">Daftar Akun</h2>
        <p className="text-gray-500 mb-8 text-center font-medium">Lengkapi data untuk bergabung di PropertiKita</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Pilihan Role */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
            <button 
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition ${formData.role === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              onClick={() => setFormData({...formData, role: 'user'})}
            >User Biasa</button>
            <button 
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition ${formData.role === 'agen' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              onClick={() => setFormData({...formData, role: 'agen'})}
            >Agen Properti</button>
          </div>

          {/* Input Username */}
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Username" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, username: e.target.value})} required 
            />
          </div>
          
          {/* Input Email */}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" placeholder="Email Aktif" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, email: e.target.value})} required 
            />
          </div>
          
          {/* Input WhatsApp */}
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Nomor WhatsApp (08xxxx)" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, phone: e.target.value})} required 
            />
          </div>
          
          {/* Input Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" placeholder="Password" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required 
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 active:scale-95 mt-4">
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}