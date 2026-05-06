import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
// ✅ Pastikan import assets sudah sesuai dengan folder kamu
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';
import logoPK from '../assets/logo-pk.jpeg';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState('user'); // Default role
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Logika pengiriman data tetap sama
      const res = await axios.post('/_/backend/api/users/register', { 
        username, email, password, whatsapp, role 
      });
      if (res.data.success) {
        alert("Registrasi Berhasil! Silahkan Login.");
        navigate('/login');
      }
    } catch (err) {
      alert("Registrasi Gagal: " + (err.response?.data?.message || "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative py-10"
      style={{ backgroundImage: `url(${backgroundRumah})` }}
    >
      {/* Overlay Gelap Elegan */}
      <div className="absolute inset-0 bg-[#0A1A2E]/80 z-10"></div>

      <div className="bg-white p-8 md:p-10 rounded-[1.5rem] shadow-xl w-full max-w-[480px] relative z-20 text-center">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <img src={logoPK} alt="Logo" className="h-16 w-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Daftar Akun Baru</h2>
          <p className="text-gray-500 text-sm font-medium">Buat akun untuk memulai</p>
        </div>

        {/* ✅ Switcher Role (Warna Coklat Keemasan) */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'user' ? 'bg-[#C6A265] text-white shadow-sm' : 'text-gray-500'}`}
          >
            User
          </button>
          <button 
            type="button"
            onClick={() => setRole('agen')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'agen' ? 'bg-[#C6A265] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Agen Properti
          </button>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input Username */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-gray-600 ml-1">Username</label>
            <input 
              type="text" 
              placeholder="Enter Your Username"
              className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] outline-none text-sm"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Input Email */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-gray-600 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="Enter your Email"
              className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] outline-none text-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-gray-600 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="Password"
                className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] outline-none text-sm"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Input WhatsApp */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-gray-600 ml-1">No. WhatsApp</label>
              <input 
                type="text" 
                placeholder="08xxxx"
                className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] outline-none text-sm"
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ✅ Tombol Daftar (Coklat Keemasan) */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition active:scale-95 mt-2
              ${loading ? 'bg-gray-400' : 'bg-[#C6A265] hover:bg-[#B39156]'}`}
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-6 text-sm font-medium text-gray-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#C6A265] font-bold hover:underline">
            Login Disini
          </Link>
        </p>
      </div>
    </div>
  );
}