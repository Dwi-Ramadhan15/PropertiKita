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
            alert(`Registrasi Berhasil! Silahkan cek ${targetMedia} Anda untuk kode OTP.`);
            
            const targetIdentifier = formData.role === 'user' ? formData.whatsapp : formData.email;
            
            navigate('/verify', { 
                state: { 
                    identifier: targetIdentifier, 
                    role: formData.role 
                } 
            });

        } catch (err) {
            alert("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan koneksi"));
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
        handleRegister
    };
}