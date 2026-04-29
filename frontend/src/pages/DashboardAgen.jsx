import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiList, FiPlus, FiTrash2, FiEdit3, FiHome, FiBell, FiUser, FiLogOut, FiShoppingCart, FiCheck, FiX } from 'react-icons/fi';

export default function DashboardAgen() {
  const [activeTab, setActiveTab] = useState('fasilitas');
  const [masterFasilitas, setMasterFasilitas] = useState([]);
  const [searchFasilitas, setSearchFasilitas] = useState("");
  const [toast, setToast] = useState(null);
  
  // State untuk Fitur Update
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'fasilitas') {
      fetchMasterFasilitas();
    }
  }, [activeTab]);

  const fetchMasterFasilitas = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fasilitas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasterFasilitas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal load fasilitas", err);
      setMasterFasilitas([]);
    }
  };

  const handleAddFasilitasMaster = async () => {
    const nama = prompt("Masukkan nama fasilitas baru:");
    if (!nama) return;
    try {
      await axios.post('http://localhost:5000/api/fasilitas', 
        { nama_fasilitas: nama }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast("Fasilitas berhasil ditambahkan!");
      fetchMasterFasilitas();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Gagal menambah fasilitas");
    }
  };

  // --- FUNGSI UPDATE BARU ---
  const startEdit = (f) => {
    setEditingId(f.id);
    setEditValue(f.nama_fasilitas);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleUpdateFasilitasMaster = async (id) => {
    if (!editValue.trim()) return;
    try {
      // Pastikan di backend kamu sudah ada route PUT /api/fasilitas/:id
      await axios.put(`http://localhost:5000/api/fasilitas/${id}`, 
        { nama_fasilitas: editValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast("Fasilitas berhasil diperbarui!");
      setEditingId(null);
      fetchMasterFasilitas();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Gagal memperbarui fasilitas. Pastikan backend mendukung route PUT.");
    }
  };

  const handleDeleteFasilitasMaster = async (id) => {
    if (!window.confirm("Hapus fasilitas ini secara permanen?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fasilitas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast("Fasilitas dihapus!");
      fetchMasterFasilitas();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const renderContent = () => {
    if (activeTab === 'fasilitas') {
      const filtered = (masterFasilitas || []).filter(f =>
        f.nama_fasilitas?.toLowerCase().includes(searchFasilitas.toLowerCase())
      );

      return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari fasilitas..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D9AB7B] font-bold text-sm shadow-inner"
                onChange={(e) => setSearchFasilitas(e.target.value)}
              />
              <FiList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleAddFasilitasMaster}
              className="ml-4 bg-[#D9AB7B] text-slate-900 px-6 py-4 rounded-2xl font-black text-xs hover:scale-105 transition shadow-lg flex items-center"
            >
              <FiPlus className="mr-2" /> TAMBAH FASILITAS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                  <th className="p-6">Nama Fasilitas</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? (
                  filtered.map((f) => (
                    <tr key={f.id} className="hover:bg-blue-50/30 transition">
                      <td className="p-6">
                        {editingId === f.id ? (
                          <input 
                            type="text"
                            className="w-full p-2 border-2 border-[#D9AB7B] rounded-lg font-bold outline-none"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className="font-black text-gray-800 text-lg uppercase">{f.nama_fasilitas}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        <span className="bg-green-100 text-green-600 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                          Tersedia
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          {editingId === f.id ? (
                            <>
                              <button 
                                onClick={() => handleUpdateFasilitasMaster(f.id)}
                                className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition shadow-sm"
                              >
                                <FiCheck />
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-500 hover:text-white transition shadow-sm"
                              >
                                <FiX />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEdit(f)}
                                className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition shadow-sm"
                              >
                                <FiEdit3 />
                              </button>
                              <button
                                onClick={() => handleDeleteFasilitasMaster(f.id)}
                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-10 text-center font-bold text-gray-300 italic">
                      Belum ada data fasilitas...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return <div className="p-10 text-center text-gray-400">Pilih menu di samping untuk melihat konten.</div>;
  };

  // ... (Sisa return utama tetap sama)
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar, Header, dan Toast tetap sama */}
      <div className="w-80 bg-white p-8 shadow-xl flex flex-col gap-4">
        <h1 className="text-2xl font-black text-[#D9AB7B] mb-10">PANEL AGEN</h1>
        {[
          { id: 'properti', icon: <FiHome />, label: 'Daftar Properti' },
          { id: 'penjualan', icon: <FiShoppingCart />, label: 'Riwayat Penjualan' },
          { id: 'fasilitas', icon: <FiList />, label: 'Fasilitas Properti' },
          { id: 'profil', icon: <FiUser />, label: 'Profil Saya' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === item.id ? 'bg-[#D9AB7B] text-white shadow-lg scale-105' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-black text-slate-800 uppercase tracking-tighter">Fasilitas</h2>
            <p className="text-gray-400 font-bold mt-2">Halo, selamat bekerja!</p>
          </div>
          <div className="flex gap-4">
            <button className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-[#D9AB7B] transition">
              <FiBell size={24} />
            </button>
          </div>
        </div>

        {renderContent()}

        {toast && (
          <div className="fixed bottom-10 right-10 bg-slate-900 text-[#D9AB7B] px-8 py-4 rounded-2xl font-black shadow-2xl animate-bounce">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}