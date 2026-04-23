<<<<<<< HEAD
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiCamera } from 'react-icons/fi';
import bgImage from '../assets/rumah-mewah-Armada.jpg'; 

import useRegister from '../hooks/useRegister';

export default function Register() {
  const navigate = useNavigate();

  const {
    formData,
    setFormData,
    preview,
    handleImageChange,
    handleRegister,
    handleVerifyOtp,
    showOtpModal,
    setShowOtpModal,
    otpCode,
    setOtpCode
  } = useRegister(navigate);
=======
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiUser, FiPhone, FiCamera } from 'react-icons/fi';
import bgImage from '../assets/rumah-mewah-Armada.jpg'; 

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    role: 'user' 
  });
  
  // State khusus untuk File Gambar
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const navigate = useNavigate();

  // Handle Perubahan Gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file)); // Buat preview gambar
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Gunakan FormData karena ada pengiriman File
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('whatsapp', formData.whatsapp);
      data.append('password', formData.password);
      data.append('role', formData.role);
      if (profileImage) {
        data.append('image', profileImage); // 'image' harus sesuai dengan multer di backend
      }

      const res = await axios.post('http://localhost:5000/api/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert(`Anda telah mendapatkan pesan WhatsApp berisi kode OTP.`);
      setShowOtpModal(true);
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan koneksi"));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const identifier = formData.role === 'user' ? formData.whatsapp : formData.email;
      await axios.post('http://localhost:5000/api/users/verify-otp', {
        identifier: identifier,
        otp: otpCode
      });
      alert("Verifikasi Berhasil! Silakan Login.");
      setShowOtpModal(false);
      navigate('/login'); 
    } catch (err) {
      alert("Verifikasi Gagal: " + (err.response?.data?.message || "OTP Salah"));
    }
  };
>>>>>>> ayu

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat pt-10 px-4 pb-16 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="bg-white/95 p-10 rounded-[3rem] shadow-2xl w-full max-w-lg border border-gray-100 relative z-20 backdrop-blur-sm">
        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">Daftar Akun</h2>
        <p className="text-gray-500 mb-8 text-center font-medium">Lengkapi data untuk bergabung di PropertiKita</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          
<<<<<<< HEAD
          {/* FOTO PROFIL */}
=======
          {/* INPUT FOTO PROFIL - Lingkaran di Tengah */}
>>>>>>> ayu
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-4xl text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-blue-700 transition">
                <FiCamera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">Tambah Foto Profil</p>
          </div>

<<<<<<< HEAD
          {/* ROLE */}
=======
>>>>>>> ayu
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
            <button 
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition ${formData.role === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              onClick={() => setFormData({...formData, role: 'user'})}
            >User Biasa</button>
<<<<<<< HEAD

=======
>>>>>>> ayu
            <button 
              type="button"
              className={`flex-1 py-3 rounded-xl font-bold transition ${formData.role === 'agen' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              onClick={() => setFormData({...formData, role: 'agen'})}
            >Agen Properti</button>
          </div>

<<<<<<< HEAD
          {/* INPUT */}
=======
          {/* ... Input Name, Email, WhatsApp, Password tetap sama seperti kode kamu ... */}
>>>>>>> ayu
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Nama Lengkap" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, name: e.target.value})} required 
            />
          </div>
          
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" placeholder="Email Aktif" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, email: e.target.value})} required={formData.role === 'agen'} 
            />
          </div>
          
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Nomor WhatsApp (08xxxx)" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} required={formData.role === 'user'} 
            />
          </div>
          
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" placeholder="Password" 
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-200"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required 
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200 active:scale-95 mt-4">
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Masuk</Link>
        </p>
      </div>

<<<<<<< HEAD
      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-2xl font-black mb-2">Masukkan OTP</h3>
            <p className="text-gray-500 text-sm mb-6">
              Kode dikirim ke {formData.role === 'user' ? formData.whatsapp : formData.email}
=======
      {/* ... Modal OTP tetap sama ... */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm text-center transform transition-all scale-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Masukkan OTP</h3>
            <p className="text-gray-500 text-sm mb-6">
              Kode telah dikirim ke {formData.role === 'user' ? formData.whatsapp : formData.email}
>>>>>>> ayu
            </p>
            
            <form onSubmit={handleVerifyOtp}>
              <input 
                type="text" 
                maxLength="6"
<<<<<<< HEAD
                className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 mb-6 bg-gray-50 rounded-2xl"
                onChange={(e) => setOtpCode(e.target.value)} 
                required 
              />
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">
                Verifikasi
              </button>
            </form>

            <button 
              onClick={() => setShowOtpModal(false)}
              className="mt-4 text-gray-400 text-sm font-bold"
=======
                placeholder="• • • • • •" 
                className="w-full text-center text-3xl tracking-[0.5em] font-bold p-4 mb-6 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-transparent"
                onChange={(e) => setOtpCode(e.target.value)} 
                required 
              />
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl active:scale-95"
              >
                Verifikasi
              </button>
            </form>
            
            <button 
              onClick={() => setShowOtpModal(false)}
              className="mt-4 text-gray-400 text-sm hover:text-gray-600 font-bold"
>>>>>>> ayu
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}