import { useState } from 'react';
import axios from 'axios';

export default function useVerify(navigate, identifier) {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!identifier) return alert("Data hilang, silakan register ulang.");
        
        setLoading(true);
        const finalOtp = otp.join('');
        
        try {
            await axios.post('http://localhost:5000/api/users/verify-otp', {
                email: identifier,
                whatsapp: identifier,
                identifier: identifier,
                otp: finalOtp
            });

            alert("Akun Anda Berhasil Aktif! Silahkan Login.");
            navigate('/login');

        } catch (err) {
            alert(err.response?.data?.message || "Kode OTP Salah atau sudah kedaluwarsa!");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!identifier || resendLoading) return;
        
        setResendLoading(true);
        try {
            await axios.post('http://localhost:5000/api/users/forgot-password', {
                email: identifier,
                whatsapp: identifier
            });
            alert("OTP baru telah dikirim ke " + identifier);
        } catch (err) {
            alert("Gagal kirim ulang: " + (err.response?.data?.message || "Terjadi kesalahan server"));
        } finally {
            setResendLoading(false);
        }
    };

    return {
        otp,
        setOtp,
        loading,
        resendLoading,
        handleVerify,
        handleResend
    };
}