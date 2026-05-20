import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export function useDashboardAdmin() {
  const [activeTab, setActiveTab] = useState('pending');
  const [filterStatus, setFilterStatus] = useState('all');
  const [subTabAccount, setSubTabAccount] = useState('user');
  const [propertiData, setPropertiData] = useState([]);
  const [allPropertiForStats, setAllPropertiForStats] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const isPropertyTab = ['all', 'pending', 'approved', 'rejected'].includes(activeTab);

  const fetchProperti = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const queryStatus = activeTab === 'all' ? filterStatus : activeTab;
      const res = await axios.get(`http://localhost:5000/api/properti?status=${queryStatus}&page=${page}&limit=5`, config);
      setPropertiData(res.data.data.features.map(f => f.properties) || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) {}
  };

  const fetchAllPropertiForStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/properti?status=all&limit=1000`, config);
      setAllPropertiForStats(res.data.data.features.map(f => f.properties) || []);
    } catch (err) {}
  };

  const fetchAccounts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/users?role=${subTabAccount}`, config);
      setAccountsData(res.data.data || []);
    } catch (err) {}
  };

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

  const fetchData = () => {
    if (isPropertyTab) fetchProperti();
    if (activeTab === 'accounts') fetchAccounts();
  };

  const refreshAllData = useCallback(() => {
    if (activeTab === 'pending' || activeTab === 'approved') {
      fetchProperti();
    }
    if (activeTab === 'accounts') {
      fetchAccounts();
    }
    fetchAllPropertiForStats(); 
  }, [activeTab, page, subTabAccount]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchData();
      fetchAllPropertiForStats();
      fetchNotifications(); 
    }
  }, [page, activeTab, subTabAccount, filterStatus]);

  useEffect(() => {
    let interval;
    if (selectedProperty && selectedProperty.gallery && selectedProperty.gallery.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.gallery.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedProperty]);

  useEffect(() => {
    socket.emit('join_room', 'admin_room');
    
    const handleNotify = (data) => {
      setToast(data.message);
      const newNotif = {
        id: data.id || Date.now(),
        title: data.title || 'Update Status Listing',
        message: data.message,
        status: data.status || 'info',
        created_at: data.created_at || new Date().toISOString(),
        is_read: false,
        slug: data.slug || null 
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      refreshAllData();
      setTimeout(() => setToast(null), 5000);
    };
    
    socket.on('notify_admin', handleNotify);
    return () => socket.off('notify_admin', handleNotify);
  }, [refreshAllData]);

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

  const handleClearNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/notifications/${user.id}/clear`, config);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleReviewClick = async (p) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/properti/${p.slug}`, config);
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/properti/${id}/status`, { status: newStatus }, config);
      
      if (selectedProperty) {
        socket.emit('property_status_changed', {
          agenId: selectedProperty.id_agen,
          title: selectedProperty.title,
          status: newStatus,
          message: `Properti "${selectedProperty.title}" Anda telah di-${newStatus === 'approved' ? 'terima' : 'tolak'} oleh admin.`
        });
      }

      setSelectedProperty(null);
      refreshAllData(); 
      setToast(`Listing berhasil di-${newStatus === 'approved' ? 'terima' : 'tolak'}`);
    } catch (err) { 
      alert("Gagal update status"); 
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Hapus akun ini secara permanen?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      fetchAccounts();
    } catch (err) { 
      alert("Gagal menghapus akun"); 
    }
  };

  const handleNotificationClick = async (notif) => {
    setShowNotifDropdown(false);
    
    if (notif.slug) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`http://localhost:5000/api/properti/${notif.slug}`, config);
        if (res.data.success) {
          setSelectedProperty(res.data.data);
          setCurrentImageIndex(0);
        }
      } catch (err) {
        console.error("Gagal memuat detail properti dari notifikasi:", err);
      }
    } else {
      setActiveTab('pending');
      setPage(1);
      fetchProperti();
    }
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return {
    activeTab, setActiveTab,
    filterStatus, setFilterStatus,
    subTabAccount, setSubTabAccount,
    propertiData,
    allPropertiForStats,
    accountsData,
    page, setPage,
    totalPages,
    selectedProperty, setSelectedProperty,
    currentImageIndex,
    notifications,
    showNotifDropdown, setShowNotifDropdown,
    unreadCount,
    toast, setToast,
    isMobileSidebarOpen, setIsMobileSidebarOpen,
    user,
    isPropertyTab,
    markNotificationsAsRead,
    handleClearNotifications,
    handleReviewClick,
    handleUpdateStatus,
    handleDeleteAccount,
    handleNotificationClick,
    formatRupiah,
    nextImage,
    prevImage,
    handleLogout
  };
}