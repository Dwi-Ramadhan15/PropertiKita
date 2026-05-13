import { useState } from 'react';
import axios from 'axios';

export default function useLogin(navigate) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async(e) => {
        // Mencegah reload halaman
        if (e) e.preventDefault();

        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, {
                email: email,
                password: password
            });

            if (res.data.success) {
                const { token, user } = res.data;

                // Simpan kredensial ke local storage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                alert("Login Berhasil! Halo " + (user.name || "User"));

                // Logic redirect berdasarkan role
                if (user.role === 'admin') {
                    navigate('/dashboard-admin');
                } else if (user.role === 'agen') {
                    navigate('/dashboard-agen');
                } else {
                    navigate('/');
                }
            }

        } catch (err) {
            // PERBAIKAN DI SINI: Tanda tanya dan titik harus rapat (?.), tidak boleh ada spasi
            const errorMsg = err.response ? .data ? .message || "Email atau password salah!";
            alert("Login Gagal: " + errorMsg);
            console.error("Login Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        handleLogin
    };
}