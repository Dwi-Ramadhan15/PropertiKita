import React from 'react';
import { FiUser } from 'react-icons/fi';
import { BsBuildingsFill } from 'react-icons/bs';
// Import Link dari react-router-dom untuk navigasi internal
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-white shadow-sm sticky top-0 z-50">
      
      {/* Bagian Kiri: Logo - Klik untuk kembali ke Beranda */}
      <Link 
        to="/" 
        className="flex items-center gap-2 text-primary text-2xl font-bold cursor-pointer"
      >
        <BsBuildingsFill />
        <span>PropertiKita</span>
      </Link>

      {/* Bagian Tengah: Menu Navigasi */}
      <ul className="flex gap-8 text-gray-500 font-medium">
        <li>
          <Link to="/" className="text-black font-semibold cursor-pointer hover:text-primary transition">
            Beranda
          </Link>
        </li>
        <li className="cursor-pointer hover:text-primary transition">Properti Dijual</li>
        <li className="cursor-pointer hover:text-primary transition">Properti Disewa</li>
        <li className="cursor-pointer hover:text-primary transition">Agen</li>
        <li className="cursor-pointer hover:text-primary transition">Tentang</li>
      </ul>

      {/* Bagian Kanan: Akun & Tombol Login */}
      <div className="flex items-center gap-6 text-gray-600">
        <FiUser className="text-2xl cursor-pointer hover:text-primary transition" />
        
        {/* Tombol Login diarahkan ke route /login */}
        <Link 
          to="/login" 
          className="bg-primary text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}