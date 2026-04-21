import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiUser, FiLogOut, FiUsers, FiX, FiTrash2, FiBell, FiInfo, FiMapPin, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import ProfileAdmin from './ProfileAdmin';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState('pending');
  const [subTabAccount, setSubTabAccount] = useState('user');
  const [propertiData, setPropertiData] = useState([]);
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
      
      setTimeout(() => {
        setToast(null);
      }, 5000);
    };

    socket.on('notify_admin', handleNotify);

    return () => {
      socket.off('notify_admin', handleNotify);
    };
  }, [activeTab, subTabAccount, page]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [page, activeTab, subTabAccount]);

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
    if (activeTab === 'pending' || activeTab === 'approved') fetchProperti();
    if (activeTab === 'accounts') fetchAccounts();
  };

  const fetchProperti = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti?status=${activeTab}&page=${page}&limit=5`);
      setPropertiData(res.data.data.features.map(f => f.properties) || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) {}
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users?role=${subTabAccount}`);
      setAccountsData(res.data.data || []);
    } catch (err) {}
  };

  const handleReviewClick = async (p) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti/${p.slug}`);
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
      await axios.put(`http://localhost:5000/api/properti/${id}/status`, { status: newStatus });
      
      if (selectedProperty) {
        socket.emit('property_status_changed', {
          agenId: selectedProperty.id_agen,
          title: selectedProperty.title,
          status: newStatus,
          message: `Properti "${selectedProperty.title}" Anda telah di-${newStatus === 'approved' ? 'terima' : 'tolak'} oleh admin.`
        });
      }

      setSelectedProperty(null);
      fetchProperti();
    } catch (err) { 
      alert("Gagal update status"); 
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Hapus akun ini secara permanen?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
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
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] transform transition-all duration-500 translate-y-0 opacity-100 cursor-pointer" onClick={handleNotificationClick}>
          <div className="bg-[#D9AB7B] p-2 rounded-full text-slate-900"><FiInfo size={20} /></div>
          <div>
            <p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest">Notifikasi Baru</p>
            <p className="font-bold text-sm">{toast}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setToast(null); }} className="ml-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
        </div>
      )}

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

      <div className="flex-1 ml-72 p-10">
        <header className="mb-10 flex justify-between items-end relative">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
              {activeTab === 'accounts' ? 'Manajemen Akun' : 'Panel Admin'}
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">
              Halo {user?.name}, Dashboard / {activeTab}
            </p>
          </div>

          <div className="relative">
            <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-[#D9AB7B] transition-all relative">
              <FiBell size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                  <span className="font-black italic uppercase">Pemberitahuan</span>
                  <button onClick={() => setNotifications([])} className="text-[10px] text-[#D9AB7B] hover:text-white font-bold uppercase">Bersihkan</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Kosong</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={handleNotificationClick} className="p-5 border-b border-gray-50 hover:bg-gray-50 flex gap-4 transition-all cursor-pointer">
                        <div className="mt-1 text-[#D9AB7B]"><FiInfo size={18}/></div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{n.text}</p>
                          <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'profile' ? (
          <ProfileAdmin />
        ) : activeTab === 'accounts' ? (
          <div className="space-y-6">
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col justify-between">
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
                        <button onClick={() => handleReviewClick(p)} className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-black hover:bg-blue-500 hover:text-white transition text-[10px]">REVIEW</button>
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

            {propertiData.length === 0 && (
              <div className="p-20 text-center text-gray-300 font-black italic uppercase">Belum ada data</div>
            )}

            <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Halaman {page} dari {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">SEBELUMNYA</button>
                <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">SELANJUTNYA</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-black italic uppercase text-gray-900">Review Listing Properti</h2>
              <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-full shadow-sm hover:shadow transition"><FiX size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
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
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Fasilitas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.kolam_renang && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">Kolam Renang</span>}
                    {selectedProperty.wifi && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">WiFi</span>}
                    {selectedProperty.keamanan_24jam && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">Keamanan 24 Jam</span>}
                    {selectedProperty.parkir && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">Parkir</span>}
                    {selectedProperty.ac && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">AC</span>}
                    {!selectedProperty.kolam_renang && !selectedProperty.wifi && !selectedProperty.keamanan_24jam && !selectedProperty.parkir && !selectedProperty.ac && (
                      <span className="text-sm font-medium text-gray-400">Tidak ada info fasilitas khusus.</span>
                    )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}