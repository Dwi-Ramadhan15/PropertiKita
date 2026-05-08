import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, FiClock, FiUser, FiLogOut, FiUsers, FiX, 
  FiTrash2, FiBell, FiInfo, FiMapPin, FiChevronLeft, 
  FiChevronRight, FiExternalLink, FiSearch, FiHome, FiList 
} from 'react-icons/fi';
import ProfileAdmin from './ProfileAdmin';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState('pending');
  const [filterStatus, setFilterStatus] = useState('all');
  const [subTabAccount, setSubTabAccount] = useState('user');
  const [propertiData, setPropertiData] = useState([]);
  const [allPropertiForStats, setAllPropertiForStats] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const isPropertyTab = ['all', 'pending', 'approved', 'rejected'].includes(activeTab);

  useEffect(() => {
    socket.emit('join_room', 'admin_room');
    const handleNotify = (data) => {
      setToast(data.message);
      
      const newNotif = {
        id: Date.now(),
        message: data.message,
        title: data.title || 'Informasi Sistem',
        status: data.status || 'info',
        created_at: data.created_at || new Date(),
        is_read: false
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      fetchData();
      fetchAllPropertiForStats();
      setTimeout(() => setToast(null), 5000);
    };
    
    socket.on('notify_admin', handleNotify);
    return () => socket.off('notify_admin', handleNotify);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchData();
      fetchAllPropertiForStats();
      fetchNotifications(); 
    }
  }, [page, activeTab, subTabAccount, filterStatus]);

  useEffect(() => {
    let interval;
    if (selectedProperty && selectedProperty.gallery && selectedProperty.gallery.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.gallery.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedProperty]);

  const fetchData = () => {
    if (isPropertyTab) fetchProperti();
    if (activeTab === 'accounts') fetchAccounts();
  };

  const fetchProperti = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const queryStatus = activeTab === 'all' ? filterStatus : activeTab;
      const res = await axios.get(`http://localhost:5000/api/properti?status=${queryStatus}&page=${page}&limit=5`, config);
      setPropertiData(res.data.data.features.map(f => f.properties) || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) {}
  };

  const fetchAllPropertiForStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/properti?status=all&limit=1000`, config);
      setAllPropertiForStats(res.data.data.features.map(f => f.properties) || []);
    } catch (err) {}
  };

  const fetchAccounts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/users?role=${subTabAccount}`, config);
      setAccountsData(res.data.data || []);
    } catch (err) {}
  };

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/notifications/${user.id}`, config);
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.is_read).length);
      }
    } catch (err) {}
  };

  const markNotificationsAsRead = async () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (unreadCount === 0) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/notifications/${user.id}/read`, {}, config);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const handleClearNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/notifications/${user.id}/clear`, config);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleReviewClick = async (p) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/properti/${p.slug}`, config);
      if (res.data.success) {
        setSelectedProperty(res.data.data);
        setCurrentImageIndex(0);
      }
    } catch (err) {
      setSelectedProperty({ ...p, gallery: [p.imageUrl || p.image_url] });
      setCurrentImageIndex(0);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/properti/${id}/status`, { status: newStatus }, config);
      
      if (selectedProperty) {
        socket.emit('property_status_changed', {
          agenId: selectedProperty.id_agen,
          title: selectedProperty.title,
          status: newStatus,
          message: `Properti "${selectedProperty.title}" Anda telah di-${newStatus === 'approved' ? 'terima' : 'tolak'} oleh admin.`
        });
      }

      setSelectedProperty(null);
      fetchData();
      fetchAllPropertiForStats();
      setToast(`Listing berhasil di-${newStatus === 'approved' ? 'terima' : 'tolak'}`);
    } catch (err) { 
      alert("Gagal update status"); 
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Hapus akun ini secara permanen?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      fetchAccounts();
    } catch (err) { 
      alert("Gagal menghapus akun"); 
    }
  };

  const handleNotificationClick = () => {
    setActiveTab('pending');
    setPage(1);
    setShowNotifDropdown(false);
    fetchProperti();
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedProperty && selectedProperty.gallery) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.gallery.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedProperty && selectedProperty.gallery) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.gallery.length) % selectedProperty.gallery.length);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {toast && (
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] animate-in slide-in-from-right duration-300">
          <div className="bg-[#D9AB7B] p-2 rounded-full text-slate-900"><FiInfo size={20} /></div>
          <div>
            <p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest">Sistem</p>
            <p className="font-bold text-sm">{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
        </div>
      )}

      <div className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-40 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-[#D9AB7B]">PROPERTIKITA</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1 uppercase">Admin Control</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 pb-10">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-4 mb-2">Manajemen Properti</p>
          <button onClick={() => {setActiveTab('all'); setFilterStatus('all'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'all' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiList size={20} /> <span className="text-sm uppercase">Semua Properti</span>
          </button>
          <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'pending' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiClock size={20} /> <span className="text-sm uppercase">Belum Verifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'approved' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiCheckCircle size={20} /> <span className="text-sm uppercase">Terverifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('rejected'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'rejected' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiX size={20} /> <span className="text-sm uppercase">Ditolak</span>
          </button>

          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Manajemen Akun</p>
          <button onClick={() => {setActiveTab('accounts'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'accounts' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiUsers size={20} /> <span className="text-sm uppercase">Kelola Akun</span>
          </button>

          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Sistem</p>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiUser size={20} /> <span className="text-sm uppercase">Profil Admin</span>
          </button>
        </nav>
        <div className="p-6 mt-auto">
          <button onClick={() => {localStorage.clear(); navigate('/login');}} className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
            <FiLogOut /> KELUAR SISTEM
          </button>
        </div>
      </div>

      <div className="flex-1 ml-72 p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
              {activeTab === 'all' ? 'Semua Properti' : activeTab === 'pending' ? 'Belum Verifikasi' : activeTab === 'approved' ? 'Terverifikasi' : activeTab === 'rejected' ? 'Properti Ditolak' : activeTab === 'accounts' ? 'Kelola Akun' : 'Profil Admin'}
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Halo {user?.name}, Dashboard / {activeTab}</p>
          </div>
          <div className="relative">
            <button onClick={markNotificationsAsRead} className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-[#D9AB7B] relative transition-all">
              <FiBell size={24} />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">{unreadCount}</span>}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 mt-4 w-[350px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                  <span className="font-black italic uppercase">Pemberitahuan</span>
                  <button onClick={handleClearNotifications} className="text-[10px] text-[#D9AB7B] hover:text-white font-bold uppercase">Bersihkan</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Kosong</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={handleNotificationClick} className={`p-5 border-b border-gray-50 flex gap-4 transition-all cursor-pointer ${n.is_read ? 'bg-white' : 'bg-blue-50/30 hover:bg-blue-50'}`}>
                        <div className={`mt-1 ${n.status === 'info' || n.status === 'pending' ? 'text-blue-500' : 'text-[#D9AB7B]'}`}><FiInfo size={18}/></div>
                        <div>
                          <p className="text-xs font-black text-gray-900 mb-1">{n.title || 'Informasi'}</p>
                          <p className="text-xs font-bold text-gray-600">{n.message}</p>
                          <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {isPropertyTab && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <button onClick={() => {setActiveTab('all'); setFilterStatus('all'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'all' ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-100'}`}>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><FiHome size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Total Properti</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.length} Units</h3></div>
            </button>

            <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'approved' ? 'border-green-500 shadow-md ring-2 ring-green-100' : 'border-gray-100'}`}>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><FiCheckCircle size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Diterima</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'approved').length} Units</h3></div>
            </button>

            <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'pending' ? 'border-amber-500 shadow-md ring-2 ring-amber-100' : 'border-gray-100'}`}>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><FiClock size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Pending</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'pending').length} Units</h3></div>
            </button>

            <button onClick={() => {setActiveTab('rejected'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'rejected' ? 'border-red-500 shadow-md ring-2 ring-red-100' : 'border-gray-100'}`}>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"><FiX size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Ditolak</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'rejected').length} Units</h3></div>
            </button>
          </div>
        )}

        {activeTab === 'profile' ? (
          <ProfileAdmin />
        ) : activeTab === 'accounts' ? (
          <div className="space-y-6">
             <div className="flex gap-2 bg-gray-100 p-2 rounded-[1.5rem] w-fit shadow-inner">
               <button onClick={() => {setSubTabAccount('user'); setPage(1);}} className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'user' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Daftar User</button>
               <button onClick={() => {setSubTabAccount('agen'); setPage(1);}} className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'agen' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Daftar Agen</button>
             </div>
             <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="p-6">Identitas {subTabAccount}</th>
                    <th className="p-6">Email Terdaftar</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {accountsData.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#D9AB7B]/20 text-[#D9AB7B] flex items-center justify-center font-black uppercase">{u.name.charAt(0)}</div>
                          <span className="font-black text-gray-800 uppercase text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-500 font-medium">{u.email}</td>
                      <td className="p-6 text-center"><span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter">Verified</span></td>
                      <td className="p-6 text-center">
                        <button onClick={() => handleDeleteAccount(u.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><FiTrash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {accountsData.length === 0 && <div className="p-20 text-center text-gray-300 font-black italic uppercase tracking-widest">Data {subTabAccount} Kosong</div>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 gap-4">
               <div>
                 <h2 className="text-2xl font-black tracking-tighter uppercase italic text-gray-800">
                   Properti {activeTab === 'pending' ? 'Belum Verifikasi' : activeTab === 'approved' ? 'Terverifikasi' : activeTab === 'rejected' ? 'Ditolak' : 'Keseluruhan'}
                 </h2>
                 {activeTab === 'all' && (
                   <div className="flex gap-2 mt-4 bg-gray-100 p-1.5 rounded-2xl w-fit shadow-inner">
                      <button onClick={() => {setFilterStatus('all'); setPage(1);}} className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${filterStatus === 'all' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Semua</button>
                      <button onClick={() => {setFilterStatus('approved'); setPage(1);}} className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${filterStatus === 'approved' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Terverifikasi</button>
                      <button onClick={() => {setFilterStatus('pending'); setPage(1);}} className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${filterStatus === 'pending' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Belum Verifikasi</button>
                   </div>
                 )}
               </div>
               <div className="relative">
                 <input type="text" placeholder="Cari..." className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold w-64 outline-none focus:ring-2 focus:ring-[#D9AB7B]/20 transition-all" />
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-6">Detail Properti</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-center">Harga Unit</th>
                  <th className="p-6 text-center">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {propertiData.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition">
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <img src={p.imageUrl || p.image_url} className="w-24 h-20 rounded-[1.2rem] object-cover bg-gray-100 shadow-sm" alt="" />
                        <div>
                          <div className="font-black text-xl text-gray-800 leading-tight">{p.title}</div>
                          <div className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 mt-1"><FiMapPin /> {p.lokasi}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`text-[8px] px-3 py-1.5 rounded-full font-black uppercase tracking-tighter border ${
                        p.status === 'approved' ? 'bg-green-100 text-green-600 border-green-200' : 
                        p.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                        p.status === 'rejected' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-6 text-center"><div className="font-black text-gray-800 text-lg">{formatRupiah(p.harga)}</div></td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleReviewClick(p)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition uppercase tracking-widest">Review</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {propertiData.length === 0 && (
                <div className="p-20 text-center text-gray-300 font-black italic uppercase tracking-widest">Data Properti Kosong</div>
            )}
            <div className="flex justify-between items-center p-6 border-t border-gray-50 bg-gray-50/30">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Halaman {page} / {totalPages === 0 ? 1 : totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs disabled:opacity-50 transition uppercase tracking-widest">Prev</button>
                <button disabled={page >= totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs disabled:opacity-50 transition uppercase tracking-widest">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-black text-center uppercase text-gray-900">Review Listing Properti</h2>
              <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-full shadow-sm hover:shadow transition"><FiX size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8 custom-scrollbar">
              <div className="flex-1 space-y-6">
                
                <div className="bg-gray-100 h-80 rounded-[1.5rem] overflow-hidden shadow-inner relative group">
                  <img src={selectedProperty.gallery && selectedProperty.gallery.length > 0 ? selectedProperty.gallery[currentImageIndex] : (selectedProperty.imageUrl || selectedProperty.image_url)} className="w-full h-full object-cover transition-all duration-500" alt="Properti" />
                  
                  {selectedProperty.gallery && selectedProperty.gallery.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md">
                        <FiChevronLeft size={24} />
                      </button>
                      <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md">
                        <FiChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedProperty.gallery.map((_, idx) => (
                          <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div>
                  <h3 className="text-3xl font-black uppercase text-gray-900">{selectedProperty.title}</h3>
                  <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{selectedProperty.nama_kategori || selectedProperty.kategori || 'Properti'} • {selectedProperty.tipe}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase">Luas</p>
                    <p className="font-bold text-gray-800">{selectedProperty.luas || 0} m²</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase">K. Tidur</p>
                    <p className="font-bold text-gray-800">{selectedProperty.kamar_tidur || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase">K. Mandi</p>
                    <p className="font-bold text-gray-800">{selectedProperty.kamar_mandi || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Deskripsi</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedProperty.deskripsi || 'Tidak ada deskripsi.'}</p>
                </div>

                <div>
                  <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Fasilitas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.fasilitas && selectedProperty.fasilitas.length > 0 ? (
                          selectedProperty.fasilitas.map((item, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase border border-blue-100"
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-gray-400">Tidak ada info fasilitas khusus.</span>
                        )}
                      </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3 flex flex-col gap-6">
                <div className="bg-gray-50 rounded-[1.5rem] p-6 relative">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiMapPin /> Lokasi Lengkap</h4>
                  <p className="text-gray-800 font-bold text-sm leading-relaxed mb-4">{selectedProperty.lokasi}</p>
                  
                  <div className="pt-4 border-t border-gray-200 flex flex-col gap-1 text-[10px] font-black uppercase text-gray-500">
                    <span>Lat: {selectedProperty.latitude}</span>
                    <span>Lng: {selectedProperty.longitude}</span>
                  </div>

                  <a href={`https://www.google.com/maps?q=${selectedProperty.latitude},${selectedProperty.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition">
                    <FiExternalLink size={14}/> Lihat di Google Maps
                  </a>
                </div>

                <div className="flex-1 bg-gray-200 rounded-[1.5rem] overflow-hidden min-h-[250px] relative shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    className="absolute inset-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(selectedProperty.longitude)-0.005},${parseFloat(selectedProperty.latitude)-0.005},${parseFloat(selectedProperty.longitude)+0.005},${parseFloat(selectedProperty.latitude)+0.005}&layer=mapnik&marker=${selectedProperty.latitude},${selectedProperty.longitude}`}
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
              <div className="text-3xl font-black text-gray-900">{formatRupiah(selectedProperty.harga)}</div>
              {selectedProperty.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => handleUpdateStatus(selectedProperty.id, 'rejected')} className="px-8 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition">Tolak Listing</button>
                  <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="px-8 py-3 bg-green-500 text-white rounded-xl font-black shadow-lg uppercase text-xs tracking-widest hover:bg-green-600 transition">Terima Listing</button>
                </div>
              )}
              {selectedProperty.status === 'rejected' && (
                <div className="flex gap-3">
                  <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="px-8 py-3 bg-green-500 text-white rounded-xl font-black shadow-lg uppercase text-xs tracking-widest hover:bg-green-600 transition">Terima Kembali</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}