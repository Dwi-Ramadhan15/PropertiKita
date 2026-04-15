import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MapSearch from './pages/MapSearch'; 
import PropertiDijual from './pages/PropertiDijual';
import PropertiDisewa from './pages/PropertiDisewa';
import Tentang from './pages/Tentang';
import Agen from './pages/Agen';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Navbar akan selalu muncul di setiap halaman */}
        <Navbar />
        
        <Routes>
          {/* Halaman Utama */}
          <Route path="/" element={<Home />} />
          
          {/* Halaman Filter Properti */}
          <Route path="/dijual" element={<PropertiDijual />} />
          <Route path="/disewa" element={<PropertiDisewa />} />
          
          {/* Detail Properti menggunakan parameter slug dari Database */}
          <Route path="/properti/:slug" element={<PropertyDetail />} />
          
          {/* Autentikasi */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Fitur Maps */}
          <Route path="/mapsearch" element={<MapSearch />} />
          
          {/* Halaman Informasi & Agen */}
          <Route path="/tentang" element={<Tentang />} />
          
          {/* Halaman Agen (Data ditarik dari API Backend) */}
          <Route path="/agen" element={<Agen />} />

          {/* Fallback Halaman tidak ditemukan */}
          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold text-gray-800">404</h2>
              <p className="text-gray-500 font-medium">Halaman Tidak Ditemukan</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;