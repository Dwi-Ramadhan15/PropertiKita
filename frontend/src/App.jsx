import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Pastikan file Footer.jsx sudah dibuat
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import MapSearch from './pages/MapSearch'; 
import PropertiDijual from './pages/PropertiDijual';
import PropertiDisewa from './pages/PropertiDisewa';
import Tentang from './pages/Tentang';
import Agen from './pages/Agen';
import DaftarPropertiAgen from './pages/DaftarPropertiAgen';
import DashboardAgen from './pages/DashboardAgen';
import DashboardAdmin from './pages/DashboardAdmin';
import ProfileUser from './pages/ProfileUser';
import VerifyResetOtp from './pages/VerifyResetOtp';

function AppContent() {
  const location = useLocation();

  // Menentukan path mana saja yang akan menampilkan Footer
  const showFooterPaths = ['/', '/dijual', '/disewa', '/agen', '/tentang'];
  const shouldShowFooter = showFooterPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Navbar muncul di semua halaman */}
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dijual" element={<PropertiDijual />} />
          <Route path="/disewa" element={<PropertiDisewa />} />
          <Route path="/properti/:slug" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify/>} />
          <Route path="/lupa-password" element={<ForgotPassword />} /> 
          <Route path="/mapsearch" element={<MapSearch />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/agen" element={<Agen />} />
          <Route path="/properti" element={<DaftarPropertiAgen />} />
          <Route path="/dashboard-user" element={<ProfileUser />} />
          <Route path="/dashboard-agen" element={<DashboardAgen />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          
          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold text-gray-800">404</h2>
              <p className="text-gray-500 font-medium">Halaman Tidak Ditemukan</p>
            </div>
          } />
        </Routes>
      </main>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;