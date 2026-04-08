import React, { useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import PropertyGrid from '../components/PropertyGrid';

export default function Home() {
  // State untuk menyimpan pilihan filter user
  const [filter, setFilter] = useState({
    lokasi: '',
    tipe: '',
    harga: '',
    kamar: ''
  });

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Banner Utama - Tetap seperti aslinya agar bisa geser/gerak */}
      <HeroCarousel />
      <div>
        <PropertyGrid />
      </div>
    </main>
  );
}