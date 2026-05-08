import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logoPK from '../assets/logo-pk.jpeg'; 
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';

export default function ForgotPassword() {
  const [inputValue, setInputValue] = useState(''); 
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/_/backend/api/users/forgot-password', { 
        identifier: inputValue.trim() 
      });
      alert("Kode OTP telah dikirim!");
      setOtp(['', '', '', '', '', '']); 
      setShowModal(true); 
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "User tidak ditemukan"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/_/backend/api/users/reset-password', { 
        identifier: inputValue.trim(),
        otp: otp.join(''), 
        newPassword: newPassword
      });

      if (res.data.success) {
        alert("Password berhasil diperbarui! Silahkan login kembali.");
        setShowModal(false);
        navigate('/login');
      }
    } catch (err) {
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
      {/* Overlay Gelap - Dibuat lebih tipis (60%) supaya background lebih terang */}
      <div className="absolute inset-0 bg-[#0A1A2E]/60 z-10"></div>

      {/* --- FORM UTAMA LUPA PASSWORD --- */}
      <div className="bg-white p-8 md:p-12 rounded-[1.5rem] shadow-2xl w-full max-w-[440px] relative z-20 text-center border border-white/20">
        <div className="flex flex-col items-center mb-10">
          <img src={logoPK} alt="Logo" className="h-20 w-auto object-contain mb-5" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight uppercase">Lupa Password</h2>
          <p className="text-gray-500 text-sm font-medium">Masukkan No. WhatsApp Anda</p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-6 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1 uppercase">No. WhatsApp</label>
            <input 
              type="text" 
              placeholder="0812xxxxxxxx"
              className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:border-[#C6A265] focus:ring-1 focus:ring-[#C6A265] transition-all text-sm shadow-inner font-medium"
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition shadow-md active:scale-95
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          {/* Box Putih Modal - Blur dihapus agar background tajam */}
          <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.5)] relative border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
            
            {/* Logo Emas */}
            <div className="flex flex-col items-center mb-6">
              <img src={logoPK} alt="Logo" className="h-14 w-auto object-contain mb-2" />
              <h1 className="text-[#C6A265] font-bold text-xl tracking-tighter">PropertiKita</h1>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Verifikasi Kode</h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium">
              Masukan 6 digit kode yang telah <br /> dikirimkan ke nomor WhatsApp Anda
            </p>

            <form onSubmit={handleResetPassword} className="space-y-8">
              <div className="flex justify-center gap-2 md:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-11 h-13 md:w-14 md:h-16 border border-gray-300 rounded-xl text-center text-2xl font-black focus:border-[#1A314D] focus:ring-1 focus:ring-[#1A314D] outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              <div className="text-left space-y-1.5 px-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password Baru</label>
                <input 
                  type="password"
                  placeholder="Buat Password Baru"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1A314D] text-sm font-semibold"
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1A314D] hover:bg-[#14263b] text-white font-bold rounded-xl transition shadow-xl active:scale-95 uppercase tracking-widest text-sm"
              >
                {loading ? "MEMPROSES..." : "verifikasi"}
              </button>

              <div className="text-sm font-semibold text-gray-400">
                Tidak terima kode? <br />
                <button 
                  type="button"
                  className="text-[#C6A265] hover:underline mt-1 flex items-center justify-center gap-1 mx-auto font-bold"
                >
                  <span className="text-lg">↻</span> Kirim ulang kode
                </button>
              </div>
            </form>

            <button 
              onClick={() => setShowModal(false)}
              className="mt-8 text-gray-300 text-xs font-bold hover:text-gray-500 transition tracking-widest uppercase"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}