import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';
import logoPK from '../assets/logo-pk.jpeg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('/_/backend/api/users/login', { 
            email: email || "", 
            password: password || "" 
          });
      
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); 
        
        alert("Login Berhasil! Halo " + (user.name || "User"));
        
        if (user.role === 'admin') navigate('/dashboard-admin');
        else if (user.role === 'agen') navigate('/dashboard-agen'); 
        else navigate('/'); 
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email atau password salah!";
      alert("Login Gagal: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ PENYESUAIAN WARNA DAN STYLE DI BAWAH INI
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{ backgroundImage: `url(${backgroundRumah})` }}
    >
      {/* Overlay Gelap Sesuai Referensi */}
      <div className="absolute inset-0 bg-[#0A1A2E]/80 z-10"></div>

      {/* Card UI: Penyesuaian membulat dan pading agar clean */}
      <div className="bg-white p-8 md:p-12 rounded-[1.5rem] shadow-xl w-full max-w-[440px] relative z-20 text-center">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <img 
            src={logoPK} 
            alt="Logo PropertiKita" 
            className="h-20 w-auto object-contain mb-5" // Sedikit margin bawah
          />
          {/* Judul Font Menengah */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Masuk</h2>
          <p className="text-gray-500 text-sm font-medium">Silahkan masuk ke akun PropertiKita Anda</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Input Email: Ganti rounded dan border */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-600 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="Enter your Email"
              className="w-full p-4 bg-white rounded-lg outline-none border border-gray-200 focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] transition-all shadow-inner text-sm placeholder:text-gray-300"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password: Ganti rounded dan border */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-gray-600 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="Enter Your Password"
              className="w-full p-4 bg-white rounded-lg outline-none border border-gray-200 focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] transition-all shadow-inner text-sm placeholder:text-gray-300"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ TOMBOL MASUK: GANTI WARNA JADI COKLAT EMAS */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-medium text-lg transition flex justify-center items-center active:scale-95 shadow-md
              ${loading ? 'bg-gray-400' : 'bg-[#C6A265] hover:bg-[#B39156] text-white'}`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-10 text-center space-y-3.5">
          {/* Warna Daftar Coklat */}
          <p className="text-gray-500 font-medium text-sm">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#C6A265] font-bold hover:underline transition">
              Daftar
            </Link>
          </p>
          
          {/* ✅ PERTAHANKAN LINK LUPA PASSWORD DENGAN WARNA BARU */}
          <Link 
            to="/lupa-password" 
            className="block text-xs font-bold text-[#C6A265] hover:text-[#B39156] transition hover:underline"
          >
            Lupa Password?
          </Link>
        </div>
      </div>
    </div>
  );
}