import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Tambahkan loading state biar keren
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Pastikan endpoint ini sesuai dengan route di backend kamu
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (res.data.success) {
        // --- POIN KRUSIAL ---
        // Simpan token untuk pengecekan auth
        localStorage.setItem('token', res.data.token);
        // Simpan data user (id, nama, role) dalam bentuk string JSON
        localStorage.setItem('user', JSON.stringify(res.data.user)); 
        
        alert("Login Berhasil! Halo " + res.data.user.name);
        
        // Setelah login, arahkan ke halaman Agen atau Beranda
        navigate('/agen'); 
      }
    } catch (err) {
      // Mengambil pesan error dari Backend (UserController)
      const errorMsg = err.response?.data?.message || "Email atau password salah!";
      alert("Login Gagal: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] pt-20 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-4xl font-black text-gray-900 mb-2 text-center tracking-tight">Masuk</h2>
        <p className="text-gray-500 mb-8 font-medium text-center">Silahkan masuk ke akun PropertiKita Anda</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="nama@email.com"
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-lg transition shadow-xl active:scale-95 flex justify-center items-center
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}