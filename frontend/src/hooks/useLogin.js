import { useState } from 'react';
import axios from 'axios';

export default function useLogin(navigate) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async(e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/_/backend/api/users/login', {
                email: email,
                password: password
            });

            if (res.data.success) {
                const { token, user } = res.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                alert("Login Berhasil! Halo " + user.name);

                if (user.role === 'admin') {
                    navigate('/dashboard-admin');
                } else if (user.role === 'agen') {
                    navigate('/dashboard-agen');
                } else {
                    navigate('/');
                }
            }

        } catch (err) {
            const errorMsg = err.response ? .data ? .message || "Email atau password salah!";
            alert("Login Gagal: " + errorMsg);
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