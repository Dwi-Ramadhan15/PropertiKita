import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logoPK from '../assets/logo-pk.jpeg'; 

export default function ForgotPassword() {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const staticBackground = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80";

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { 
        whatsapp: whatsapp.trim() 
      });
      alert("Kode OTP telah dikirim ke WhatsApp Anda.");
      navigate('/verify-reset-otp', { state: { whatsapp } });
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Nomor tidak terdaftar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{ backgroundImage: `url(${staticBackground})` }}
    >
      <div className="absolute inset-0 bg-black/45 z-10"></div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-20 backdrop-blur-sm text-center">
        
        <div className="flex flex-col items-center mb-8">
          <img src={logoPK} alt="Logo PK" className="h-20 mb-3 object-contain" />
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Lupa Password</h2>
          <p className="text-gray-500 text-sm font-medium">
            Masukkan No. WhatsApp untuk menerima OTP reset password
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 ml-1">No. WhatsApp</label>
            <input 
              type="text" 
              placeholder="08xxxxxxxxxx"
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-700 shadow-sm"
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-md flex justify-center items-center active:scale-95
              ${loading ? 'bg-gray-400' : 'bg-[#1D3354] hover:bg-[#15263F] text-white'}`}
          >
            {loading ? "Memproses..." : "Kirim OTP Reset"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-400 text-sm font-medium">
             Kembali ke <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}