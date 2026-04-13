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
// IMPORT HALAMAN BARU DISINI
import Tentang from './pages/Tentang';
import Agen from './pages/Agen';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dijual" element={<PropertiDijual />} />
          <Route path="/disewa" element={<PropertiDisewa />} />
          <Route path="/properti/:slug" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mapsearch" element={<MapSearch />} />
          
          {/* TAMBAHKAN ROUTE INI */}
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/agen" element={<Agen />} />

          <Route path="*" element={<div className="text-center py-20 font-bold">404 - Halaman Tidak Ditemukan</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;