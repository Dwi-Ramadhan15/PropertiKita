import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert("Login Berhasil!");
      navigate('/');
    } catch (err) {
      alert("Login Gagal: " + (err.response?.data?.message || "Cek koneksi internet"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-4xl font-black text-gray-900 mb-2 text-center">Masuk</h2>
        <p className="text-gray-500 mb-8 font-medium text-center">Silahkan masuk ke akun Anda</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" 
            placeholder="Email"
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl active:scale-95">
            Masuk Sekarang
          </button>
        </form>

        {/* POIN PENTING: Link ke Register */}
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