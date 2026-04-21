import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, FiClock, FiUser, FiLogOut, 
  FiUsers, FiX, FiTrash2, FiSearch 
} from 'react-icons/fi';
import ProfileAdmin from './ProfileAdmin';

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, accounts, profile
  const [subTabAccount, setSubTabAccount] = useState('user'); // user, agen
  const [propertiData, setPropertiData] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [page, activeTab, subTabAccount]);

  const fetchData = () => {
    if (activeTab === 'pending' || activeTab === 'approved') fetchProperti();
    if (activeTab === 'accounts') fetchAccounts();
  };

  const fetchProperti = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti?status=${activeTab}&page=${page}&limit=5`);
      setPropertiData(res.data.data.features.map(f => f.properties) || []);
    } catch (err) { console.error(err); }
  };

  const fetchAccounts = async () => {
    try {
      // Mengambil data berdasarkan subTabAccount (user atau agen)
      const res = await axios.get(`http://localhost:5000/api/users?role=${subTabAccount}`);
      setAccountsData(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/properti/${id}/status`, { status: newStatus });
      setSelectedProperty(null);
      fetchProperti();
    } catch (err) { alert("Gagal update status"); }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Hapus akun ini secara permanen?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchAccounts();
    } catch (err) { alert("Gagal menghapus akun"); }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* --- SIDEBAR --- */}
      <div className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-40 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-[#D9AB7B]">PROPERTIKITA</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1 uppercase">Admin Control</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-4 mb-2">Utama</p>
          <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'pending' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiClock size={20} /> <span className="text-sm uppercase">Belum Verifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'approved' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiCheckCircle size={20} /> <span className="text-sm uppercase">Terverifikasi</span>
          </button>

          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Manajemen Akun</p>
          <button onClick={() => setActiveTab('accounts')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'accounts' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
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

      {/* --- KONTEN UTAMA --- */}
      <div className="flex-1 ml-72 p-10">
        <header className="mb-10">
          <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
            {activeTab === 'accounts' ? 'Manajemen Akun' : 'Panel Admin'}
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">
            Halo {user?.name}, Dashboard / {activeTab}
          </p>
        </header>

        {activeTab === 'profile' ? (
          <ProfileAdmin />
        ) : activeTab === 'accounts' ? (
          <div className="space-y-6">
            {/* SUB-NAVIGASI DI DALAM KELOLA AKUN */}
            <div className="flex gap-2 bg-gray-100 p-2 rounded-[1.5rem] w-fit shadow-inner">
              <button 
                onClick={() => setSubTabAccount('user')}
                className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'user' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Daftar User
              </button>
              <button 
                onClick={() => setSubTabAccount('agen')}
                className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all ${subTabAccount === 'agen' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Daftar Agen
              </button>
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
                          <div className="w-10 h-10 rounded-full bg-[#D9AB7B]/20 text-[#D9AB7B] flex items-center justify-center font-black uppercase shadow-sm">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-black text-gray-800 uppercase text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-500 font-medium">{u.email}</td>
                      <td className="p-6 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter">Verified</span>
                      </td>
                      <td className="p-6 text-center">
                        <button onClick={() => handleDeleteAccount(u.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {accountsData.length === 0 && (
                <div className="p-20 text-center text-gray-300 font-black italic uppercase tracking-widest">Data {subTabAccount} Kosong</div>
              )}
            </div>
          </div>
        ) : (
          /* TABEL PROPERTI (PENDING/APPROVED) */
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b">
                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-6">Detail Properti</th>
                  <th className="p-6 text-center">Harga</th>
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
                          <div className="font-black text-xl text-gray-800">{p.title}</div>
                          <div className="text-xs font-bold text-blue-500 uppercase">{p.tipe} • {p.lokasi}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-gray-800 text-lg">{formatRupiah(p.harga)}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setSelectedProperty(p)} className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-black hover:bg-blue-500 hover:text-white transition text-[10px]">REVIEW</button>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(p.id, 'approved')} className="px-5 py-2 bg-green-50 text-green-600 rounded-xl font-black hover:bg-green-500 hover:text-white transition text-[10px]">TERIMA</button>
                            <button onClick={() => handleUpdateStatus(p.id, 'rejected')} className="px-5 py-2 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-500 hover:text-white transition text-[10px]">TOLAK</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL REVIEW PROPERTI --- */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setSelectedProperty(null)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 p-2 bg-gray-100 rounded-full transition"><FiX size={24}/></button>
            <h2 className="text-4xl font-black italic uppercase mb-2 text-gray-900">{selectedProperty.title}</h2>
            <p className="text-blue-600 font-bold mb-8 uppercase tracking-widest text-sm">{selectedProperty.lokasi}</p>
            
            <div className="bg-gray-100 h-96 rounded-[2.5rem] mb-8 overflow-hidden shadow-inner">
                <img src={selectedProperty.image_url} className="w-full h-full object-cover" alt="" />
            </div>

            <div className="flex gap-4 border-t border-gray-100 pt-8 mt-auto sticky bottom-0 bg-white">
              <div className="flex-1 flex items-center"><span className="text-3xl font-black text-gray-900">{formatRupiah(selectedProperty.harga)}</span></div>
              <button onClick={() => handleUpdateStatus(selectedProperty.id, 'rejected')} className="px-10 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition">Tolak</button>
              <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="px-10 py-4 bg-green-500 text-white rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest hover:bg-green-600 transition">Terima</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}