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
      
      {/* BAGIAN FILTER - Diselipkan di sini (Garis Merah) */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-wrap md:flex-nowrap items-center gap-3">
          
          {/* Input Lokasi - Dibuat lebih kecil & ramping */}
          <div className="flex-1 min-w-[150px] relative">
            <input 
              type="text" 
              placeholder="Cari lokasi..." 
              className="w-full pl-4 pr-2 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilter({...filter, lokasi: e.target.value})}
            />
          </div>

          {/* Select Tipe */}
          <select className="w-full md:w-40 px-3 py-2.5 text-sm rounded-lg border border-gray-200 outline-none bg-white">
            <option>Semua Tipe</option>
            <option>Rumah</option>
            <option>Kosan</option>
          </select>

          {/* Select Harga */}
          <select className="w-full md:w-40 px-3 py-2.5 text-sm rounded-lg border border-gray-200 outline-none bg-white">
            <option>Rentang Harga</option>
            <option>Di bawah 1 Juta</option>
            <option>1jt - 5jt</option>
          </select>

          {/* Select Kamar */}
          <select className="w-full md:w-40 px-3 py-2.5 text-sm rounded-lg border border-gray-200 outline-none bg-white">
            <option>Kamar Tidur</option>
            <option>1+</option>
            <option>2+</option>
          </select>

          {/* Tombol Cari - Biru sesuai desain */}
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition shadow-md">
            Cari
          </button>
        </div>
      </div>

      {/* Grid Properti - Tetap aman di bawah filter */}
      <div className="mt-12 pb-20">
        <PropertyGrid />
      </div>
    </main>
  );
}