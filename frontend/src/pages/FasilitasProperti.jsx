import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FasilitasProperti = () => {
  const [listFasilitas, setListFasilitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_fasilitas: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/fasilitas'); 
      setListFasilitas(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const handleOpenModal = (fasilitas = null) => {
    if (fasilitas) {
      setFormData({ id: fasilitas.id, nama_fasilitas: fasilitas.nama_fasilitas });
    } else {
      setFormData({ id: null, nama_fasilitas: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await axios.put(
          `http://localhost:5000/api/fasilitas/${formData.id}`, 
          { nama_fasilitas: formData.nama_fasilitas }, 
          getAuthHeaders()
        );
        alert("Fasilitas berhasil diperbarui!");
      } else {
        await axios.post(
          'http://localhost:5000/api/fasilitas', 
          { nama_fasilitas: formData.nama_fasilitas }, 
          getAuthHeaders()
        );
        alert("Fasilitas baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan fasilitas!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus fasilitas ini?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/fasilitas/${id}`, getAuthHeaders());
      alert("Fasilitas berhasil dihapus!");
      fetchData(); 
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus fasilitas!");
    }
  };

  const filteredFasilitas = listFasilitas.filter((f) =>
    f.nama_fasilitas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 relative">
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-black uppercase tracking-tighter">Daftar Fasilitas</h1>
         <button 
           onClick={() => handleOpenModal()}
           className="bg-[#C6A265] hover:bg-[#B39156] text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition shadow-md active:scale-95"
         >
           + TAMBAH FASILITAS
         </button>
       </div>

       <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden p-6 mb-8">
         <input 
           type="text" 
           placeholder="Cari nama fasilitas..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A265] font-semibold text-gray-700 placeholder:text-gray-400"
         />
       </div>

       <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
         {loading ? (
           <p className="p-10 text-center font-bold text-gray-400">Memuat data...</p>
         ) : (
           <table className="w-full text-left">
             <thead className="bg-gray-50">
               <tr className="border-b font-black text-xs text-gray-400 uppercase tracking-widest">
                 <th className="p-6">Nama Fasilitas</th>
                 <th className="p-6 text-center">Status</th>
                 <th className="p-6 text-center">Aksi</th>
               </tr>
             </thead>
             <tbody>
               {filteredFasilitas.length === 0 ? (
                 <tr>
                   <td colSpan="3" className="p-10 text-center text-gray-400 font-bold">Data fasilitas tidak ditemukan.</td>
                 </tr>
               ) : (
                 filteredFasilitas.map((f) => (
                   <tr key={f.id} className="border-b hover:bg-gray-50 transition">
                     <td className="p-6 font-bold text-gray-700 uppercase">{f.nama_fasilitas}</td>
                     <td className="p-6 text-center">
                       <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">TERSEDIA</span>
                     </td>
                     <td className="p-6 text-center space-x-3">
                       <button 
                         onClick={() => handleOpenModal(f)}
                         className="bg-yellow-100 text-yellow-600 px-4 py-2 rounded-md text-xs font-bold hover:bg-yellow-200 transition"
                       >
                         EDIT
                       </button>
                       <button 
                         onClick={() => handleDelete(f.id)}
                         className="bg-red-100 text-red-600 px-4 py-2 rounded-md text-xs font-bold hover:bg-red-200 transition"
                       >
                         HAPUS
                       </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         )}
       </div>

       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
             <h2 className="text-2xl font-black mb-6 text-gray-800 tracking-tight">
               {formData.id ? 'EDIT FASILITAS' : 'TAMBAH FASILITAS'}
             </h2>
             
             <form onSubmit={handleSave}>
               <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                   Nama Fasilitas
                 </label>
                 <input 
                   type="text" 
                   required
                   value={formData.nama_fasilitas}
                   onChange={(e) => setFormData({ ...formData, nama_fasilitas: e.target.value })}
                   className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6A265] font-semibold text-gray-700 placeholder:text-gray-400"
                   placeholder="Contoh: Kolam Renang"
                 />
               </div>

               <div className="flex justify-end space-x-3">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
                 >
                   BATAL
                 </button>
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className={`px-6 py-3 rounded-xl font-bold text-white transition shadow-md
                     ${isSubmitting ? 'bg-gray-400' : 'bg-[#C6A265] hover:bg-[#B39156] active:scale-95'}`}
                 >
                   {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );
};

export default FasilitasProperti;