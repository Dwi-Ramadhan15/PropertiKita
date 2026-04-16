import React, { useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import PropertyGrid from '../components/PropertyGrid';

export default function Home() {
  const [filter, setFilter] = useState({
    lokasi: '',
    tipe: '',
    harga: '',
    kamar: ''
  });

  return (
    <main className="bg-[#F8FAFC] min-h-screen">
      {/* 1. Banner Utama */}
      <HeroCarousel />

      {/* 2. Container Property Grid langsung tanpa Judul */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        {/* Langsung menampilkan Grid Properti tanpa elemen teks tambahan */}
        <PropertyGrid />
      </div>
    </main>
  );
}