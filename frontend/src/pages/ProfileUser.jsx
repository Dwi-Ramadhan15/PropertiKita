import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdCameraAlt, MdEdit, MdSave, MdCancel, MdLogout, MdPerson } from 'react-icons/md';
import Swal from 'sweetalert2';

const ProfileUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone_number: '' });

  const API_URL = 'http://localhost:5000/api/users';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
      setFormData({
        name: res.data.data.name,
        email: res.data.data.email,
        phone_number: res.data.data.phone_number || ''
      });
      setLoading(false);
    } catch (err) {
      navigate('/login');
    }
  };

  // Handle Pilih Gambar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload Foto Profil
  const handleUploadAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('image', selectedFile);

      const res = await axios.put(`${API_URL}/update-avatar`, data, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        Swal.fire('Berhasil!', 'Foto profil diperbarui.', 'success');
        setSelectedFile(null);
        fetchData(); // Refresh data user
      }
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal upload foto.', 'error');
    }
  };

  // Update Identitas
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Sukses!', 'Identitas diperbarui.', 'success');
      setIsEditing(false);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal!', 'Gagal memperbarui data.', 'error');
    }
  };

  if (loading) return <div className="text-center mt-20">Memuat...</div>;

  return (
    <div className="max-w-5xl mx-auto p-5">
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        {/* Header Profil */}
        <div className="bg-slate-900 h-32 relative">
            <h1 className="font-bold text-white text-center text-4xl font-extrabold mb-3 tracking-tight">HALAMAN PROFIL {user.name}</h1>
        </div>
        <div className="px-8 pb-8">
          <div className="relative -top-12 flex flex-col md:flex-row items-end gap-6">
            <div className="relative group">
              <img 
                src={preview || (user.foto_profil ? `http://localhost:9000/propertikita/${user.foto_profil}` : `https://ui-avatars.com/api/?name=${user.name}`)} 
                alt="Profile" 
                className="w-32 h-32 rounded-2xl border-4 border-white object-cover shadow-lg"
              />
              <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-lg text-white cursor-pointer hover:bg-blue-700 shadow-md transition-all">
                <MdCameraAlt size={20} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
              <p className="text-slate-500">{user.role.toUpperCase()}</p>
            </div>
            {selectedFile && (
              <button onClick={handleUploadAvatar} className="mb-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                Simpan Foto Baru
              </button>
            )}
          </div>

          {/* Form Identitas */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MdPerson className="text-blue-600" /> Identitas Diri
              </h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
                  <MdEdit /> Edit
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Nama Lengkap</label>
                <input 
                  disabled={!isEditing}
                  type="text"
                  className={`w-full p-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Email</label>
                <input 
                  disabled={!isEditing}
                  type="email"
                  className={`w-full p-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">No. WhatsApp</label>
                <input 
                  disabled={!isEditing}
                  type="text"
                  className={`w-full p-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>

              {isEditing && (
                <div className="md:col-span-2 flex gap-3 pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
                    <MdSave size={20}/> Simpan Perubahan
                  </button>
                  <button type="button" onClick={() => { setIsEditing(false); fetchData(); }} className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <MdCancel size={20}/> Batal
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;