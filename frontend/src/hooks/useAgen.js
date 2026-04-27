import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useAgen(navigate) {
  const [daftarAgen, setDaftarAgen] = useState([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const formatFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return `http://127.0.0.1:9000/propertikita/${foto}`;
  };

  useEffect(() => {
    const fetchAgen = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/agen');

        if (res.data.success || res.data.data) {
          const data = res.data.data || res.data;

          // 🔥 PENTING: pastikan ada user_id
          const mapped = data.map((ag) => ({
            ...ag,
            user_id: ag.user_id || ag.id // fallback kalau backend belum kirim user_id
          }));

          setDaftarAgen(mapped);
        }
      } catch (error) {
        console.error("Error fetch agen:", error);
      } finally {
        setLoading(false);
      }
    };

        fetchAgen();
    }, []);

  const handleWhatsApp = (ag) => {
    const token = localStorage.getItem('token');

    if (!token || !currentUser) {
      alert("Wajib login dulu. Mau ke halaman login sekarang?");
      navigate('/login');
    } else {
      const phone = ag.no_whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Halo ${ag.nama_agen}, perkenalkan saya ${currentUser.name}. Saya tertarik dengan properti Anda di PropertiKita.`
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