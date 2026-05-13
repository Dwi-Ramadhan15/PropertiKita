import React, { useState } from 'react';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { NavLink, Link } from 'react-router-dom';
import useAuthNavbar from '../hooks/useAuthNavbar';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, getDashboardLink, handleLogout } = useAuthNavbar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeStyles = ({ isActive }) => 
    isActive 
      ? "text-[#D9AB7B] font-bold lg:border-b-2 border-[#D9AB7B] pb-1 transition-all" 
      : "hover:text-[#D9AB7B] transition-all";

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="flex items-center justify-between py-4 px-6 lg:px-10 bg-[#1E293B] shadow-sm sticky top-0 z-50">

      <div className="flex items-center gap-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="text-white text-2xl lg:hidden"
        >
          <FiMenu />
        </button>

        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img 
            src={logo} 
            alt="PropertiKita Logo" 
            className="h-8 lg:h-10 w-auto object-contain"
          />
          <span className="text-xl lg:text-2xl font-bold text-[#D9AB7B] hidden sm:block">PropertiKita</span>
        </Link>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={closeMenu}
        ></div>
      )}

      <div className={`fixed top-0 left-0 h-screen w-[280px] bg-[#1E293B] lg:static lg:h-auto lg:w-auto lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center gap-8 transition-transform duration-300 z-50 p-8 lg:p-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'} lg:flex-1 lg:justify-between`}>
        
        <div className="w-full flex justify-between items-center mb-4 lg:hidden border-b border-slate-700 pb-4">
          <span className="text-lg font-bold text-[#D9AB7B]">Menu Navigasi</span>
          <button onClick={closeMenu} className="text-white text-2xl hover:text-red-400 transition-colors">
            <FiX />
          </button>
        </div>

        <ul className="flex flex-col lg:flex-row gap-6 lg:gap-8 text-white font-medium text-left lg:text-base w-full lg:w-auto lg:mx-auto">
          <li><NavLink to="/" onClick={closeMenu} className={activeStyles} end>Beranda</NavLink></li>
          <li><NavLink to="/dijual" onClick={closeMenu} className={activeStyles}>Properti Dijual</NavLink></li>
          <li><NavLink to="/disewa" onClick={closeMenu} className={activeStyles}>Properti Disewa</NavLink></li>
          <li><NavLink to="/mapsearch" onClick={closeMenu} className={activeStyles}>Maps</NavLink></li>
          <li><NavLink to="/agen" onClick={closeMenu} className={activeStyles}>Agen</NavLink></li>
          <li><NavLink to="/tentang" onClick={closeMenu} className={activeStyles}>Tentang</NavLink></li>
        </ul>

        <div className="mt-auto lg:mt-0 w-full lg:w-auto pt-6 lg:pt-0 border-t border-slate-700 lg:border-none flex-shrink-0">
          {user ? (
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-5">
              <div className="flex items-center gap-2 text-white font-medium">
                <FiUser className="text-xl text-[#D9AB7B]" />
                <span>Halo, <span className="font-bold">{user.name.split(' ')[0]}</span></span>
              </div>

              <Link 
                to={getDashboardLink()} 
                onClick={closeMenu}
                className="bg-[#D9AB7B] text-[#1E293B] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c49a6e] transition-all shadow-md active:scale-95 w-full lg:w-auto text-center"
              >
                Dashboard
              </Link>

              <button 
                onClick={() => { handleLogout(); closeMenu(); }}
                className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all border border-red-500/20 w-full lg:w-auto"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 w-full lg:w-auto">
              <FiUser className="text-2xl cursor-pointer text-gray-300 hover:text-[#D9AB7B] transition hidden lg:block" />
              <Link 
                to="/login" 
                onClick={closeMenu}
                className="bg-[#D9AB7B] text-[#1E293B] px-8 py-2.5 rounded-xl font-bold hover:bg-[#c49a6e] transition-all shadow-md active:scale-95 w-full lg:w-auto text-center"
              >
                Login
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}