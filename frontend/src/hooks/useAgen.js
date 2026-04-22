import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useAgen(navigate) {
  const [daftarAgen, setDaftarAgen] = useState([]);
  const [loading, setLoading] = useState(true);

  // ambil user login
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // format foto
  const formatFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:9000/propertikita/${foto}`;
  };

  // fetch data agen
  useEffect(() => {
    const fetchAgen = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/agen');
        if (res.data.success || res.data.data) {
          setDaftarAgen(res.data.data || res.data);
        }
      } catch (error) {
        console.error("Error fetch agen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgen();
  }, []);

  // whatsapp handler
  const handleWhatsApp = (ag) => {
    const token = localStorage.getItem('token');

    if (!token || !currentUser) {
      alert("Wajib Login! Bestie harus masuk akun dulu untuk menghubungi agen.");
      navigate('/login');
    } else {
      const phone = ag.no_whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Halo ${ag.nama_agen}, perkenalkan saya ${currentUser.name}. Saya tertarik dengan properti Anda yang ada di PropertiKita dan ingin berdiskusi lebih lanjut.`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  return {
    daftarAgen,
    loading,
    formatFotoUrl,
    handleWhatsApp,
  };
}