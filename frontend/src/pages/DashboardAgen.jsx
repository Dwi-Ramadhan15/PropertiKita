import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiList, FiCheckSquare, FiPieChart, FiUser, FiTrash2, FiEdit3, FiPlus, FiX, FiBell, FiInfo } from 'react-icons/fi';
import ProfileAgen from '../pages/ProfileAgen'; 
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function DashboardAgen() {
  const [properti, setProperti] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('daftar');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const initialFormState = {
    title: '', harga: '', lokasi: '', tipe: 'Rumah', id_kategori: 1,
    kamar_tidur: 0, kamar_mandi: 0, luas: 0, deskripsi: '',
    latitude: -5.3971, longitude: 105.2668,
    kolam_renang: false, wifi: false, keamanan_24jam: false, parkir: false, ac: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const deleteReasons = [
    "Properti sudah laku terjual / tersewa",
    "Pemilik batal menjual / menyewakan",
    "Properti sedang dalam perbaikan / tidak layak",
    "Pindah ke agen pemasaran lain",
    "Lainnya"
  ];

  useEffect(() => {
    if (user && user.id) {
      socket.emit('join_room', `agen_${user.id}`);
      
      const handleNotify = (data) => {
        setToast(data.message);
        setNotifications(prev => [{ id: Date.now(), text: data.message, time: new Date().toLocaleTimeString(), status: data.status }, ...prev]);
        fetchProperti();

        setTimeout(() => {
          setToast(null);
        }, 5000);
      };

      socket.on('notify_agen', handleNotify);

      return () => {
        socket.off('notify_agen', handleNotify);
      };
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'agen') {
      navigate('/login');
    } else {
      fetchProperti();
    }
  }, []);

  const fetchProperti = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properti?agen=${user.id}&status=all`);
      setProperti(res.data.data.features.map(f => f.properties) || []);
    } catch (err) {}
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && selectedFiles.length < 2) {
      alert("Wajib upload minimal 2 foto!");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (['kamar_tidur', 'kamar_mandi', 'luas'].includes(key) && formData[key] === '') {
        data.append(key, 0);
      } else if (['latitude', 'longitude'].includes(key) && formData[key] === '') {
        data.append(key, key === 'latitude' ? -5.3971 : 105.2668);
      } else {
        data.append(key, formData[key]);
      }
    });
    
    data.append('id_agen', user.id);

    Array.from(selectedFiles).forEach((file) => {
      data.append('images', file); 
    });

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
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
      
      setTimeout(() => setToast(null), 5000);
      closeModal();
      fetchProperti();
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan pada server.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSelectedFiles([]);
    setFormData(initialFormState);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setFormData({
      title: p.title, harga: p.harga, lokasi: p.lokasi, tipe: p.tipe, id_kategori: p.id_kategori || 1,
      kamar_tidur: p.kamar_tidur || 0, kamar_mandi: p.kamar_mandi || 0, luas: p.luas || 0, 
      deskripsi: p.deskripsi || '', latitude: p.latitude || -5.3971, longitude: p.longitude || 105.2668, 
      kolam_renang: Boolean(p.kolam_renang),
      wifi: Boolean(p.wifi),
      keamanan_24jam: Boolean(p.keamanan_24jam),
      parkir: Boolean(p.parkir),
      ac: Boolean(p.ac)
    });
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
      await axios.delete(`http://localhost:5000/api/properti/${propertyToDelete.id}`);
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      setDeleteReason('');
      fetchProperti();
    } catch (err) {
      alert("Gagal menghapus properti");
    }
  };

  const renderContent = () => {
    if (activeTab === 'profil') {
      return <ProfileAgen />;
    }

    if (activeTab !== 'daftar') {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <FiPieChart className="text-4xl" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase italic">Segera Hadir</h3>
          <p className="text-gray-500 font-medium">Fitur ini sedang dalam tahap pengembangan. Pantau terus pembaruannya!</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b">
            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="p-6">Detail Properti</th>
              <th className="p-6 text-center">Harga & Status</th>
              <th className="p-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {properti.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition">
                <td className="p-6">
                  <div className="flex items-center gap-5">
                    <img src={p.image_url || p.imageUrl} className="w-24 h-20 rounded-[1.2rem] object-cover bg-gray-100" />
                    <div>
                      <div className="font-black text-xl text-gray-800">{p.title}</div>
                      <div className="text-xs font-bold text-blue-500 uppercase">{p.tipe} • {p.lokasi}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="font-black text-gray-800 text-lg">Rp {parseInt(p.harga).toLocaleString()}</div>
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-600' : p.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEditModal(p)} className="flex items-center gap-2 px-5 py-2 bg-amber-50 text-amber-600 rounded-xl font-black hover:bg-amber-500 hover:text-white transition text-[10px]">
                      <FiEdit3 /> EDIT
                    </button>
                    <button onClick={() => handleDeleteClick(p)} className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-500 hover:text-white transition text-[10px]">
                      <FiTrash2 /> HAPUS
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properti.length === 0 && <div className="p-20 text-center text-gray-300 font-black italic uppercase">Belum ada data</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      
      {toast && (
        <div className="fixed top-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] transform transition-all duration-500 translate-y-0 opacity-100">
          <div className="bg-[#D9AB7B] p-2 rounded-full text-slate-900"><FiInfo size={20} /></div>
          <div>
            <p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest">Informasi Sistem</p>
            <p className="font-bold text-sm">{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
        </div>
      )}

      <div className="w-72 bg-white border-r border-gray-100 shadow-xl flex flex-col p-6 z-10 hidden md:flex">
        <div className="mb-10 mt-4 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase relative z-10">Panel Agen</h2>
          <p className="text-[#D9AB7B] font-bold text-[10px] uppercase tracking-widest mt-1 relative z-10">Sistem Manajemen Properti</p>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          <button onClick={() => setActiveTab('daftar')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'daftar' ? 'bg-[#D9AB7B] text-[#1E293B] shadow-lg shadow-[#D9AB7B]/30' : 'text-gray-500 hover:bg-gray-50 hover:text-[#D9AB7B]'}`}>
            <FiList className="text-xl" /> Daftar Properti
          </button>
          <button onClick={() => setActiveTab('terjual')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'terjual' ? 'bg-[#D9AB7B] text-[#1E293B] shadow-lg shadow-[#D9AB7B]/30' : 'text-gray-500 hover:bg-gray-50 hover:text-[#D9AB7B]'}`}>
            <FiCheckSquare className="text-xl" /> Properti Terjual
          </button>
          <button onClick={() => setActiveTab('statistik')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'statistik' ? 'bg-[#D9AB7B] text-[#1E293B] shadow-lg shadow-[#D9AB7B]/30' : 'text-gray-500 hover:bg-gray-50 hover:text-[#D9AB7B]'}`}>
            <FiPieChart className="text-xl" /> Statistik Agen
          </button>
          <button onClick={() => setActiveTab('profil')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profil' ? 'bg-[#D9AB7B] text-[#1E293B] shadow-lg shadow-[#D9AB7B]/30' : 'text-gray-500 hover:bg-gray-50 hover:text-[#D9AB7B]'}`}>
            <FiUser className="text-xl" /> Profil Saya
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8 md:p-12 overflow-y-auto h-screen relative">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 uppercase">
              {activeTab === 'daftar' ? 'Kelola Listing' : activeTab === 'terjual' ? 'Riwayat Penjualan' : activeTab === 'statistik' ? 'Performa Agen' : 'Pengaturan Profil'}
            </h1>
            <p className="text-gray-500 font-bold ml-1 mt-2">Halo {user?.name}, selamat bekerja hari ini.</p>
          </div>
          
          <div className="flex items-center gap-4">
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
                        <div key={n.id} className="p-5 border-b border-gray-50 hover:bg-gray-50 flex gap-4 transition-all">
                          <div className={`mt-1 ${n.status === 'approved' ? 'text-green-500' : n.status === 'rejected' ? 'text-red-500' : 'text-[#D9AB7B]'}`}><FiInfo size={18}/></div>
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

            {activeTab === 'daftar' && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#D9AB7B] text-[#1E293B] px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-[#D9AB7B]/20 hover:bg-[#c49a6e] hover:-translate-y-1 transition-all h-14">
                <FiPlus className="text-xl" /> TAMBAH UNIT
              </button>
            )}
          </div>
        </div>

        {renderContent()}

      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black italic uppercase text-gray-900">Alasan Penghapusan</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-red-500 transition p-2 bg-gray-50 rounded-full hover:bg-red-50">
                <FiX className="text-xl font-black" />
              </button>
            </div>
            
            <p className="text-gray-500 font-medium mb-6 text-sm">
              Anda akan menghapus listing <strong className="text-gray-800">"{propertyToDelete?.title}"</strong>. Mohon pilih alasan mengapa properti ini dihapus dari sistem.
            </p>

            <div className="space-y-3 mb-8">
              {deleteReasons.map((reason, idx) => (
                <label key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${deleteReason === reason ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                  <input 
                    type="radio" 
                    name="deleteReason" 
                    value={reason} 
                    checked={deleteReason === reason} 
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-5 h-5 accent-red-600"
                  />
                  <span className={`font-bold text-sm ${deleteReason === reason ? 'text-red-700' : 'text-gray-600'}`}>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 hover:bg-red-700 transition">HAPUS PERMANEN</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-lg hover:bg-gray-200 transition">BATAL</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-4xl font-black italic mb-8 uppercase text-gray-900">{editingId ? 'Update Listing' : 'Input Properti Baru'}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="col-span-2 md:col-span-3">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Judul Listing</label>
                <input className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Kategori</label>
                <select className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.id_kategori} onChange={e => setFormData({...formData, id_kategori: Number(e.target.value)})}>
                  <option value={1}>Dijual</option>
                  <option value={2}>Disewakan</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Harga (Rp)</label>
                <input type="number" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.harga} onChange={e => setFormData({...formData, harga: e.target.value})} required />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tipe Properti</label>
                <select className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.tipe} onChange={e => setFormData({...formData, tipe: e.target.value})}>
                  <option>Rumah</option><option>Apartemen</option><option>Kos-kosan</option><option>Villa</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">K. Tidur</label>
                <input type="number" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.kamar_tidur} onChange={e => setFormData({...formData, kamar_tidur: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">K. Mandi</label>
                <input type="number" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.kamar_mandi} onChange={e => setFormData({...formData, kamar_mandi: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Luas Bangunan/Tanah (m²)</label>
                <input type="number" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.luas} onChange={e => setFormData({...formData, luas: e.target.value})} />
              </div>

              <div className="col-span-4">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Alamat / Lokasi Lengkap</label>
                <input type="text" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} required />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Latitude (Opsional)</label>
                <input type="text" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="-5.3971" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Longitude (Opsional)</label>
                <input type="text" className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="105.2668" />
              </div>

              <div className="col-span-4">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Deskripsi Properti</label>
                <textarea className="w-full p-5 bg-gray-50 rounded-[1.5rem] font-bold outline-none h-32" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}></textarea>
              </div>

              <div className="col-span-4">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Upload Foto (Min 2)</label>
                <input type="file" multiple onChange={handleFileChange} className="w-full p-6 bg-blue-50/50 text-blue-600 rounded-[1.5rem] border-2 border-dashed border-blue-200 font-black cursor-pointer" accept="image/*" />
              </div>
              <div className="col-span-4 bg-gray-50 p-6 rounded-[2rem] flex flex-wrap gap-6">
                {['kolam_renang', 'wifi', 'keamanan_24jam', 'parkir', 'ac'].map(f => (
                  <label key={f} className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" checked={formData[f]} onChange={e => setFormData({...formData, [f]: e.target.checked})} /> {f.replace('_', ' ')}
                  </label>
                ))}
              </div>

              <div className="col-span-4 mt-6 flex gap-4">
                <button type="submit" className="flex-[2] py-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-blue-700 transition">SIMPAN DATA</button>
                <button type="button" onClick={closeModal} className="flex-1 py-6 bg-gray-100 text-gray-400 rounded-[1.5rem] font-black text-xl hover:bg-gray-200 transition">BATAL</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}