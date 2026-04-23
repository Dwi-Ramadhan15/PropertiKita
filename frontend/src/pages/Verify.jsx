<<<<<<< HEAD
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useVerify from '../hooks/useVerify';
=======
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
>>>>>>> ayu

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
<<<<<<< HEAD

  const { email, phone, role } = location.state || {};

  const {
    otp,
    setOtp,
    handleVerify
  } = useVerify(navigate, email);
=======
  const [otp, setOtp] = useState('');
  
  // Mengambil data dari halaman Register
  const { email, phone, role } = location.state || {};

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      alert("Akun Anda Berhasil Aktif! Silahkan Login.");
      navigate('/login');
    } catch (err) {
      alert("Kode OTP Salah atau sudah kedaluwarsa!");
    }
  };
>>>>>>> ayu

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-gray-100">
<<<<<<< HEAD
        
=======
>>>>>>> ayu
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          {role === 'user' ? '📱' : '📧'}
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2">Verifikasi Akun</h2>
<<<<<<< HEAD

=======
>>>>>>> ayu
        <p className="text-gray-500 mb-8 font-medium">
          Kami telah mengirimkan kode OTP ke <br/>
          <span className="text-blue-600 font-bold">
            {role === 'user' ? `WhatsApp: ${phone}` : `Email: ${email}`}
          </span>
        </p>
<<<<<<< HEAD

        <form onSubmit={handleVerify} className="space-y-6">
          <input 
            type="text"
            value={otp}
            maxLength="6"
            placeholder="000000"
            className="w-full p-5 text-center text-4xl tracking-[0.4em] font-black bg-gray-50 rounded-2xl border-2 focus:border-blue-500 outline-none"
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">
=======
        
        <form onSubmit={handleVerify} className="space-y-6">
          <input 
            type="text" 
            maxLength="6" 
            placeholder="000000"
            className="w-full p-5 text-center text-4xl tracking-[0.4em] font-black bg-gray-50 rounded-2xl border-2 focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl active:scale-95">
>>>>>>> ayu
            Verifikasi Sekarang
          </button>
        </form>

        <p className="mt-8 text-gray-400 text-sm">
<<<<<<< HEAD
          Tidak menerima kode? 
          <button className="text-blue-600 font-bold ml-1">
            Kirim Ulang
          </button>
=======
          Tidak menerima kode? <button className="text-blue-600 font-bold hover:underline">Kirim Ulang</button>
>>>>>>> ayu
        </p>
      </div>
    </div>
  );
}