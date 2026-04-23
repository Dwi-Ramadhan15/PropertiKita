import { useState } from 'react';
import axios from 'axios';

export default function useVerify(navigate, email) {
  const [otp, setOtp] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });

      alert("Akun Anda Berhasil Aktif! Silahkan Login.");
      navigate('/login');

    } catch (err) {
      alert("Kode OTP Salah atau sudah kedaluwarsa!");
    }
  };

  return {
    otp,
    setOtp,
    handleVerify
  };
}