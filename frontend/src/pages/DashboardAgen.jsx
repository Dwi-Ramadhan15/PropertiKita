import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiList, FiCheckSquare, FiPieChart, FiUser, FiTrash2, 
  FiEdit3, FiPlus, FiX, FiBell, FiInfo, FiCheck, FiImage, 
  FiSettings, FiMapPin 
} from 'react-icons/fi';
import ProfileAgen from '../pages/ProfileAgen'; 
import { io } from 'socket.io-client';
import FasilitasProperti from '../pages/FasilitasProperti';

const socket = io('http://localhost:5000');

export default function DashboardAgen() {
  const [properti, setProperti] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('daftar');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [fasilitasOptions, setFasilitasOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [toast, setToast] = useState(null);
  const [tempFasilitas, setTempFasilitas] = useState('');

  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  const initialFormState = {
    title: '', harga: '', lokasi: '', tipe: 'Rumah', id_kategori: 1,
    kamar_tidur: 0, kamar_mandi: 0, luas: 0, deskripsi: '',
    latitude: -5.3971, longitude: 105.2668,
    fasilitas: [] 
  };

  const [formData, setFormData] = useState(initialFormState);

  const deleteReasons = [
    "Properti sudah laku terjual / tersewa",
    "Pemilik batal menjual / menyewakan",
    "Properti sedang dalam perbaikan / tidak layak",
    "Pindah ke agen pemasaran lain",
    "Lainnya"
  ];

  const getAvatar = () => {
    if (!user?.foto_profil) return `https://ui-avatars.com/api/?name=${user?.name || 'Agen'}&background=1A314D&color=fff`;
    if (user.foto_profil.startsWith('http')) return user.foto_profil;
    return `http://127.0.0.1:9000/propertikita/${user.foto_profil}`;
  };

  const toggleFasilitas = (item) => {
    setFormData(prev => {
      const isExist = prev.fasilitas.includes(item);
      return {
        ...prev,
        fasilitas: isExist 
          ? prev.fasilitas.filter(f => f !== item) 
          : [...prev.fasilitas, item]
      };
    });
  };

  const addFasilitasKustom = () => {
    if (tempFasilitas.trim() !== '') {
      if (!formData.fasilitas.includes(tempFasilitas.trim())) {
        setFormData({
          ...formData,
          fasilitas: [...formData.fasilitas, tempFasilitas.trim()]
        });
      }
      setTempFasilitas('');
    }
  };

  const removeFasilitas = (indexToRemove) => {
    setFormData({
      ...formData,
      fasilitas: formData.fasilitas.filter((_, index) => index !== indexToRemove)
    });
  };

  useEffect(() => {
    if (!user || user.role !== 'agen') {
      navigate('/login');
      return;
    }
    
    fetchProperti();
    fetchNotifications(); 

    const fetchFasilitas = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`http://localhost:5000/api/fasilitas?id_agen=${user.id}`, config);
        const daftarUnik = [...new Set(res.data.map(item => item.nama_fasilitas))];
        setFasilitasOptions(daftarUnik);
      } catch (err) {}
    };
    fetchFasilitas();

    socket.emit('join_room', `agen_${user.id}`);
    
    const handleNotify = (data) => {
      setToast(data.message);
      
      const newNotif = {
        id: Date.now(),
        message: data.message,
        status: data.status,
        created_at: data.created_at || new Date(),
        is_read: false
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      fetchProperti(); 
      
      setTimeout(() => { setToast(null); }, 5000);
    };

    socket.on('notify_agen', handleNotify);
    return () => { socket.off('notify_agen', handleNotify); };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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

  const fetchProperti = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti?agen=${user.id}&status=all`);
      setProperti(res.data.data.features.map(f => f.properties) || []);
    } catch (err) {}
  };

  const handleFileChange = (e) => { 
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const urlToRemove = previews[index];
    
    if (urlToRemove.startsWith('blob:')) {
      const fileIndex = selectedFiles.findIndex(file => URL.createObjectURL(file) === urlToRemove);
      const updatedFiles = [...selectedFiles];
      updatedFiles.splice(fileIndex, 1);
      setSelectedFiles(updatedFiles);
      URL.revokeObjectURL(urlToRemove);
    }

    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && selectedFiles.length < 2) {
      alert("Wajib upload minimal 2 foto!");
      return;
    }

    if (editingId && previews.length < 2) {
      alert("Wajib memiliki minimal 2 foto unit!");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (['kamar_tidur', 'kamar_mandi', 'luas'].includes(key) && formData[key] === '') {
        data.append(key, 0);
      } else if (['latitude', 'longitude'].includes(key) && formData[key] === '') {
        data.append(key, key === 'latitude' ? -5.3971 : 105.2668);
      } else if (key === 'fasilitas') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });
    
    data.append('id_agen', user.id);
    
    const existingImagesToKeep = previews.filter(url => !url.startsWith('blob:'));
    data.append('existing_images', JSON.stringify(existingImagesToKeep));

    selectedFiles.forEach((file) => { data.append('images', file); });

    try {
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        } 
      };
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/properti/${editingId}`, data, config);
        setToast("Listing berhasil diupdate!");
      } else {
        await axios.post('http://localhost:5000/api/properti', data, config);
        socket.emit('new_property_submitted', {
          agenName: user.name,
          title: formData.title,
          message: `Agen ${user.name} menambahkan properti baru: ${formData.title}`
        });
        setToast("Berhasil ditambah! Menunggu persetujuan admin.");
      }
      
      closeModal();
      fetchProperti();
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan pada server (Cek Backend).");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSelectedFiles([]);
    previews.forEach(url => { if(url.startsWith('blob:')) URL.revokeObjectURL(url) });
    setPreviews([]);
    setFormData(initialFormState);
    setTempFasilitas('');
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    let currentFasilitas = [];
    try {
      currentFasilitas = typeof p.fasilitas === 'string' ? JSON.parse(p.fasilitas) : (p.fasilitas || []);
    } catch (e) {
      currentFasilitas = [];
    }

    setFormData({
      title: p.title, harga: p.harga, lokasi: p.lokasi, tipe: p.tipe, id_kategori: p.id_kategori || 1,
      kamar_tidur: p.kamar_tidur || 0, kamar_mandi: p.kamar_mandi || 0, luas: p.luas || 0, 
      deskripsi: p.deskripsi || '', latitude: p.latitude || -5.3971, longitude: p.longitude || 105.2668, 
      fasilitas: currentFasilitas
    });

    let parsedImages = [];
    if (p.images) {
      if (typeof p.images === 'string') {
        try { parsedImages = JSON.parse(p.images); } catch(e) {}
      } else if (Array.isArray(p.images)) {
        parsedImages = p.images;
      }
    }
    
    let allPreviews = [];
    const mainImage = p.image_url || p.imageUrl;
    if (mainImage) allPreviews.push(mainImage);
    
    parsedImages.forEach(img => {
      const url = typeof img === 'object' ? (img.image_url || img.url || img.imageUrl) : img;
      if (url && url !== mainImage && !allPreviews.includes(url)) {
        allPreviews.push(url);
      }
    });
    
    setPreviews(allPreviews);
    setShowModal(true);
  };

  const handleDeleteClick = (p) => {
    setPropertyToDelete(p);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteReason) {
      alert("Silakan pilih alasan penghapusan terlebih dahulu.");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (deleteReason === "Properti sudah laku terjual / tersewa") {
        await axios.put(`http://localhost:5000/api/properti/${propertyToDelete.id}/status`, { status: 'sold' }, config);
        setToast("Properti berhasil dipindahkan ke Riwayat Penjualan!");
      } else {
        await axios.delete(`http://localhost:5000/api/properti/${propertyToDelete.id}`, config);
        setToast("Properti berhasil dihapus permanen.");
      }
      setShowDeleteModal(false);
      fetchProperti();
      setTimeout(() => setToast(null), 5000);
    } catch (err) { 
      alert("Gagal memproses permintaan: " + (err.response?.data?.message || "Akses Ditolak")); 
    }
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = dataToDisplay.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            {currentItems.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center font-bold text-gray-300 uppercase italic">Belum ada data unit</td></tr>
            ) : (
              currentItems.map((p) => (
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
                      <FiMapPin className="text-[#1A314D] shrink-0" />
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
                      {p.status !== 'sold' ? (
                        <>
                          <button onClick={() => openEditModal(p)} className="p-2.5 bg-gray-50 text-slate-400 rounded-xl hover:bg-[#1A314D] hover:text-white transition shadow-sm"><FiEdit3 size={14}/></button>
                          <button onClick={() => handleDeleteClick(p)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><FiTrash2 size={14}/></button>
                        </>
                      ) : (
                        <span className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase">
                          <FiCheck /> Selesai
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-6 bg-white border-t border-gray-50">
            <span className="text-xs font-bold text-gray-400">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, dataToDisplay.length)} dari {dataToDisplay.length} data
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-100 font-bold text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                SEBELUMNYA
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition ${currentPage === i + 1 ? 'bg-[#1A314D] text-white' : 'border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-100 font-bold text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                SELANJUTNYA
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex pt-20">
      {toast && (
        <div className="fixed top-28 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] animate-in slide-in-from-right duration-300">
          <div className="bg-[#1A314D] p-2 rounded-full text-white"><FiInfo size={20} /></div>
          <div>
            <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">Informasi Sistem</p>
            <p className="font-bold text-sm">{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
        </div>
      )}

      <div className="w-72 bg-white border-r border-blue-50 shadow-sm flex-col z-40 hidden md:flex fixed left-0 top-20 bottom-0 overflow-y-auto custom-scrollbar">
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

        <div className="p-8 border-t border-blue-50 mt-auto">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-3 text-red-400 font-black text-xs hover:text-red-600 transition uppercase tracking-widest">
            Logout Sistem
          </button>
        </div>
      </div>

      <div className="flex-1 ml-0 md:ml-72 p-6 md:p-12 overflow-x-hidden relative min-h-[calc(100vh-5rem)]">
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
            {activeTab !== 'profil' && (
              <div className="relative z-50">
                <button onClick={markNotificationsAsRead} className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition relative">
                  <FiBell size={24} />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#F1F3F6]">{unreadCount}</span>}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden">
                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                      <h3 className="font-black italic uppercase">Notifikasi</h3>
                      <span className="text-[10px] bg-blue-500 text-white px-3 py-1 rounded-full font-bold">{notifications.length} Pesan</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 py-6 font-bold text-sm">Belum ada pemberitahuan</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-4 rounded-2xl transition border ${notif.is_read ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-blue-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-1">
                              <div className={`w-2 h-2 rounded-full ${
                                notif.status === 'approved' ? 'bg-green-500' : 
                                notif.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                              }`}></div>
                              <p className="text-xs font-bold text-gray-500">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm font-black text-gray-800 leading-tight">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'daftar' || activeTab === 'terjual') && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#1A314D] text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-blue-900/40 hover:-translate-y-1 transition-all h-14 uppercase tracking-widest text-[11px]">
                <FiPlus size={18} /> Tambah Unit
              </button>
            )}
          </div>
        </header>

        {renderContent()}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black italic uppercase text-gray-900">Konfirmasi Hapus</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-red-500"><FiX size={24} /></button>
            </div>
            <div className="space-y-3 mb-8">
              {deleteReasons.map((reason, idx) => (
                <label key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${deleteReason === reason ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                  <input type="radio" name="deleteReason" value={reason} checked={deleteReason === reason} onChange={(e) => setDeleteReason(e.target.value)} className="w-5 h-5 accent-red-600" />
                  <span className={`font-bold text-sm ${deleteReason === reason ? 'text-red-700' : 'text-gray-600'}`}>{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition">KONFIRMASI</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition">BATAL</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4 transition-all duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] flex flex-col animate-in fade-in zoom-in duration-300">
            
            <div className="px-10 py-8 flex justify-between items-center bg-white border-b border-gray-50">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase italic">
                  {editingId ? 'Update Listing' : 'Unit Baru'}
                </h2>
                <p className="text-xs font-bold text-blue-500 tracking-widest uppercase mt-1">Lengkapi informasi properti anda</p>
              </div>
              <button 
                onClick={closeModal} 
                className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm"
              >
                <FiX size={24}/>
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-x-6 gap-y-8">
                
                <div className="col-span-4 md:col-span-3 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Judul Listing</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border border-slate-100 transition-all shadow-sm" 
                    placeholder="Contoh: Rumah Mewah Minimalis di Pusat Kota"
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="col-span-4 md:col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Kategori</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 appearance-none shadow-sm" 
                    value={formData.id_kategori} 
                    onChange={e => setFormData({...formData, id_kategori: Number(e.target.value)})}
                  >
                    <option value={1}>Dijual</option>
                    <option value={2}>Disewakan</option>
                  </select>
                </div>

                <div className="col-span-4 md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Harga (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">Rp</span>
                    <input 
                      type="number" 
                      className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" 
                      value={formData.harga} 
                      onChange={e => setFormData({...formData, harga: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div className="col-span-4 md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Tipe Properti</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" 
                    value={formData.tipe} 
                    onChange={e => setFormData({...formData, tipe: e.target.value})}
                  >
                    <option>Rumah</option><option>Apartemen</option><option>Kos-kosan</option><option>Villa</option>
                  </select>
                </div>

                <div className="col-span-4 grid grid-cols-3 gap-4 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">K. Tidur</label>
                    <input type="number" className="w-full p-4 bg-white rounded-xl font-bold text-slate-700 outline-none border border-blue-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" value={formData.kamar_tidur} onChange={e => setFormData({...formData, kamar_tidur: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">K. Mandi</label>
                    <input type="number" className="w-full p-4 bg-white rounded-xl font-bold text-slate-700 outline-none border border-blue-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" value={formData.kamar_mandi} onChange={e => setFormData({...formData, kamar_mandi: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Luas (m²)</label>
                    <input type="number" className="w-full p-4 bg-white rounded-xl font-bold text-slate-700 outline-none border border-blue-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" value={formData.luas} onChange={e => setFormData({...formData, luas: e.target.value})} />
                  </div>
                </div>

                <div className="col-span-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Lokasi Lengkap</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Latitude</label>
                      <input type="text" placeholder="-5.450000" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Longitude</label>
                      <input type="text" placeholder="105.266670" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})}/>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Deskripsi</label>
                  <textarea className="w-full p-5 bg-slate-50 rounded-[2rem] font-bold text-slate-700 outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm h-32 resize-none" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}></textarea>
                </div>

                <div className="col-span-4 space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Pilih Fasilitas</label>
                  <div className="flex flex-wrap gap-2 p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                    {fasilitasOptions.map((item) => {
                      const active = formData.fasilitas.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleFasilitas(item)}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 border-2 ${
                            active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                          }`}
                        >
                          {active && <FiCheck className="inline mr-1" />} {item.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500/20 shadow-sm" 
                      placeholder="Tambah fasilitas kustom..." 
                      value={tempFasilitas}
                      onChange={(e) => setTempFasilitas(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFasilitasKustom())}
                    />
                    <button type="button" onClick={addFasilitasKustom} className="px-6 bg-slate-800 text-white rounded-2xl font-black hover:bg-black transition-all shadow-md active:scale-95"><FiPlus size={20}/></button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.fasilitas.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-[10px] shadow-sm animate-in slide-in-from-left-2 transition-all">
                        {f.toUpperCase()} <FiX className="cursor-pointer hover:text-red-400 transition" onClick={() => removeFasilitas(i)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-4 space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1 block">Foto Unit <span className="text-blue-500">(Minimal 2 Foto)</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={url} 
                          alt="preview" 
                          className="w-full h-full object-cover rounded-[2rem] border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-red-500 p-2 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all group overflow-hidden relative">
                      <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                      <div className="flex flex-col items-center group-hover:-translate-y-1 transition-transform">
                          <FiImage className="text-slate-300 text-3xl mb-2 group-hover:text-blue-400 transition-colors" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-500">Tambah Foto</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-10 py-8 bg-white border-t border-gray-50 flex gap-4">
              <button type="submit" onClick={handleSubmit} className="flex-[2] py-5 bg-[#1A314D] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-black hover:-translate-y-0.5 transition-all active:scale-95 uppercase tracking-widest">
                Simpan Data
              </button>
              <button type="button" onClick={closeModal} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all active:scale-95 uppercase tracking-widest">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}