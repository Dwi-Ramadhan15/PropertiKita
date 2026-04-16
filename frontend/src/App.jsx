import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import DaftarPropertiAgen from './pages/DaftarPropertiAgen';
import DashboardAgen from './pages/DashboardAgen';

// Komponen Pembungkus Utama agar useLocation bisa jalan
function AppContent() {
  const location = useLocation();

  // Daftar halaman yang TIDAK boleh ada Navbar User
  const hideNavbarPaths = ['/dashboard-agen'];
  
  // Cek apakah halaman saat ini masuk daftar sembunyi
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar User muncul secara kondisional */}
      {showNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dijual" element={<PropertiDijual />} />
        <Route path="/disewa" element={<PropertiDisewa />} />
        <Route path="/properti/:slug" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mapsearch" element={<MapSearch />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/agen" element={<Agen />} />
        <Route path="/properti" element={<DaftarPropertiAgen />} />
        
        {/* Halaman Khusus Agen */}
        <Route path="/dashboard-agen" element={<DashboardAgen />} />

        <Route path="*" element={
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-gray-800">404</h2>
            <p className="text-gray-500 font-medium">Halaman Tidak Ditemukan</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

// Komponen App sebagai entry point Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;