import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DashboardAgen() {
  const [properti, setProperti] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const initialFormState = {
    title: '', harga: '', lokasi: '', tipe: 'Rumah', id_kategori: 1,
    kamar_tidur: 0, kamar_mandi: 0, luas: 0, deskripsi: '',
    latitude: -5.3971, longitude: 105.2668,
    kolam_renang: false, wifi: false, keamanan_24jam: false, parkir: false, ac: false
  };

  const [formData, setFormData] = useState(initialFormState);

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
    } catch (err) {
      console.error("Gagal load data");
    }
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
        alert("Berhasil diupdate!");
      } else {
        await axios.post('http://localhost:5000/api/properti', data, config);
        alert("Berhasil ditambah! Menunggu persetujuan admin.");
      }
      
      closeModal();
      fetchProperti();
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan pada server. Cek log terminal backend.");
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Panel Agen</h1>
            <p className="text-gray-500 font-bold ml-1">Halo {user?.name}, kelola properti Anda.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black shadow-xl hover:scale-105 transition">+ TAMBAH UNIT</button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white border-2 border-red-100 text-red-500 px-6 py-4 rounded-[1.5rem] font-black hover:bg-red-50 transition">LOGOUT</button>
          </div>
        </div>

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
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEditModal(p)} className="px-5 py-2 bg-amber-50 text-amber-600 rounded-xl font-black hover:bg-amber-500 hover:text-white transition text-[10px]">EDIT</button>
                      <button onClick={async () => { if(window.confirm('Hapus properti ini?')) { await axios.delete(`http://localhost:5000/api/properti/${p.id}`); fetchProperti(); } }} className="px-5 py-2 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-500 hover:text-white transition text-[10px]">HAPUS</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {properti.length === 0 && <div className="p-20 text-center text-gray-300 font-black italic uppercase">Belum ada data</div>}
        </div>
      </div>

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