import React from 'react';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { BsBuildingsFill } from 'react-icons/bs';
import { NavLink, Link } from 'react-router-dom';
import useAuthNavbar from '../hooks/useAuthNavbar';
import logo from '../assets/logo.png';

export default function Navbar() {

  const {
    user,
    getDashboardLink,
    handleLogout
  } = useAuthNavbar();

  const activeStyles = ({ isActive }) => 
    isActive 
      ? "text-[#D9AB7B] font-bold border-b-2 border-[#D9AB7B] pb-1 transition-all" 
      : "hover:text-[#D9AB7B] transition-all";

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-[#1E293B] shadow-sm sticky top-0 z-50">
      
      {/* LOGO */}
      <Link to="/" className="flex items-center gap-3 cursor-pointer">
        <img 
          src={logo} 
          alt="PropertiKita Logo" 
          className="h-10 w-auto object-contain"
        />
        <span className="text-2xl font-bold text-[#D9AB7B]">PropertiKita</span>
      </Link>

      {/* MENU */}
      <ul className="flex gap-8 text-white font-medium">
        <li><NavLink to="/" className={activeStyles} end>Beranda</NavLink></li>
        <li><NavLink to="/dijual" className={activeStyles}>Properti Dijual</NavLink></li>
        <li><NavLink to="/disewa" className={activeStyles}>Properti Disewa</NavLink></li>
        <li><NavLink to="/mapsearch" className={activeStyles}>Maps</NavLink></li>
        <li><NavLink to="/agen" className={activeStyles}>Agen</NavLink></li>
        <li><NavLink to="/tentang" className={activeStyles}>Tentang</NavLink></li>
      </ul>

      {/* USER AREA */}
      {user ? (
        <div className="flex items-center gap-5">
          
          {/* USER NAME */}
          <div className="flex items-center gap-2 text-white font-medium">
            <FiUser className="text-xl text-[#D9AB7B]" />
            <span>
              Halo, <span className="font-bold">{user.name.split(' ')[0]}</span>
            </span>
          </div>

          {/* DASHBOARD */}
          <Link 
            to={getDashboardLink()} 
            className="bg-[#D9AB7B] text-[#1E293B] px-6 py-2.5 rounded-xl font-bold hover:bg-[#c49a6e] transition-all shadow-md active:scale-95"
          >
            Dashboard
          </Link>

          {/* LOGOUT */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 px-6 py-2.5 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
          >
            <FiLogOut /> Logout
          </button>

        </div>
      ) : (
        <div className="flex items-center gap-6">
          <FiUser className="text-2xl cursor-pointer text-gray-300 hover:text-[#D9AB7B] transition" />
          <Link 
            to="/login" 
            className="bg-[#D9AB7B] text-[#1E293B] px-8 py-2.5 rounded-xl font-bold hover:bg-[#c49a6e] transition-all shadow-md active:scale-95"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}