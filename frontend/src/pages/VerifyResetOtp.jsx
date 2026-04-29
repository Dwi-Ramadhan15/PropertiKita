import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import logoPK from '../assets/logo-pk.jpeg'; 
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';

export default function VerifyResetOtp() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = location.state?.identifier || "";

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ Memanggil endpoint reset-password yang ada di controller kamu
      const res = await axios.post('http://localhost:5000/api/users/reset-password', { 
        identifier: identifier,
        otp: otp,
        newPassword: newPassword
      });

      if (res.data.success) {
        alert("Selamat! Password berhasil diperbarui. Silahkan login kembali.");
        navigate('/login');
      }
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "OTP salah atau sudah kadaluwarsa"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{ backgroundImage: `url(${backgroundRumah})` }}
    >
      <div className="absolute inset-0 bg-[#0A1A2E]/80 z-10"></div>

      <div className="bg-white p-8 md:p-12 rounded-[1.5rem] shadow-2xl w-full max-w-[440px] relative z-20 text-center">
        
        <div className="flex flex-col items-center mb-8">
          <img src={logoPK} alt="Logo" className="h-16 w-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Verifikasi OTP</h2>
          <p className="text-gray-500 text-sm font-medium">
            Kode telah dikirim ke <br/> <span className="text-gray-800 font-bold">{identifier}</span>
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5 text-left">
          {/* Input OTP */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">Kode OTP</label>
            <input 
              type="text" 
              maxLength="6"
              placeholder="Masukkan 6 Digit OTP"
              className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] text-center text-xl font-bold tracking-[0.5em]"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          {/* Input Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">Password Baru</label>
            <input 
              type="password" 
              placeholder="Minimal 6 Karakter"
              className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] text-sm"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-md flex justify-center items-center active:scale-95
              ${loading ? 'bg-gray-400' : 'bg-[#C6A265] hover:bg-[#B39156] text-white'}`}
          >
            {loading ? "Memproses..." : "Perbarui Password"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-bold text-[#C6A265] hover:underline"
          >
            Ganti Nomor/Email?
          </button>
        </div>
      </div>
    </div>
  );
}