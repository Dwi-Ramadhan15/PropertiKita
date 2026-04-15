import React from 'react';
import { FiUser } from 'react-icons/fi';
import { BsBuildingsFill } from 'react-icons/bs';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  // Fungsi helper untuk mengatur styling menu yang sedang aktif
  const activeStyles = ({ isActive }) => 
    isActive 
      ? "text-primary font-bold border-b-2 border-primary pb-1 transition-all" 
      : "hover:text-primary transition-all";

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-white shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-primary text-2xl font-bold cursor-pointer">
        <BsBuildingsFill />
        <span>PropertiKita</span>
      </Link>

      <ul className="flex gap-8 text-gray-500 font-medium">
        <li>
          <NavLink to="/" className={activeStyles} end>
            Beranda
          </NavLink>
        </li>
        <li>
          <NavLink to="/dijual" className={activeStyles}>
            Properti Dijual
          </NavLink>
        </li>
        <li>
          <NavLink to="/disewa" className={activeStyles}>
            Properti Disewa
          </NavLink>
        </li>
        <li>
          <NavLink to="/mapsearch" className={activeStyles}>
            Maps
          </NavLink>
        </li>
        <li>
          <NavLink to="/agen" className={activeStyles}>
            Agen
          </NavLink>
        </li>
        <li>
          <NavLink to="/tentang" className={activeStyles}>
            Tentang
          </NavLink>
        </li>
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