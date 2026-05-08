import React from 'react';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logoPK from '../assets/logo.png'; 

const Footer = () => {
  return (
    <footer className="bg-[#1E293B] text-white py-12 px-6 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Kolom 1: Logo & Deskripsi */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {/* Mengganti teks PK dengan Image Logo */}
            <img 
              src={logoPK} 
              alt="Logo PropertiKita" 
              className="h-12 w-auto object-contain" 
            />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Properti<span className="text-[#C5A358]">Kita</span>
            </h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Platform properti premium untuk menemukan hunian impian Anda di seluruh Indonesia.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 text-white">Menu</h3>
          <ul className="space-y-4 text-gray-400">
            <li>
              <Link to="/" className="hover:text-[#C5A358] transition-all">Beranda</Link>
            </li>
            <li>
              <Link to="/dijual" className="hover:text-[#C5A358] transition-all">Properti Dijual</Link>
            </li>
            <li>
              <Link to="/disewa" className="hover:text-[#C5A358] transition-all">Properti Disewa</Link>
            </li>
            <li>
              <Link to="/agen" className="hover:text-[#C5A358] transition-all">Agen</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 text-white">Kontak</h3>
          <ul className="space-y-5">
            <li className="flex items-center gap-4 text-gray-400">
              <div className="text-[#C5A358] text-xl">
                <FaWhatsapp />
              </div>
              <span className="text-sm">+62 812-3456-7890</span>
            </li>
            <li className="flex items-center gap-4 text-gray-400">
              <div className="text-[#C5A358] text-xl">
                <FaEnvelope />
              </div>
              <a href="mailto:info@propertiku.id" className="text-sm hover:text-[#C5A358]">
                info@propertiku.id
              </a>
            </li>
            <li className="flex items-center gap-4 text-gray-400">
              <div className="text-[#C5A358] text-xl">
                <FaMapMarkerAlt />
              </div>
              <span className="text-sm">Lampung, Indonesia</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
        <p>&copy; {new Date().getFullYear()} PropertiKita. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/tentang" className="hover:text-white">Tentang Kami</Link>
          <span className="hidden md:inline">|</span>
          <span>Politeknik Negeri Lampung</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;