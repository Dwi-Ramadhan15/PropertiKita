import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiList, FiCheckSquare, FiUser, FiTrash2, 
  FiEdit3, FiPlus, FiBell, FiSettings, FiMapPin 
} from 'react-icons/fi';
import ProfileAgen from '../pages/ProfileAgen'; 
import { io } from 'socket.io-client';
import FasilitasProperti from '../pages/FasilitasProperti';

const socket = io('http://localhost:5000');

export default function DashboardAgen() {
  const [properti, setProperti] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('daftar');
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  const getAvatar = () => {
    if (!user?.foto_profil) return `https://ui-avatars.com/api/?name=${user?.name || 'Agen'}&background=1A314D&color=fff`;
    if (user.foto_profil.startsWith('http')) return user.foto_profil;
    return `http://127.0.0.1:9000/propertikita/${user.foto_profil}`;
  };

  useEffect(() => {
    if (!user || user.role !== 'agen') {
      navigate('/login');
      return;
    }
    fetchProperti();

    socket.emit('join_room', `agen_${user.id}`);
    socket.on('notify_agen', (data) => {
      setUnreadCount(prev => prev + 1);
      fetchProperti();
    });

    return () => socket.off('notify_agen');
  }, [activeTab]);

  const fetchProperti = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti?agen=${user.id}&status=all`);
      setProperti(res.data.data.features.map(f => f.properties) || []);
    } catch (err) { console.error(err); }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const renderContent = () => {
    if (activeTab === 'profil') return <ProfileAgen />;
    if (activeTab === 'fasilitasproperti') return <FasilitasProperti />;

    const dataToDisplay = activeTab === 'daftar' 
      ? properti.filter(p => p.status !== 'sold') 
      : properti.filter(p => p.status === 'sold');

    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b">
            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="p-6">Detail Unit</th>
              <th className="p-6">Lokasi</th>
              <th className="p-6 text-center">Harga</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dataToDisplay.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center font-bold text-gray-300 uppercase italic">Belum ada data unit</td></tr>
            ) : (
              dataToDisplay.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition group text-sm">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url || p.imageUrl} className="w-20 h-16 rounded-[1rem] object-cover bg-gray-100 shadow-sm" alt="prop" />
                      <div>
                        <div className="font-black text-slate-800 leading-tight mb-1">{p.title}</div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 w-fit px-2 py-0.5 rounded-md">{p.tipe}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium max-w-[200px]">
                      <FiMapPin className="text-[#D9AB7B] shrink-0" />
                      <span className="truncate">{p.lokasi}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center font-black text-slate-800">
                    {formatRupiah(p.harga)}
                  </td>
                  <td className="p-6 text-center">
                    <span className={`text-[8px] px-3 py-1.5 rounded-full font-black uppercase tracking-tighter border ${
                      p.status === 'approved' ? 'bg-green-100 text-green-600 border-green-200' : 
                      p.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                      p.status === 'sold' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-red-100 text-red-600 border-red-200'
                    }`}>
                      {p.status === 'sold' ? 'Terjual' : p.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-2">
                       <button className="p-2.5 bg-gray-50 text-slate-400 rounded-xl hover:bg-[#1A314D] hover:text-white transition shadow-sm"><FiEdit3 size={14}/></button>
                       <button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><FiTrash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex">
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-blue-50 shadow-sm flex flex-col z-50 hidden md:flex sticky top-0 h-screen">
        <div className="p-6 mt-4">
          <div className="bg-[#EBF5FF] p-4 rounded-3xl flex items-center gap-4 border border-white shadow-sm">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <img src={getAvatar()} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{user?.name || 'Agen'}</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Agen Properti</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-6 flex-1 mt-4">
          <button onClick={() => setActiveTab('daftar')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'daftar' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiList className="text-xl" /> <span className="text-sm">Daftar Properti</span>
          </button>
          <button onClick={() => setActiveTab('terjual')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'terjual' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiCheckSquare className="text-xl" /> <span className="text-sm">Riwayat Penjualan</span>
          </button>
          <button onClick={() => setActiveTab('fasilitasproperti')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'fasilitasproperti' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiSettings className="text-xl" /> <span className="text-sm">Fasilitas</span>
          </button>
          <button onClick={() => setActiveTab('profil')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'profil' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiUser className="text-xl" /> <span className="text-sm">Profil Saya</span>
          </button>
        </nav>

        <div className="p-8 border-t border-blue-50">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-3 text-red-400 font-black text-xs hover:text-red-600 transition uppercase tracking-widest">
            Logout Sistem
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 md:p-12 overflow-x-hidden">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
              {activeTab === 'daftar' && "Daftar Properti"}
              {activeTab === 'terjual' && "Riwayat Penjualan"}
              {activeTab === 'fasilitasproperti' && "Kelola Fasilitas"}
              {activeTab === 'profil' && "Informasi Profil"}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">
              Dashboard / {activeTab === 'fasilitasproperti' ? 'Fasilitas' : activeTab}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* LONCENG: SEMBUNYI DI PROFIL */}
            {activeTab !== 'profil' && (
              <div className="relative">
                <button className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition relative">
                  <FiBell size={24} />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#F1F3F6]">{unreadCount}</span>}
                </button>
              </div>
            )}

            {/* TAMBAH UNIT (Daftar & Terjual) - WARNA NAVY */}
            {(activeTab === 'daftar' || activeTab === 'terjual') && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#1A314D] text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-blue-900/40 hover:-translate-y-1 transition-all h-14 uppercase tracking-widest text-[11px]">
                <FiPlus size={18} /> Tambah Unit
              </button>
            )}

          </div>
        </header>

        {renderContent()}
      </div>
    </div>
  );
}