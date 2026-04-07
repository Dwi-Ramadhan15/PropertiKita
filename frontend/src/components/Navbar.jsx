import React from 'react';
import { FiHeart, FiUser } from 'react-icons/fi';
import { BsBuildingsFill } from 'react-icons/bs';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-white shadow-sm sticky top-0 z-50">
      {/* Bagian Kiri: Logo */}
      <div className="flex items-center gap-2 text-primary text-2xl font-bold cursor-pointer">
        <BsBuildingsFill />
        <span>PropertiKu</span>
      </div>

      {/* Bagian Tengah: Menu Navigasi */}
      <ul className="flex gap-8 text-gray-500 font-medium">
        <li className="text-black font-semibold cursor-pointer hover:text-primary transition">Beranda</li>
        <li className="cursor-pointer hover:text-primary transition">Properti Dijual</li>
        <li className="cursor-pointer hover:text-primary transition">Properti Disewa</li>
        <li className="cursor-pointer hover:text-primary transition">Agen</li>
        <li className="cursor-pointer hover:text-primary transition">Tentang</li>
      </ul>

      {/* Bagian Kanan: Ikon & Tombol */}
      <div className="flex items-center gap-6 text-gray-600">
        <FiHeart className="text-2xl cursor-pointer hover:text-primary transition" />
        <FiUser className="text-2xl cursor-pointer hover:text-primary transition" />
        <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
          Pasang Iklan
        </button>
      </div>
    </nav>
  );
}