import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiSearch, FiEdit3, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';

const FasilitasProperti = () => {
  const [listFasilitas, setListFasilitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorStatus, setErrorStatus] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    nama_fasilitas: '', 
    id_properti: '' // Tambahkan id_properti agar tidak NULL di DB
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi ambil header - Kunci utama sembuhin 401
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const response = await axios.get('http://localhost:5000/api/fasilitas', getAuthHeaders()); 
      // Handle jika response nested atau langsung array
      const data = response.data.data || response.data;
      setListFasilitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setErrorStatus(error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleOpenModalEvent = () => handleOpenModal();
    window.addEventListener('openFasilitasModal', handleOpenModalEvent);
    return () => window.removeEventListener('openFasilitasModal', handleOpenModalEvent);
  }, [getAuthHeaders]);

  const handleOpenModal = (fasilitas = null) => {
    if (fasilitas) {
      setFormData({ 
        id: fasilitas.id, 
        nama_fasilitas: fasilitas.nama_fasilitas,
        id_properti: fasilitas.id_properti || '' 
      });
    } else {
      setFormData({ id: null, nama_fasilitas: '', id_properti: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.id_properti) return alert("ID Properti wajib diisi agar data tidak NULL!");
    
    setIsSubmitting(true);
    try {
      const payload = { 
        nama_fasilitas: formData.nama_fasilitas,
        id_properti: parseInt(formData.id_properti) 
      };

      if (formData.id) {
        await axios.put(`http://localhost:5000/api/fasilitas/${formData.id}`, payload, getAuthHeaders());
      } else {
        await axios.post('http://localhost:5000/api/fasilitas', payload, getAuthHeaders());
      }
      
      setIsModalOpen(false);
      fetchData(); 
      alert("Data berhasil disimpan!");
    } catch (error) {
      alert(error.response?.status === 401 ? "Sesi habis, login ulang!" : "Gagal menyimpan!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/fasilitas/${id}`, getAuthHeaders());
      fetchData(); 
    } catch (error) {
      alert("Gagal menghapus!");
    }
  };

  const filteredFasilitas = listFasilitas.filter((f) =>
    f.nama_fasilitas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      {/* ALERT JIKA 401 */}
      {errorStatus === 401 && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl">
          <FiAlertCircle size={20} />
          <p className="font-bold">Error 401: Token tidak valid. Silakan Logout dan Login kembali!</p>
        </div>
      )}
      
      {/* SEARCH BAR */}
      <div className="mb-8 flex gap-4">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center px-6">
          <FiSearch className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Cari nama fasilitas..." 
            className="w-full bg-transparent outline-none font-bold text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABEL AREA */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-50 text-center">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b">
            <tr className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
              <th className="p-6 text-left">ID Properti</th>
              <th className="p-6 text-left">Nama Fasilitas</th>
              <th className="p-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="3" className="p-20 text-gray-300 font-black uppercase tracking-widest text-[10px]">Memuat data...</td></tr>
            ) : filteredFasilitas.length === 0 ? (
              <tr><td colSpan="3" className="p-20 text-gray-300 font-black italic uppercase text-sm italic">Data Kosong</td></tr>
            ) : (
              filteredFasilitas.map((f) => (
                <tr key={f.id} className="hover:bg-blue-50/20 transition group">
                  <td className="p-6 text-left font-black text-blue-500 text-xs">
                    # UNIT {f.id_properti || 'NULL'}
                  </td>
                  <td className="p-6 text-left font-bold text-slate-700 uppercase text-sm italic">
                    {f.nama_fasilitas}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(f)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition shadow-sm"><FiEdit3 size={14}/></button>
                      <button onClick={() => handleDelete(f.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><FiTrash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT/TAMBAH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-6 text-gray-900 tracking-tighter uppercase italic">{formData.id ? 'Edit Fasilitas' : 'Fasilitas Baru'}</h2>
            <form onSubmit={handleSave}>
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">ID Unit Properti (Cek Daftar Properti)</label>
                  <input 
                    type="number" required placeholder="Masukan ID Properti"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-[#D9AB7B] outline-none"
                    value={formData.id_properti}
                    onChange={(e) => setFormData({ ...formData, id_properti: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Nama Fasilitas</label>
                  <input 
                    type="text" required placeholder="Contoh: AC, WiFi, Dapur"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-[#D9AB7B] outline-none"
                    value={formData.nama_fasilitas}
                    onChange={(e) => setFormData({ ...formData, nama_fasilitas: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl font-black text-[#1A314D] bg-[#D9AB7B] hover:bg-[#c49a6a] transition uppercase text-xs tracking-widest shadow-lg shadow-[#D9AB7B]/20">
                  {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-400 bg-gray-100 hover:bg-gray-200 transition uppercase text-xs tracking-widest">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FasilitasProperti;