import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, FiClock, FiUser, FiLogOut, FiUsers, FiX, 
  FiTrash2, FiBell, FiInfo, FiMapPin, FiChevronLeft, 
  FiChevronRight, FiExternalLink, FiSearch, FiHome 
} from 'react-icons/fi';
import ProfileAdmin from './ProfileAdmin';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState('pending');
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
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    socket.emit('join_room', 'admin_room');
    const handleNotify = (data) => {
      setToast(data.message);
      setNotifications(prev => [{ id: Date.now(), text: data.message, time: new Date().toLocaleTimeString() }, ...prev]);
      fetchData();
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
    }
  }, [page, activeTab, subTabAccount]);

  const fetchData = () => {
    if (activeTab === 'pending' || activeTab === 'approved') fetchProperti();
    if (activeTab === 'accounts') fetchAccounts();
  };

  const fetchProperti = async () => {
    try {
      const res = await axios.get(`/_/backend/api/properti?status=${activeTab}&page=${page}&limit=5`);
      setPropertiData(res.data.data.features.map(f => f.properties) || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) { console.error(err); }
  };

  const fetchAllPropertiForStats = async () => {
    try {
      const res = await axios.get(`/_/backend/api/properti?status=all`);
      setAllPropertiForStats(res.data.data.features.map(f => f.properties) || []);
    } catch (err) { console.error(err); }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`/_/backend/api/users?role=${subTabAccount}`);
      setAccountsData(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;
    try {
      await axios.put(`/_/backend/api/properti/${id}/status`, { status: newStatus });
      setSelectedProperty(null);
      fetchData();
      fetchAllPropertiForStats();
      setToast(`Listing berhasil di-${newStatus === 'approved' ? 'terima' : 'tolak'}`);
    } catch (err) { alert("Gagal update status"); }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Hapus akun ini secara permanen?")) return;
    try {
      await axios.delete(`/_/backend/api/users/${id}`);
      fetchAccounts();
    } catch (err) { alert("Gagal menghapus akun"); }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* TOAST */}
      {toast && (
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] animate-in slide-in-from-right duration-300">
          <div className="bg-[#D9AB7B] p-2 rounded-full text-slate-900"><FiInfo size={20} /></div>
          <div><p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest">Sistem</p><p className="font-bold text-sm">{toast}</p></div>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-40 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-[#D9AB7B]">PROPERTIKITA</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1 uppercase">Admin Control</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-4 mb-2">Manajemen Properti</p>
          <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'pending' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiClock size={20} /> <span className="text-sm uppercase">Belum Verifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'approved' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiCheckCircle size={20} /> <span className="text-sm uppercase">Terverifikasi</span>
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
        <div className="p-6">
          <button onClick={() => {localStorage.clear(); navigate('/login');}} className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
            <FiLogOut /> KELUAR SISTEM
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-72 p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
              {activeTab === 'pending' ? 'Belum Verifikasi' : activeTab === 'approved' ? 'Terverifikasi' : activeTab === 'accounts' ? 'Kelola Akun' : 'Profil Admin'}
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Halo {user?.name}, Dashboard / {activeTab}</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-[#D9AB7B] relative transition-all">
              <FiBell size={24} />
              {notifications.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">{notifications.length}</span>}
            </button>
          </div>
        </header>

        {/* --- STATISTIK (HANYA DI TAB PROPERTI) --- */}
        {(activeTab === 'pending' || activeTab === 'approved') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Properti (Static) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600"><FiHome size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Total Properti</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.length} Units</h3></div>
            </div>

            {/* Diterima (Clickable) */}
            <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'approved' ? 'border-green-500 shadow-md ring-2 ring-green-100' : 'border-gray-100'}`}>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><FiCheckCircle size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Diterima</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'approved').length} Units</h3></div>
            </button>

            {/* Pending (Clickable) */}
            <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'pending' ? 'border-amber-500 shadow-md ring-2 ring-amber-100' : 'border-gray-100'}`}>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><FiClock size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Pending</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'pending').length} Units</h3></div>
            </button>

            {/* Ditolak (Static info, bisa diubah jadi clickable jika ada tab ditolak) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 border-b-4 border-red-500">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"><FiX size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase">Ditolak</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'rejected').length} Units</h3></div>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        {activeTab === 'profile' ? (
          <ProfileAdmin />
        ) : activeTab === 'accounts' ? (
          <div className="space-y-6">
             <div className="flex gap-2 bg-gray-100 p-2 rounded-[1.5rem] w-fit shadow-inner">
               <button onClick={() => setSubTabAccount('user')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'user' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Daftar User</button>
               <button onClick={() => setSubTabAccount('agen')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'agen' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Daftar Agen</button>
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
            <div className="p-8 flex justify-between items-center border-b border-gray-50">
               <h2 className="text-2xl font-black tracking-tighter uppercase italic text-gray-800">Properti {activeTab === 'pending' ? 'Belum Verifikasi' : 'Terverifikasi'}</h2>
               <div className="relative">
                 <input type="text" placeholder="Cari..." className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold w-64 outline-none focus:ring-2 focus:ring-[#D9AB7B]/20 transition-all" />
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-6">Detail Properti</th>
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
                    <td className="p-6 text-center"><div className="font-black text-gray-800 text-lg">{formatRupiah(p.harga)}</div></td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setSelectedProperty(p)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition uppercase tracking-widest">Review</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center p-6 border-t border-gray-50 bg-gray-50/30">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Halaman {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs disabled:opacity-50 transition uppercase tracking-widest">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs disabled:opacity-50 transition uppercase tracking-widest">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* MODAL REVIEW PROPERTI */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-black uppercase text-gray-900 italic">Review Properti</h2>
                    <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-red-500 p-2"><FiX size={24}/></button>
                </div>
                <div className="p-8 overflow-y-auto">
                    <p className="font-bold text-xl mb-4">{selectedProperty.title}</p>
                    <div className="flex gap-4">
                        <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest">Terima</button>
                        <button onClick={() => handleUpdateStatus(selectedProperty.id, 'rejected')} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest">Tolak</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}