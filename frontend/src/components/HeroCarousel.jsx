import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Tarik Data dari Database
  useEffect(() => {
    const fetchHighlightProperties = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti');
        // Ambil datanya (dari GeoJSON)
        const allProperties = res.data.data.features;
        
        // Kita ambil maksimal 4 properti pertama untuk dijadikan slide
        const highlightData = allProperties.slice(0, 4).map(item => item.properties);
        
        setSlides(highlightData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hero data:", error);
        setLoading(false);
      }
    };
    fetchHighlightProperties();
  }, []);

  // 2. LOGIKA AUTOPLAY (Hanya jalan kalau slide lebih dari 1)
  useEffect(() => {
    if (slides.length <= 1) return; // Nggak perlu geser kalau data kosong/cuma 1

    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); 

    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };
  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  // Format harga untuk di banner
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return <div className="w-full h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">Memuat Banner...</div>;
  }

  // Kalau database benar-benar kosong
  if (slides.length === 0) {
    return <div className="w-full h-[500px] bg-gray-800 text-white flex items-center justify-center">Belum ada properti di database.</div>;
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden group">
      
      {/* Container Gambar */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Gambar Background (Pakai image_url dari database) */}
          <img 
            src={slide.imageUrl || "https://via.placeholder.com/2000x1000?text=No+Image"} 
            alt={slide.title} 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Warna Biru Transparan khas Figma */}
          <div className="absolute inset-0 bg-primary/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>

          {/* Teks di Tengah (Judul, Harga, Lokasi) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-semibold mb-4 border border-white/30">
              Properti Unggulan
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg transform transition-transform duration-700 translate-y-0 capitalize">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl font-bold drop-shadow-md text-blue-200">
              {formatRupiah(slide.harga)}
            </p>
            <p className="text-md mt-2 drop-shadow-md font-medium">
              📍 {slide.lokasi}
            </p>
          </div>
        </div>
      ))}

      {/* Tombol Kiri */}
      {slides.length > 1 && (
        <button 
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
        >
          <FiChevronLeft size={30} />
        </button>
      )}

      {/* Tombol Kanan */}
      {slides.length > 1 && (
        <button 
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
        >
          <FiChevronRight size={30} />
        </button>
      )}

      {/* Titik-titik Navigasi di Bawah */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
          {slides.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === current ? "w-10 bg-white shadow-lg" : "w-3 bg-white/50"
              }`}
            ></button>
          ))}
        </div>
      )}
      
    </div>
  );
}