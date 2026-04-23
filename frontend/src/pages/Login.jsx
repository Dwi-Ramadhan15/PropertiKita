<<<<<<< HEAD
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useLogin from '../hooks/useLogin';

export default function Login() {
  const navigate = useNavigate();

  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin
  } = useLogin(navigate);
=======
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { 
            identifier: email, 
            password: password 
          });
      
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); 
        
        alert("Login Berhasil! Halo " + user.name);
        
        if (user.role === 'admin') {
          navigate('/dashboard-admin');
        } else if (user.role === 'agen') {
          navigate('/dashboard-agen'); 
        } else {
          navigate('/'); 
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email atau password salah!";
      alert("Login Gagal: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> ayu

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] pt-20 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-4xl font-black text-gray-900 mb-2 text-center tracking-tight">Masuk</h2>
        <p className="text-gray-500 mb-8 font-medium text-center">Silahkan masuk ke akun PropertiKita Anda</p>
<<<<<<< HEAD

        <form onSubmit={handleLogin} className="space-y-6">

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <input 
              type="email"
              value={email}
=======
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <input 
              type="email" 
>>>>>>> ayu
              placeholder="nama@email.com"
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input 
<<<<<<< HEAD
              type="password"
              value={password}
=======
              type="password" 
>>>>>>> ayu
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
<<<<<<< HEAD
            type="submit"
=======
            type="submit" 
>>>>>>> ayu
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