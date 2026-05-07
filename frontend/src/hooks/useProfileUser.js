import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function useProfileUser() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: ''
    });

    const API_URL = '/_/backend/api/users';

    useEffect(() => {
        fetchProfile();
    }, []);


    const fetchProfile = async() => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            const res = await axios.get(`${API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userData = res.data.data || res.data.user || res.data;

            setUser(userData);

            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone_number: userData.phone_number || ''
            });

            setLoading(false);
        } catch (error) {
            console.log(error);

            if (
                error.response && error.response.status === 401 ||
                error.response && error.response.status === 403
            ) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                Swal.fire(
                    'Sesi Login Habis',
                    'Silakan login kembali.',
                    'warning'
                );

                navigate('/login');
            } else {
                Swal.fire(
                    'Gagal',
                    'Tidak bisa mengambil data profil.',
                    'error'
                );
            }

            setLoading(false);
        }
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadAvatar = async() => {
        try {
            const token = localStorage.getItem('token');

            const data = new FormData();
            data.append('avatar', selectedFile);

            const res = await axios.post(`${API_URL}/avatar`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                Swal.fire(
                    'Berhasil',
                    'Foto profil diperbarui.',
                    'success'
                );

                setSelectedFile(null);
                setPreview(null);

                fetchProfile();
            }
        } catch (error) {
            Swal.fire(
                'Gagal',
                'Upload foto gagal.',
                'error'
            );
        }
    };

    const handleUpdateInfo = async(e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            await axios.put(`${API_URL}/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            Swal.fire(
                'Berhasil',
                'Data profil diperbarui.',
                'success'
            );

            setIsEditing(false);

            fetchProfile();
        } catch (error) {
            Swal.fire(
                'Gagal',
                'Update profil gagal.',
                'error'
            );
        }
    };

    return {
        user,
        loading,
        isEditing,
        selectedFile,
        preview,
        formData,
        setFormData,
        setIsEditing,
        fetchProfile,
        handleFileChange,
        handleUploadAvatar,
        handleUpdateInfo
    };
}