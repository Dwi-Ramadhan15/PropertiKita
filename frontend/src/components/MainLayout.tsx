import React from 'react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen font-['Plus_Jakarta_Sans']">
      {/* NAVBAR */}
      <nav className="navbar-custom">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200"></div>
          <span className="font-extrabold text-blue-900 text-lg tracking-tight">PropertiKu</span>
        </div>

        <div className="nav-menu-center hidden md:flex items-center gap-8">
          <button className="nav-item active">Beranda</button>
          <button className="nav-item">Properti Dijual</button>
          <button className="nav-item">Properti Disewa</button>
          <button className="nav-item">Tentang</button>
        </div>

        <div className="flex items-center gap-6">
          <button className="nav-item hidden sm:block">Agen</button>
          <div className="text-gray-300 text-xl cursor-pointer hover:text-red-400 transition-colors">♡</div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
            Pasang Iklan
          </button>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default MainLayout;