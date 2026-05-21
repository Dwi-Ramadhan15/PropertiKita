import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export const useDashboardAgen = () => {
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  const defaultFormState = {
    title: '', harga: '', lokasi: '', tipe: 'Rumah', id_kategori: 1,
    kamar_tidur: 0, kamar_mandi: 0, luas: 0, deskripsi: '',
    latitude: -5.3971, longitude: 105.2668,
    fasilitas: [] 
  };

  const getDraftOrDefault = () => {
    const savedDraft = localStorage.getItem('properti_draft_formData');
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch(e) {
        return defaultFormState;
      }
    }
    return defaultFormState;
  };

  const [formData, setFormData] = useState(getDraftOrDefault());

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
    if (!editingId && showModal) {
      localStorage.setItem('properti_draft_formData', JSON.stringify(formData));
    }
  }, [formData, editingId, showModal]);

  useEffect(() => {
    if (!user || user.role !== 'agen') {
      navigate('/login');
      return;
    }
    
    fetchProperti();
    fetchNotifications(); 

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
    if (showModal && user) {
      const fetchFasilitas = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await axios.get(`http://localhost:5000/api/fasilitas?id_agen=${user.id}`, config);
          const daftarUnik = [...new Set(res.data.map(item => item.nama_fasilitas))];
          setFasilitasOptions(daftarUnik);
        } catch (err) {}
      };
      fetchFasilitas();
    }
  }, [showModal]);

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
        localStorage.removeItem('properti_draft_formData');
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
    setFormData(getDraftOrDefault());
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return {
    properti, showModal, setShowModal, editingId, selectedFiles, previews,
    activeTab, setActiveTab, showDeleteModal, setShowDeleteModal, deleteReason, setDeleteReason,
    fasilitasOptions, currentPage, setCurrentPage, itemsPerPage, notifications,
    showNotifDropdown, unreadCount, toast, setToast, tempFasilitas, setTempFasilitas,
    isMobileSidebarOpen, setIsMobileSidebarOpen, formData, setFormData, user, deleteReasons,
    getAvatar, toggleFasilitas, addFasilitasKustom, removeFasilitas, markNotificationsAsRead,
    handleFileChange, removeImage, handleSubmit, closeModal, openEditModal, handleDeleteClick,
    confirmDelete, formatRupiah, handleLogout
  };
};