import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MapSearch from './pages/MapSearch'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properti/:slug" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. TAMBAHKAN ROUTE UNTUK MAPSEARCH DI SINI */}
          {/* Pastikan path-nya "/mapsearch" sesuai dengan yang ada di Navbar */}
          <Route path="/mapsearch" element={<MapSearch />} />

          {/* Route Fallback (Jika nyasar) */}
          <Route path="*" element={<div className="text-center py-20 font-bold">404 - Halaman Tidak Ditemukan</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;