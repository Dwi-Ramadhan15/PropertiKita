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
import DaftarPropertiAgen from './pages/DaftarPropertiAgen';
import DashboardAgen from './pages/DashboardAgen';
import DashboardAdmin from './pages/DashboardAdmin';
import UserDashboard from './pages/UserDashboard';

function AppContent() {
  return (
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
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/agen" element={<Agen />} />
        <Route path="/properti" element={<DaftarPropertiAgen />} />
        <Route path="/dashboard-user" element={<UserDashboard />} />
        <Route path="/dashboard-agen" element={<DashboardAgen />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;