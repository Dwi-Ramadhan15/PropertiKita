// src/hooks/useRegister.js
import { useState } from 'react';
import axios from 'axios';

export default function useRegister(navigate) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        role: 'user'
    });

    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    // HANDLE IMAGE
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // REGISTER
    const handleRegister = async(e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('whatsapp', formData.whatsapp);
            data.append('password', formData.password);
            data.append('role', formData.role);

            if (profileImage) {
                data.append('image', profileImage);
            }

            await axios.post('/_/backend/api/users/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(`Anda telah mendapatkan pesan WhatsApp berisi kode OTP.`);
            setShowOtpModal(true);

        } catch (err) {
            alert("Gagal: " + (err.response ? .data ? .message || "Terjadi kesalahan koneksi"));
        }
    };

    // VERIFY OTP
    const handleVerifyOtp = async(e) => {
        e.preventDefault();
        try {
            const identifier =
                formData.role === 'user' ?
                formData.whatsapp :
                formData.email;

            await axios.post('/_/backend/api/users/verify-otp', {
                identifier,
                otp: otpCode
            });

            alert("Verifikasi Berhasil! Silakan Login.");
            setShowOtpModal(false);
            navigate('/login');

        } catch (err) {
            alert("Verifikasi Gagal: " + (err.response ? .data ? .message || "OTP Salah"));
        }
    };

    return {
        formData,
        setFormData,
        profileImage,
        preview,
        handleImageChange,
        handleRegister,
        handleVerifyOtp,
        showOtpModal,
        setShowOtpModal,
        otpCode,
        setOtpCode
    };
}