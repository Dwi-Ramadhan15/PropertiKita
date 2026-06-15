import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useRegister from '../hooks/useRegister'; 
import backgroundRumah from '../assets/rumah.megah.jpg';
import logoPK from '../assets/logo.png'; 
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    formData,
    setFormData,
    loading,
    handleRegister,
    toast,
    setToast
  } = useRegister(navigate);

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden relative">
      
      {/* --- KOMPONEN TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className="fixed top-10 right-4 md:right-10 bg-white border-l-4 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[200] animate-in slide-in-from-right duration-300 w-[90%] md:w-auto"
             style={{ borderColor: toast.type === 'success' ? '#10B981' : '#EF4444' }}>
          <div className={`p-2 rounded-full flex-shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
            {toast.type === 'success' ? <FiCheckCircle size={24} /> : <FiXCircle size={24} />}
          </div>
          <div className="flex-1">
            <p className={`text-[10px] font-black uppercase tracking-widest ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {toast.type === 'success' ? 'Berhasil' : 'Peringatan'}
            </p>
            <p className="font-bold text-gray-800 text-xs md:text-sm mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-3 text-gray-400 hover:text-gray-700 flex-shrink-0 transition">
            <FiX size={20}/>
          </button>
        </div>
      )}

      {/* --- BAGIAN KIRI: HERO SECTION --- */}
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center relative items-center justify-center" 
        style={{ backgroundImage: `url(${backgroundRumah})` }}
      >
        <div className="absolute inset-0 bg-[#0A1A2E]/65"></div>
        <div className="relative z-20 flex items-center gap-6 translate-y-[-10%]"> 
          <div className="relative z-20 flex flex-col items-center">
                    <img 
                      src={logoPK} 
                      alt="Logo PK" 
                      className="w-80 h-auto drop-shadow-2xl" 
                    />
                  </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM REGISTER --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-[450px] py-6">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Daftar Akun Baru</h2>
            <p className="text-gray-500 text-sm">Buat akun untuk mulai menjelajah properti impian</p>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 font-bold shadow-sm">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, role: 'user'})}
              className={`flex-1 py-3.5 rounded-xl transition-all duration-300 text-sm ${formData.role === 'user' ? 'bg-[#C6A265] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              User
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, role: 'agen'})}
              className={`flex-1 py-3.5 rounded-xl transition-all duration-300 text-sm ${formData.role === 'agen' ? 'bg-[#C6A265] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Agen Properti
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265] transition-colors">
                  <FiUser size={18} />
                </span>
                <input 
                  type="text" 
                  placeholder="Enter Your Username"
                  className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-4 focus:ring-[#C6A265]/10 outline-none text-sm transition-all shadow-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265] transition-colors">
                  <FiMail size={18} />
                </span>
                <input 
                  type="email" 
                  placeholder="Enter your Email"
                  className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-4 focus:ring-[#C6A265]/10 outline-none text-sm transition-all shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password Field dengan Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265] transition-colors">
                  <FiLock size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Your Password"
                  className="w-full p-4 pl-12 pr-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-4 focus:ring-[#C6A265]/10 outline-none text-sm transition-all shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                {/* Tombol Mata */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C6A265] transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* WhatsApp Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">No. WhatsApp</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265] transition-colors">
                  <FiPhone size={18} />
                </span>
                <input 
                  type="text" 
                  placeholder="Contoh: 08123456789"
                  className="w-full p-4 pl-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-4 focus:ring-[#C6A265]/10 outline-none text-sm transition-all shadow-sm"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg mt-4 uppercase tracking-widest text-xs
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C6A265] hover:bg-[#B39156] shadow-[#C6A265]/30 hover:shadow-[#C6A265]/50'}`}
            >
              {loading ? "Menyimpan Data..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-[#C6A265] font-bold hover:underline decoration-2 underline-offset-4 transition-all">
                Login Disini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}