import React from 'react';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { BsBuildingsFill } from 'react-icons/bs';
import { NavLink, Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Mengambil data user dari localStorage (yang disimpan saat login)
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const activeStyles = ({ isActive }) => 
    isActive 
      ? "text-primary font-bold border-b-2 border-primary pb-1 transition-all" 
      : "hover:text-primary transition-all";

  // Fungsi untuk Logout
  const handleLogout = () => {
    // Hapus sesi dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Arahkan kembali ke halaman login atau beranda
    navigate('/login');
  };

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

      {/* CONDITIONAL RENDERING: Cek apakah user sudah login atau belum */}
      {user ? (
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <FiUser className="text-xl text-primary" />
            <span>Halo, <span className="font-bold">{user.name.split(' ')[0]}</span></span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-red-100 hover:text-red-700 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6 text-gray-600">
          <FiUser className="text-2xl cursor-pointer hover:text-primary transition" />
          <Link to="/login" className="bg-primary text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}