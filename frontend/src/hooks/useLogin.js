import { useState } from 'react';
import axios from 'axios';

export default function useLogin(navigate) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });

    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
    };

    const handleLogin = async(e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, {
                email: email,
                password: password
            });

            if (res.data.success) {
                const { token, user } = res.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                showToast("Login Berhasil! Halo " + (user.name || "User"), "success");

                setTimeout(() => {
                    if (user.role === 'admin') {
                        navigate('/dashboard-admin');
                    } else if (user.role === 'agen') {
                        navigate('/dashboard-agen');
                    } else {
                        navigate('/');
                    }
                }, 2000);
            }

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Email atau password salah!";
            showToast("Login Gagal: " + errorMsg, "error");
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
        handleLogin,
        toast,
        setToast
    };
}