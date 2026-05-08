import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil identifier (Email/WA) dari halaman sebelumnya
  const { identifier, role } = location.state || {};

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!identifier) return alert("Data hilang, silakan register ulang.");
    
    setLoading(true);
    try {
      // PERBAIKAN: Langsung ke Port 5000
      const res = await axios.post('http://localhost:5000/api/users/verify-otp', { 
        identifier, 
        otp 
      });

      if (res.data.success) {
        alert("Akun Aktif! Silakan Login.");
        navigate('/login');
      }
    } catch (err) {
      alert(err.response?.data?.message || "OTP Salah!");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) return;
    try {
      // Memanggil forgotPassword di backend untuk kirim ulang
      await axios.post('http://localhost:5000/api/users/forgot-password', { identifier });
      alert("OTP baru telah dikirim ke " + identifier);
    } catch (err) {
      alert("Gagal kirim ulang. Cek koneksi server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center">
        <div className="w-20 h-20 bg-[#C6A265]/10 text-[#C6A265] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          {role === 'user' ? '📱' : '📧'}
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase">Verifikasi</h2>
        <p className="text-gray-500 mb-8 font-medium text-sm">
          Masukkan kode yang dikirim ke <br/>
          <span className="text-[#C6A265] font-bold">{identifier || "Data tidak ada"}</span>
        </p>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <input 
            type="text" 
            maxLength="6" 
            placeholder="000000"
            className="w-full p-4 text-center text-4xl tracking-[0.3em] font-black bg-gray-50 rounded-2xl border-2 focus:border-[#C6A265] outline-none"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-white transition ${loading ? 'bg-gray-400' : 'bg-[#1A314D] hover:bg-black'}`}>
            {loading ? "MENGECEK..." : "VERIFIKASI SEKARANG"}
          </button>
        </form>

        <p className="mt-8 text-gray-400 text-sm font-bold">
          Tidak menerima kode? <button onClick={handleResend} className="text-[#C6A265] hover:underline">Kirim Ulang</button>
        </p>
      </div>
    </div>
  );
}