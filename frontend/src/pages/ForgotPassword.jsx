import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logoPK from '../assets/logo-pk.jpeg'; 
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';

export default function ForgotPassword() {
  const [inputValue, setInputValue] = useState(''); 
  const [otp, setOtp] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const navigate = useNavigate();

  // 1. Fungsi Kirim OTP
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { 
        identifier: inputValue.trim() 
      });
      alert("Kode OTP telah dikirim!");
      
      setOtp(''); // Reset state OTP agar kosong saat modal buka
      setShowModal(true); 
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "User tidak ditemukan"));
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Verifikasi OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/reset-password', { 
        identifier: inputValue.trim(),
        otp: otp.trim(),
        newPassword: newPassword
      });

      if (res.data.success) {
        alert("Password berhasil diperbarui! Silahkan login kembali.");
        setShowModal(false);
        navigate('/login');
      }
    } catch (err) {
      // ✅ Akan menampilkan "Password baru tidak boleh sama..." jika backend sudah kamu update
      alert("Gagal: " + (err.response?.data?.message || "OTP salah atau kadaluwarsa"));
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

      {/* --- FORM UTAMA LUPA PASSWORD --- */}
      <div className="bg-white p-8 md:p-12 rounded-[1.5rem] shadow-2xl w-full max-w-[440px] relative z-20 text-center">
        <div className="flex flex-col items-center mb-10">
          <img src={logoPK} alt="Logo" className="h-20 w-auto object-contain mb-5" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Lupa Password</h2>
          <p className="text-gray-500 text-sm font-medium">Masukkan No. WhatsApp Anda</p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-6 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">No. WhatsApp</label>
            <input 
              type="text" 
              placeholder="Contoh: 0812xxxxxxxx"
              className="w-full p-4 bg-white rounded-lg border border-gray-200 outline-none focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] transition-all text-sm shadow-inner"
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-medium text-lg transition shadow-md flex justify-center items-center active:scale-95
              ${loading ? 'bg-gray-400' : 'bg-[#C6A265] hover:bg-[#B39156] text-white'}`}
          >
            {loading ? "Mengirim..." : "Kirim OTP Reset"}
          </button>
        </form>

        <div className="mt-10">
          <p className="text-gray-500 font-medium text-sm">
              Kembali ke <Link to="/login" className="text-[#C6A265] font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>

      {/* --- POPUP MODAL VERIFIKASI OTP --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Verifikasi OTP</h2>
            <p className="text-center text-gray-500 text-sm mb-8">
              Masukkan kode yang dikirim ke <br/> <b>{inputValue}</b>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Kode OTP</label>
                <input 
                  type="text"
                  maxLength="6"
                  value={otp} // ✅ Terikat ke state
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder=". . . . . ." // ✅ Placeholder titik-titik
                  autoComplete="one-time-code" // ✅ Mencegah Autofill Browser
                  name={`otp_field_${Math.random()}`} // ✅ Nama acak biar browser tidak kenal
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.3em] outline-none focus:border-[#C6A265] placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Password Baru</label>
                <input 
                  type="password"
                  placeholder="Masukkan Password Baru"
                  autoComplete="new-password"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C6A265] text-sm"
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#C6A265] hover:bg-[#B39156] text-white font-bold rounded-xl transition shadow-lg active:scale-95"
              >
                {loading ? "Memproses..." : "Konfirmasi & Ganti Password"}
              </button>

              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full text-sm text-gray-400 font-medium hover:text-gray-600 transition"
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}