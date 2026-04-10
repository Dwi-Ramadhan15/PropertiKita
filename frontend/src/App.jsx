import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Komponen
import Navbar from './components/Navbar';

// Import Halaman (Pages)
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login'; 
import Register from './pages/Register'; 

function App() {
  return (
    <Router>
      {/* Container utama dengan background soft gray */}
      <div className="min-h-screen bg-[#F8FAFC]">
        
        {/* Navbar akan selalu muncul di setiap halaman */}
        <Navbar />

        {/* Sistem Routing Aplikasi */}
        <Routes>
          {/* Halaman Beranda / Landig Page */}
          <Route path="/" element={<Home />} />

          {/* Halaman Detail Properti berdasarkan ID */}
          <Route path="/properti/:id" element={<PropertyDetail />} />

          {/* Halaman Autentikasi */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Fallback jika route tidak ditemukan (Opsional) */}
          <Route path="*" element={<div className="text-center py-20 font-bold">404 - Halaman Tidak Ditemukan</div>} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;