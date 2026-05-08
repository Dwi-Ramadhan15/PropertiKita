import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, FiClock, FiUser, FiLogOut, FiUsers, FiX, 
  FiTrash2, FiBell, FiInfo, FiMapPin, FiSearch, FiHome, FiEye 
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
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Ambil Data Statistik (Semua Status)
  const fetchAllPropertiForStats = async () => {
    try {
      const res = await axios.get(`/_/backend/api/properti?status=all`);
      const data = res.data.data.features.map(f => f.properties) || [];
      setAllPropertiForStats(data);
    } catch (err) { console.error("Gagal ambil statistik:", err); }
  };

  // Ambil Data Properti Berdasarkan Tab (Pending/Approved)
  const fetchProperti = async () => {
    try {
      const res = await axios.get(`/_/backend/api/properti?status=${activeTab}&page=${page}&limit=5`);
      setPropertiData(res.data.data.features.map(f => f.properties) || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) { console.error("Gagal ambil data properti:", err); }
  };

  // Ambil Data Akun
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`/_/backend/api/users?role=${subTabAccount}`);
      setAccountsData(res.data.data || []);
    } catch (err) { console.error("Gagal ambil data akun:", err); }
  };

  // FUNGSI PUSAT UNTUK REFRESH SEMUA DATA
  const refreshAllData = useCallback(() => {
    if (activeTab === 'pending' || activeTab === 'approved') {
      fetchProperti();
    }
    if (activeTab === 'accounts') {
      fetchAccounts();
    }
    fetchAllPropertiForStats(); // Statistik selalu di-refresh
  }, [activeTab, page, subTabAccount]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      refreshAllData();
    }
  }, [refreshAllData]);

  useEffect(() => {
    socket.emit('join_room', 'admin_room');
    socket.on('notify_admin', (data) => {
      setToast(data.message);
      setNotifications(prev => [{ id: Date.now(), text: data.message, time: new Date().toLocaleTimeString() }, ...prev]);
      refreshAllData();
      setTimeout(() => setToast(null), 5000);
    });
    return () => socket.off('notify_admin');
  }, [refreshAllData]);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;
    try {
      await axios.put(`/_/backend/api/properti/${id}/status`, { status: newStatus });
      setSelectedProperty(null);
      refreshAllData(); // Refresh tabel dan statistik kotak atas
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
    <div className="flex min-h-screen bg-[#F1F3F6]">
      {/* TOAST NOTIFIKASI */}
      {toast && (
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] animate-in slide-in-from-right duration-300">
          <div className="bg-[#D9AB7B] p-2 rounded-full text-slate-900"><FiInfo size={20} /></div>
          <div><p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest">Sistem</p><p className="font-bold text-sm">{toast}</p></div>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 bg-[#1A233A] text-white flex flex-col fixed h-full z-40 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-[#D9AB7B]">PROPERTIKITA</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1 uppercase">Admin Control</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-4 mb-2">Manajemen Properti</p>
          <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'pending' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiClock size={20} /> <span className="text-sm uppercase tracking-tight">Belum Verifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'approved' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiCheckCircle size={20} /> <span className="text-sm uppercase tracking-tight">Terverifikasi</span>
          </button>
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Manajemen Akun</p>
          <button onClick={() => {setActiveTab('accounts'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'accounts' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiUsers size={20} /> <span className="text-sm uppercase tracking-tight">Kelola Akun</span>
          </button>
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Sistem</p>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiUser size={20} /> <span className="text-sm uppercase tracking-tight">Profil Admin</span>
          </button>
        </nav>
        <div className="p-6">
          <button onClick={() => {localStorage.clear(); navigate('/login');}} className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
            <FiLogOut /> KELUAR SISTEM
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-72 p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
              {activeTab === 'pending' ? 'Belum Verifikasi' : activeTab === 'approved' ? 'Terverifikasi' : activeTab === 'accounts' ? 'Kelola Akun' : 'Profil Admin'}
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Halo {user?.name}, Dashboard / {activeTab}</p>
          </div>
          <div className="relative">
            <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-[#D9AB7B] transition-all">
              <FiBell size={24} />
              {notifications.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">{notifications.length}</span>}
            </button>
          </div>
        </header>

        {/* --- KOTAK STATISTIK (DITARIK DARI fetchAllPropertiForStats) --- */}
        {(activeTab === 'pending' || activeTab === 'approved') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600"><FiHome size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Properti</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.length} Units</h3></div>
            </div>

            <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all text-left border-b-4 ${activeTab === 'approved' ? 'border-green-500 ring-2 ring-green-100 shadow-md' : 'border-gray-100 shadow-sm'}`}>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><FiCheckCircle size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diterima</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'approved').length} Units</h3></div>
            </button>

            <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`bg-white p-6 rounded-[2rem] shadow-sm border flex items-center gap-5 transition-all text-left border-b-4 ${activeTab === 'pending' ? 'border-amber-500 ring-2 ring-amber-100 shadow-md' : 'border-gray-100 shadow-sm'}`}>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><FiClock size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'pending').length} Units</h3></div>
            </button>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 border-b-4 border-red-500">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"><FiX size={24}/></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ditolak</p><h3 className="text-2xl font-black text-gray-900">{allPropertiForStats.filter(p => p.status === 'rejected').length} Units</h3></div>
            </div>
          </div>
        )}

        {/* TABEL AREA */}
        {activeTab === 'profile' ? (
          <ProfileAdmin />
        ) : activeTab === 'accounts' ? (
          <div className="space-y-6">
            <div className="flex gap-2 bg-gray-200/50 p-2 rounded-[1.5rem] w-fit shadow-inner border border-gray-100">
              <button onClick={() => setSubTabAccount('user')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'user' ? 'bg-white text-[#1A233A] shadow-md' : 'text-gray-400'}`}>Daftar User</button>
              <button onClick={() => setSubTabAccount('agen')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'agen' ? 'bg-white text-[#1A233A] shadow-md' : 'text-gray-400'}`}>Daftar Agen</button>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b font-black text-[10px] text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-8">Identitas Account</th>
                    <th className="p-8">Email Terdaftar</th>
                    <th className="p-8 text-center">Status</th>
                    <th className="p-8 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 uppercase text-xs font-bold">
                  {accountsData.map(u => (
                    <tr key={u.id} className="hover:bg-blue-50/20 transition">
                      <td className="p-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#D9AB7B]/20 text-[#D9AB7B] flex items-center justify-center font-black">{u.name.charAt(0)}</div>
                        <span className="text-slate-800">{u.name}</span>
                      </td>
                      <td className="p-8 text-slate-500 normal-case">{u.email}</td>
                      <td className="p-8 text-center"><span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter">Verified</span></td>
                      <td className="p-8 text-center">
                        <button onClick={() => handleDeleteAccount(u.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><FiTrash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8 flex justify-between items-center border-b border-gray-50">
               <h2 className="text-2xl font-black tracking-tighter uppercase italic text-gray-800">Antrean Verifikasi</h2>
               <div className="relative">
                 <input type="text" placeholder="Cari unit..." className="pl-10 pr-4 py-3 bg-[#F1F3F6] border-none rounded-xl text-xs font-bold w-64 outline-none focus:ring-2 focus:ring-[#D9AB7B]/50 transition-all" />
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b font-black text-[10px] text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="p-8">Detail Properti</th>
                  <th className="p-8 text-center">Harga Unit</th>
                  <th className="p-8 text-center">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 uppercase text-xs font-bold">
                {propertiData.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <img src={p.imageUrl || p.image_url} className="w-24 h-20 rounded-[1.2rem] object-cover bg-gray-100 shadow-sm" alt="" />
                        <div>
                          <div className="font-black text-xl text-slate-800 leading-tight italic tracking-tighter mb-1">{p.title}</div>
                          <div className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 tracking-tighter"><FiMapPin /> {p.lokasi}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center"><div className="font-black text-slate-800 text-lg">{formatRupiah(p.harga)}</div></td>
                    <td className="p-8">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => setSelectedProperty(p)} className="px-6 py-2.5 bg-[#2563EB] text-white rounded-full font-black text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition uppercase tracking-widest">Review</button>
                        <button onClick={() => handleUpdateStatus(p.id, 'approved')} className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-700 transition shadow-lg shadow-green-100"><FiCheckCircle size={14}/></button>
                        <button onClick={() => handleUpdateStatus(p.id, 'rejected')} className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-700 transition shadow-lg shadow-red-100"><FiX size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center p-8 border-t border-gray-50 bg-gray-50/30">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest tracking-tighter">Hal {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-black text-[10px] disabled:opacity-50 transition uppercase tracking-widest shadow-sm">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-black text-[10px] disabled:opacity-50 transition uppercase tracking-widest shadow-sm">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL REVIEW DETAIL */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-[#1A233A]/90 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <h2 className="text-3xl font-black uppercase text-slate-800 italic tracking-tighter">Detail Review</h2>
              <button onClick={() => setSelectedProperty(null)} className="bg-gray-100 p-3 rounded-2xl text-gray-400 hover:text-red-500 transition"><FiX size={24}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1">
               <div className="grid grid-cols-2 gap-10">
                  <img src={selectedProperty.imageUrl || selectedProperty.image_url} className="w-full aspect-video rounded-[2rem] object-cover" alt="" />
                  <div className="space-y-6">
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase">{selectedProperty.title}</h3>
                    <div className="flex items-center gap-2 text-blue-500 font-bold uppercase text-xs tracking-widest"><FiMapPin /> {selectedProperty.lokasi}</div>
                    <div className="p-6 bg-[#F1F3F6] rounded-3xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Harga Penawaran</p>
                      <p className="text-3xl font-black text-slate-800">{formatRupiah(selectedProperty.harga)}</p>
                    </div>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button onClick={() => handleUpdateStatus(selectedProperty.id, 'rejected')} className="px-10 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-200 transition active:scale-95">Tolak Properti</button>
              <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="px-10 py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-200 transition active:scale-95">Setujui & Terbitkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}