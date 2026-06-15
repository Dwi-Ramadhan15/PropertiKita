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
    const [loading, setLoading] = useState(false);
    
    // State baru untuk Toast Notification
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });

    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
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

            await axios.post('http://localhost:5000/api/users/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const targetMedia = formData.role === 'agen' ? 'Email' : 'WhatsApp';
            showToast(`Registrasi Berhasil! Mengalihkan... Silakan cek ${targetMedia} Anda untuk kode OTP.`, "success");
            const targetIdentifier = formData.role === 'user' ? formData.whatsapp : formData.email;
            setTimeout(() => {
                navigate('/verify', { 
                    state: { 
                        identifier: targetIdentifier, 
                        role: formData.role 
                    } 
                });
            }, 2500);

        } catch (err) {
            showToast(err.response?.data?.message || "Terjadi kesalahan koneksi server.", "error");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        profileImage,
        preview,
        loading,
        handleImageChange,
        handleRegister,
        toast,         
        setToast       
    };
}