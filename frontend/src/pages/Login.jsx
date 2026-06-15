import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useLogin from '../hooks/useLogin'; 
import backgroundRumah from '../assets/rumah.megah.jpg';
import logoPK from '../assets/logo.png';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const { email, setEmail, password, setPassword, loading, handleLogin, toast, setToast } = useLogin(navigate);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-white font-sans relative overflow-hidden">
      
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

      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative items-center justify-center"
        style={{ backgroundImage: `url(${backgroundRumah})` }}
      >
        <div className="absolute inset-0 bg-[#0A1A2E]/50"></div>
        
        <div className="relative z-20 flex flex-col items-center">
          <img 
            src={logoPK} 
            alt="Logo PropertiKita" 
            className="w-80 h-auto drop-shadow-2xl" 
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-[400px]">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Selamat Datang</h2>
            <p className="text-gray-500 text-sm font-medium">Silakan login untuk melanjutkan</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265]">
                  <FiMail size={18} />
                </span>
                <input 
                  type="email" 
                  placeholder="Enter your Email"
                  className="w-full p-4 pl-12 bg-white rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-2 focus:ring-[#C6A265]/20 outline-none transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265]">
                  <FiLock size={18} />
                </span>
                
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Your Password"
                  className="w-full p-4 pl-12 pr-12 bg-white rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-2 focus:ring-[#C6A265]/20 outline-none transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C6A265] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#C6A265]" />
                <span className="text-[11px] text-gray-500 font-bold">Ingat Saya</span>
              </label>
              <Link to="/lupa-password" className="text-[11px] font-bold text-[#C6A265] hover:underline">
                Lupa Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C6A265] hover:bg-[#B39156]'}`}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Belum punya akun?{' '}
              <Link to="/register" className="text-[#C6A265] font-bold hover:underline transition">
                Daftar Akun baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}