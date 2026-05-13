import React, { useState } from 'react'; // Tambah useState di sini
import { useNavigate, Link } from 'react-router-dom';
import useLogin from '../hooks/useLogin'; 
import backgroundRumah from '../assets/rumah.megah.jpg';
import logoPK from '../assets/logo.png';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'; // Tambah ikon mata

export default function Login() {
  const navigate = useNavigate();
  const { email, setEmail, password, setPassword, loading, handleLogin } = useLogin(navigate);
  
  // State lokal untuk toggle liat password
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* --- BAGIAN KIRI: GAMBAR + LOGO (Gede & Mewah) --- */}
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

      {/* --- BAGIAN KANAN: FORM LOGIN --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-[400px]">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Selamat Datang</h2>
            <p className="text-gray-500 text-sm font-medium">Silakan login untuk melanjutkan</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
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

            {/* Input Password dengan Fitur Intip (Show/Hide) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                {/* Ikon Gembok Kiri */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C6A265]">
                  <FiLock size={18} />
                </span>
                
                <input 
                  type={showPassword ? "text" : "password"} // Dinamis: text atau password
                  placeholder="Enter Your Password"
                  className="w-full p-4 pl-12 pr-12 bg-white rounded-xl border border-gray-200 focus:border-[#C6A265] focus:ring-2 focus:ring-[#C6A265]/20 outline-none transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Tombol Mata di Kanan */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C6A265] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#C6A265]" />
                <span className="text-[11px] text-gray-500 font-bold">Ingat Saya</span>
              </label>
              <Link to="/lupa-password" internal className="text-[11px] font-bold text-[#C6A265] hover:underline">
                Lupa Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C6A265] hover:bg-[#B39156]'}`}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Register Link */}
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