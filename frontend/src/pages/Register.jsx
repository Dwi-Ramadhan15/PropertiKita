import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useRegister from '../hooks/useRegister';
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';
import logoPK from '../assets/logo-pk.jpeg';

export default function Register() {
  const navigate = useNavigate();
  const {
    formData, setFormData,
    preview, handleImageChange,
    handleRegister, handleVerifyOtp,
    showOtpModal, setShowOtpModal,
    otpCode, setOtpCode
  } = useRegister(navigate);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await handleRegister(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative py-10"
      style={{ backgroundImage: `url(${backgroundRumah})` }}
    >
      <div className="absolute inset-0 bg-[#0A1A2E]/80 z-10"></div>

      <div className="bg-white p-8 md:p-10 rounded-[1.5rem] shadow-xl w-full max-w-[480px] relative z-20 text-center">
        <img src={logoPK} alt="Logo" className="h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Daftar Akun</h2>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 font-bold">
          <button 
            type="button" 
            onClick={() => setFormData({...formData, role: 'user'})}
            className={`flex-1 py-2 rounded-lg transition ${formData.role === 'user' ? 'bg-[#C6A265] text-white shadow-sm' : 'text-gray-500'}`}
          >
            User
          </button>
          <button 
            type="button" 
            onClick={() => setFormData({...formData, role: 'agen'})}
            className={`flex-1 py-2 rounded-lg transition ${formData.role === 'agen' ? 'bg-[#C6A265] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Agen Properti
          </button>
        </div>
        
        <form onSubmit={onSubmitHandler} className="space-y-4 text-left">

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 ml-1 uppercase">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#C6A265]"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 ml-1 uppercase">Email</label>
            <input 
              type="email" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#C6A265]"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase">Password</label>
              <input 
                type="password" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#C6A265]"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase">WhatsApp</label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#C6A265]"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-lg font-black text-white bg-[#C6A265] hover:bg-[#B39156] disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg transition active:scale-95 mt-4 uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Data Anda sedang di proses......' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-sm font-medium text-gray-500">
          Sudah punya akun? <Link to="/login" className="text-[#C6A265] font-bold">Login Disini</Link>
        </p>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase italic">Verifikasi Akun</h3>
            <p className="text-gray-400 text-xs font-bold mb-8 uppercase tracking-tighter">
              Masukkan 6 digit kode yang dikirim ke <br/> 
              <span className="text-[#C6A265]">{formData.role === 'user' ? formData.whatsapp : formData.email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input 
                type="text" 
                maxLength="6"
                className="w-full p-5 text-center text-4xl tracking-[0.4em] font-black bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-[#C6A265] outline-none transition-all shadow-inner"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
              <button 
                type="submit"
                className="w-full bg-[#1A314D] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition"
              >
                Konfirmasi
              </button>
            </form>
            <button onClick={() => setShowOtpModal(false)} className="mt-6 text-gray-400 text-xs font-bold uppercase hover:text-gray-600">Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}