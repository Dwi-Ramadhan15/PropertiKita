import React from 'react';
import { FiUser } from 'react-icons/fi';
import { BsBuildingsFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-white shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-primary text-2xl font-bold cursor-pointer">
        <BsBuildingsFill />
        <span>PropertiKita</span>
      </Link>

      <ul className="flex gap-8 text-gray-500 font-medium">
        <li><Link to="/" className="hover:text-primary transition">Beranda</Link></li>
        <li><Link to="/dijual" className="hover:text-primary transition">Properti Dijual</Link></li>
        <li><Link to="/disewa" className="hover:text-primary transition">Properti Disewa</Link></li>
        <li><Link to="/mapsearch" className="hover:text-primary transition">Maps</Link></li>
        
        {/* AKTIFKAN LINK DISINI */}
        <li><Link to="/agen" className="hover:text-primary transition">Agen</Link></li>
        <li><Link to="/tentang" className="hover:text-primary transition">Tentang</Link></li>
      </ul>

      <div className="flex items-center gap-6 text-gray-600">
        <FiUser className="text-2xl cursor-pointer hover:text-primary transition" />
        <Link to="/login" className="bg-primary text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
          Login
        </Link>
      </div>
    </nav>
  );
}