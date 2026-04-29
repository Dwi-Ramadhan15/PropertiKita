import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
      const res = await axios.post('http://localhost:5000/api/users/reset-password', { 
        identifier,
        otp,
        newPassword
      });

      if (res.data.success) {
        alert("Selamat! Password berhasil diperbarui.");
        navigate('/login');
      }
    } catch (err) {
      // ✅ Menampilkan peringatan jika password sama atau OTP salah
      const msg = err.response?.data?.message || "Terjadi kesalahan";
      alert("Gagal: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: `url(${backgroundRumah})` }}>
      <div className="absolute inset-0 bg-[#0A1A2E]/80 z-10"></div>
      <div className="bg-white p-12 rounded-[1.5rem] shadow-2xl w-full max-w-[440px] relative z-20 text-center">
        <img src={logoPK} alt="Logo" className="h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verifikasi OTP</h2>
        
        <form onSubmit={handleResetPassword} className="space-y-5 text-left">
          <div>
            <label className="text-xs font-semibold text-gray-600">Kode OTP</label>
            <input 
              type="text" 
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6 Digit Kode" // ✅ Placeholder bersih seperti keinginanmu
              className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 outline-none text-center text-xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Password Baru</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 outline-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#C6A265] hover:bg-[#B39156] text-white rounded-lg font-bold text-lg transition"
          >
            {loading ? "Memproses..." : "Konfirmasi & Ganti Password"}
          </button>
        </form>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">Batal</button>
      </div>
    </div>
  );
}