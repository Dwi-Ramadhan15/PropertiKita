import React from 'react';
import { 
  FiList, FiCheckSquare, FiUser, FiTrash2, 
  FiEdit3, FiPlus, FiX, FiBell, FiInfo, FiCheck,
  FiSettings, FiMapPin, FiMenu, FiLogOut 
} from 'react-icons/fi';
import ProfileAgen from '../pages/ProfileAgen'; 
import FasilitasProperti from '../pages/FasilitasProperti';
import { useDashboardAgen } from './../hooks/useDashboardAgen';

export default function DashboardAgen() {
  const {
    properti, showModal, setShowModal, editingId, previews,
    activeTab, setActiveTab, showDeleteModal, setShowDeleteModal, deleteReason, setDeleteReason,
    fasilitasOptions, currentPage, setCurrentPage, itemsPerPage, notifications,
    showNotifDropdown, unreadCount, toast, setToast, tempFasilitas, setTempFasilitas,
    isMobileSidebarOpen, setIsMobileSidebarOpen, formData, setFormData, user, deleteReasons,
    getAvatar, toggleFasilitas, addFasilitasKustom, removeFasilitas, markNotificationsAsRead,
    handleFileChange, removeImage, handleSubmit, closeModal, openEditModal, handleDeleteClick,
    confirmDelete, formatRupiah, handleLogout
  } = useDashboardAgen();

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
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-500 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="p-4 md:p-6">Detail Unit</th>
                <th className="p-4 md:p-6">Lokasi</th>
                <th className="p-4 md:p-6 text-center">Harga</th>
                <th className="p-4 md:p-6 text-center">Status</th>
                <th className="p-4 md:p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 md:p-20 text-center font-bold text-gray-300 uppercase text-xs md:text-sm">
                    Belum ada data unit
                  </td>
                </tr>
              ) : (
                currentItems.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition group text-xs md:text-sm">
                    <td className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                        <img src={p.image_url || p.imageUrl} className="w-20 h-16 rounded-xl md:rounded-[1rem] object-cover bg-gray-100 shadow-sm flex-shrink-0" alt="prop" />
                        <div>
                          <div className="font-black text-slate-800 leading-tight mb-1 line-clamp-2">{p.title}</div>
                          <div className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 w-fit px-2 py-0.5 rounded-md">{p.tipe}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-2 text-slate-500 font-medium max-w-[150px] md:max-w-[200px]">
                        <FiMapPin className="text-[#1A314D] shrink-0" />
                        <span className="truncate">{p.lokasi}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-center font-black text-slate-800 whitespace-nowrap">
                      {formatRupiah(p.harga)}
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <span className={`text-[8px] md:text-[9px] px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-black uppercase tracking-tighter border ${
                        p.status === 'approved' ? 'bg-green-100 text-green-600 border-green-200' : 
                        p.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                        p.status === 'sold' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-red-100 text-red-600 border-red-200'
                      }`}>
                        {p.status === 'sold' ? 'Terjual' : p.status}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <div className="flex justify-center gap-1.5 md:gap-2">
                        {p.status !== 'sold' ? (
                          <>
                            <button onClick={() => openEditModal(p)} className="p-2 md:p-2.5 bg-gray-50 text-slate-400 rounded-lg md:rounded-xl hover:bg-[#1A314D] hover:text-white transition shadow-sm"><FiEdit3 size={14}/></button>
                            <button onClick={() => handleDeleteClick(p)} className="p-2 md:p-2.5 bg-red-50 text-red-500 rounded-lg md:rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><FiTrash2 size={14}/></button>
                          </>
                        ) : (
                          <span className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase">
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
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 bg-white border-t border-gray-50 gap-4 sm:gap-0">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 text-center sm:text-left">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, dataToDisplay.length)} dari {dataToDisplay.length} data
            </span>
            <div className="flex gap-1.5 md:gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-gray-100 font-bold text-[10px] md:text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                PREV
              </button>
              <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[120px] md:max-w-none">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center transition flex-shrink-0 ${currentPage === i + 1 ? 'bg-[#1A314D] text-white' : 'border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-gray-100 font-bold text-[10px] md:text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex pt-16 md:pt-20">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-20 right-4 lg:right-10 bg-slate-900 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-2xl shadow-2xl flex items-center gap-3 lg:gap-4 z-[200] animate-in slide-in-from-right duration-300 w-[90%] lg:w-auto">
          <div className="bg-[#1A314D] p-2 rounded-full text-white flex-shrink-0"><FiInfo size={16} className="md:w-5 md:h-5" /></div>
          <div className="flex-1">
            <p className="text-[8px] md:text-[10px] text-blue-300 font-black uppercase tracking-widest">Informasi Sistem</p>
            <p className="font-bold text-xs md:text-sm">{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white flex-shrink-0"><FiX size={18} className="md:w-5 md:h-5"/></button>
        </div>
      )}

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className={`fixed top-16 md:top-20 left-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-64 md:w-72 bg-white border-r border-blue-50 shadow-2xl md:shadow-sm flex flex-col z-50 md:z-40 overflow-y-auto custom-scrollbar transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 md:p-6 flex justify-between items-center md:block">
          <div className="bg-[#EBF5FF] p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 border border-white shadow-sm w-full">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
              <img src={getAvatar()} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="font-bold text-slate-800 text-xs md:text-sm truncate uppercase tracking-tight">{user?.name || 'Agen'}</h3>
              <p className="text-[8px] md:text-[10px] text-blue-400 font-bold uppercase tracking-wider">Agen Properti</p>
            </div>
          </div>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-red-500 ml-2">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 md:gap-2 px-4 md:px-6 flex-1 mt-2 md:mt-4">
          <button onClick={() => {setActiveTab('daftar'); setIsMobileSidebarOpen(false);}} className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 ${activeTab === 'daftar' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiList className="text-lg md:text-xl" /> <span className="text-xs md:text-sm">Daftar Properti</span>
          </button>
          <button onClick={() => {setActiveTab('terjual'); setIsMobileSidebarOpen(false);}} className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 ${activeTab === 'terjual' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiCheckSquare className="text-lg md:text-xl" /> <span className="text-xs md:text-sm">Riwayat Penjualan</span>
          </button>
          <button onClick={() => {setActiveTab('fasilitasproperti'); setIsMobileSidebarOpen(false);}} className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 ${activeTab === 'fasilitasproperti' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiSettings className="text-lg md:text-xl" /> <span className="text-xs md:text-sm">Fasilitas</span>
          </button>
          <button onClick={() => {setActiveTab('profil'); setIsMobileSidebarOpen(false);}} className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 ${activeTab === 'profil' ? 'bg-[#1A314D] text-white shadow-xl shadow-blue-900/20' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
            <FiUser className="text-lg md:text-xl" /> <span className="text-xs md:text-sm">Profil Saya</span>
          </button>
        </nav>

        <div className="p-6 md:p-8 border-t border-blue-50 mt-auto">
          <button onClick={handleLogout} className="flex items-center justify-center md:justify-start gap-2 md:gap-3 text-red-400 font-black text-[10px] md:text-xs hover:text-red-600 transition uppercase tracking-widest w-full">
            <FiLogOut /> Logout Sistem
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-0 md:ml-72 p-4 md:p-12 overflow-x-hidden relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] w-full">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-10 gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-0">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-gray-800 text-2xl p-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <FiMenu />
            </button>
            <div>
              <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase">
                {activeTab === 'daftar' && "Daftar Properti"}
                {activeTab === 'terjual' && "Riwayat Penjualan"}
                {activeTab === 'fasilitasproperti' && "Kelola Fasilitas"}
                {activeTab === 'profil' && "Informasi Profil"}
              </h1>
              <p className="text-slate-400 font-bold text-[9px] md:text-xs uppercase tracking-widest mt-1 md:mt-2 ml-1">
                Dashboard / {activeTab === 'fasilitasproperti' ? 'Fasilitas' : activeTab}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
            {activeTab !== 'profil' && (
              <div className="relative z-30">
                <button onClick={markNotificationsAsRead} className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-sm border border-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition relative">
                  <FiBell size={20} className="md:w-6 md:h-6" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-red-500 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 md:border-4 border-[#F1F3F6]">{unreadCount}</span>}
                </button>

                {showNotifDropdown && (
                  <div className="absolute left-0 md:left-auto md:right-0 mt-3 md:mt-4 w-[280px] md:w-80 bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden">
                    <div className="p-4 md:p-6 bg-slate-900 text-white flex justify-between items-center">
                      <h3 className="font-black uppercase text-xs md:text-sm">Notifikasi</h3>
                      <span className="text-[8px] md:text-[10px] bg-blue-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full font-bold">{notifications.length} Pesan</span>
                    </div>
                    <div className="max-h-64 md:max-h-80 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 md:py-6 font-bold text-xs md:text-sm">Belum ada pemberitahuan</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition border ${notif.is_read ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-blue-100 shadow-sm'}`}>
                            <div className="flex items-center gap-2 md:gap-3 mb-1">
                              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full flex-shrink-0 ${
                                notif.status === 'approved' ? 'bg-green-500' : 
                                notif.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                              }`}></div>
                              <p className="text-[9px] md:text-xs font-bold text-gray-500">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-xs md:text-sm font-black text-gray-800 leading-tight pl-3 md:pl-5">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'daftar' || activeTab === 'terjual') && (
              <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-1.5 md:gap-2 bg-[#1A314D] text-white px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg md:shadow-2xl shadow-blue-900/40 hover:-translate-y-1 transition-all h-10 md:h-14 uppercase tracking-widest text-[9px] md:text-[11px] flex-1 md:flex-none">
                <FiPlus size={16} className="md:w-[18px] md:h-[18px]" /> Tambah Unit
              </button>
            )}
          </div>
        </header>

        {renderContent()}
      </div>

      {/* MODAL PENGEHAPUSAN / SOLD */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-black uppercase text-gray-900">Konfirmasi Hapus</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} className="md:w-6 md:h-6" /></button>
            </div>
            <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {deleteReasons.map((reason, idx) => (
                <label key={idx} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all ${deleteReason === reason ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
                  <input type="radio" name="deleteReason" value={reason} checked={deleteReason === reason} onChange={(e) => setDeleteReason(e.target.value)} className="w-4 h-4 md:w-5 md:h-5 accent-red-600 flex-shrink-0" />
                  <span className={`font-bold text-xs md:text-sm leading-snug ${deleteReason === reason ? 'text-red-700' : 'text-gray-600'}`}>{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button onClick={confirmDelete} className="w-full sm:flex-[2] py-3 md:py-4 bg-red-600 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl hover:bg-red-700 transition order-1 sm:order-2">KONFIRMASI</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full sm:flex-1 py-3 md:py-4 bg-gray-100 text-gray-500 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-gray-200 transition order-2 sm:order-1">BATAL</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT UNIT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[250] p-2 md:p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl md:rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] flex flex-col animate-in fade-in zoom-in duration-300">
            
            <div className="px-5 py-4 md:px-10 md:py-8 flex justify-between items-center bg-white border-b border-gray-50 flex-shrink-0">
              <div>
                <h2 className="text-xl md:text-3xl font-black tracking-tighter text-slate-800 uppercase">
                  {editingId ? 'Update Listing' : 'Unit Baru'}
                </h2>
                <p className="text-[9px] md:text-xs font-bold text-blue-500 tracking-widest uppercase mt-0.5 md:mt-1">Lengkapi informasi properti anda</p>
              </div>
              <button 
                onClick={closeModal} 
                className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm"
              >
                <FiX size={20} className="md:w-6 md:h-6"/>
              </button>
            </div>
            
            <div className="p-5 md:p-10 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* --- SEKSI 1: INFORMASI DASAR --- */}
                <div className="space-y-4">
                  <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider border-b pb-2 border-gray-100">1. Informasi Dasar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Nama Properti / Judul Listing *</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Rumah Minimalis Modern Cluster A" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Harga Unit (Rp) *</label>
                      <input type="number" required value={formData.harga} onChange={e => setFormData({...formData, harga: e.target.value})} placeholder="Contoh: 500000000" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Tipe Properti</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Rumah</option>
                        <option>Kost</option>
                        <option>Apartemen</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Kategori Transaksi</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Di Jual</option>
                        <option>Di Sewakan</option>
                      </select>
                    </div>
                  </div>

                  {/* Baris Baru Khusus Alamat Lokasi (Lebar Penuh di Bawahnya) */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Alamat Lokasi *</label>
                    <input 
                      type="text" 
                      placeholder="Nama jalan, kota, atau daerah lengkap..." 
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                {/* --- SEKSI 2: SPESIFIKASI FISIK --- */}
                <div className="space-y-4">
                  <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider border-b pb-2 border-gray-100">2. Spesifikasi Fisik</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Kamar Tidur</label>
                      <input type="number" value={formData.kamar_tidur} onChange={e => setFormData({...formData, kamar_tidur: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Kamar Mandi</label>
                      <input type="number" value={formData.kamar_mandi} onChange={e => setFormData({...formData, kamar_mandi: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Luas (M²)</label>
                      <input type="number" value={formData.luas} onChange={e => setFormData({...formData, luas: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                  </div>
                </div>

                {/* --- SEKSI 3: DESKRIPSI & KOORDINAT --- */}
                <div className="space-y-4">
                  <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider border-b pb-2 border-gray-100">3. Deskripsi & Koordinat Geografis</h4>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Lengkap *</label>
                    <textarea required rows="4" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} placeholder="Tulis spesifikasi mendalam, keunggulan, akses strategis dsb..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Latitude</label>
                      <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Longitude</label>
                      <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs md:text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                    </div>
                  </div>
                </div>

                {/* --- SEKSI 4: KELOLA FASILITAS --- */}
                <div className="space-y-4">
                  <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider border-b pb-2 border-gray-100">4. Fasilitas Internal Properti</h4>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Pilih dari Fasilitas Terdaftar Anda:</label>
                    <div className="flex flex-wrap gap-2">
                      {fasilitasOptions.length === 0 ? (
                        <p className="text-xs text-gray-400 font-medium">Belum ada master fasilitas di tab menu Kelola Fasilitas.</p>
                      ) : (
                        fasilitasOptions.map((item, index) => {
                          const aktif = formData.fasilitas.includes(item);
                          return (
                            <button key={index} type="button" onClick={() => toggleFasilitas(item)} className={`px-4 py-2 rounded-xl font-bold text-xs border uppercase tracking-wider transition ${aktif ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-slate-500 hover:bg-gray-100'}`}>
                              {item}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Tambah Fasilitas Tambahan Kustom</label>
                    <div className="flex gap-2">
                      <input type="text" value={tempFasilitas} onChange={e => setTempFasilitas(e.target.value)} placeholder="Contoh: Smart Door Lock, Balkon Luas, Kolam Renang Anak" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                      <button type="button" onClick={addFasilitasKustom} className="px-5 bg-slate-900 text-white font-black text-xs rounded-xl hover:bg-slate-800 uppercase tracking-wider transition">Tambah</button>
                    </div>
                  </div>
                  {formData.fasilitas.length > 0 && (
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fasilitas Terpilih untuk Unit Ini:</label>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        {formData.fasilitas.map((f, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 uppercase">
                            {f}
                            <button type="button" onClick={() => removeFasilitas(idx)} className="text-red-400 hover:text-red-600 transition"><FiX size={12} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- SEKSI 5: DOKUMENTASI / GAMBAR --- */}
                <div className="space-y-4">
                  <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider border-b pb-2 border-gray-100">5. Galeri Foto Properti</h4>
                  <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-6 md:p-8 text-center transition cursor-pointer relative bg-gray-50/50">
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-slate-400"><FiPlus size={20} /></div>
                      <p className="font-black text-xs md:text-sm text-slate-800 uppercase tracking-tight">Upload Foto Unit Anda</p>
                      <p className="text-[10px] text-gray-400 font-medium">Format JPEG/PNG. Wajib minimal 2 foto agar valid ditinjau admin.</p>
                    </div>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      {previews.map((src, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden border bg-gray-100 group shadow-sm">
                          <img src={src} className="w-full h-full object-cover" alt="Preview" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100 shadow-md"><FiTrash2 size={12}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BUTTON SUBMIT MODAL */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={closeModal} className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-xs rounded-xl uppercase tracking-widest transition">Batal</button>
                  <button type="submit" className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 uppercase tracking-widest transition">Simpan Properti</button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}