import { useState } from 'react';
import axios from 'axios';

export default function useVerify(navigate, identifier) {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });

    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!identifier) return showToast("Data hilang, silakan register ulang.", "error");
        
        setLoading(true);
        const finalOtp = otp.join('');
        
        try {
            await axios.post('http://localhost:5000/api/users/verify-otp', {
                email: identifier,
                whatsapp: identifier,
                identifier: identifier,
                otp: finalOtp
            });

            showToast("Akun Anda Berhasil Aktif! Mengalihkan ke halaman Login...", "success");
            
            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (err) {
            showToast(err.response?.data?.message || "Kode OTP Salah atau sudah kedaluwarsa!", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!identifier || resendLoading) return;
        
        setResendLoading(true);
        try {
            await axios.post('http://localhost:5000/api/users/resend-otp', {
                identifier: identifier
            });
            showToast("OTP baru telah dikirim ke " + identifier, "success");
        } catch (err) {
            showToast("Gagal kirim ulang: " + (err.response?.data?.message || "Terjadi kesalahan server"), "error");
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
        handleResend,
        toast,
        setToast
    };
}