import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function usePropertyDetail(slug) {
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [agen, setAgen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const fetchDetail = async() => {
            try {
                const res = await axios.get(
                    `/_/backend/api/properti/${slug}`
                );
                setItem(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    // FETCH DATA AGEN
    useEffect(() => {
        if (!item ? .id_agen) return;

        const fetchAgen = async() => {
            try {
                const res = await axios.get("/_/backend/api/agen");
                const found = res.data.data.find(
                    (a) => Number(a.id) === Number(item.id_agen)
                );
                setAgen(found || null);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAgen();
    }, [item]);

    const formatFotoUrl = (foto) => {
        if (!foto) return null;
        if (foto.startsWith("http")) return foto;
        return `http://127.0.0.1:9000/propertikita/${foto}`;
    };

    const images = item ? .images ? .length ?
        item.images :
        item ? .gallery ? .length ?
        item.gallery :
        item ? .image_url ?
        [item.image_url] :
        [];

    // AUTO SLIDE
    useEffect(() => {
        if (images.length < 2) return;
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images]);

    // MAP POSITION
    const position = [
        parseFloat(item ? .latitude) || 0,
        parseFloat(item ? .longitude) || 0,
    ];

    const mapsUrl = `https://www.google.com/maps?q=${item?.latitude},${item?.longitude}`;

    const rawNumber = agen ? .no_wa || item ? .no_whatsapp || "";
    const waUrl = `https://wa.me/${rawNumber.replace(/^0/, "62")}`;

    // HUBUNGI AGEN (Sudah diperbaiki)
    const handleHubungiAgen = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            const goLogin = window.confirm(
                "Wajib login dulu. Mau ke halaman login sekarang?"
            );

            if (goLogin) {
                navigate("/login");
            }
            return;
        }
        if (rawNumber) {
            window.open(waUrl, "_blank");
        } else {
            alert("Nomor WhatsApp agen tidak ditemukan.");
        }
    };

    return {
        item,
        agen,
        loading,
        images,
        currentImage,
        setCurrentImage,
        position,
        mapsUrl,
        handleHubungiAgen,
        formatFotoUrl,
    };
}