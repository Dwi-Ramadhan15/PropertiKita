import React from 'react';
import { 
  FiCheckCircle, FiClock, FiUser, FiLogOut, FiUsers, FiX, 
  FiTrash2, FiBell, FiInfo, FiMapPin, FiChevronLeft, 
  FiChevronRight, FiExternalLink, FiSearch, FiHome, FiList, FiMenu 
} from 'react-icons/fi';
import ProfileAdmin from './ProfileAdmin';
import {useDashboardAdmin} from '../hooks/UseDashboardAdmin';

export default function DashboardAdmin() {
  const {
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    subTabAccount,
    setSubTabAccount,
    propertiData,
    allPropertiForStats,
    accountsData,
    page,
    setPage,
    totalPages,
    selectedProperty,
    setSelectedProperty,
    currentImageIndex,
    notifications,
    showNotifDropdown,
    unreadCount,
    toast,
    setToast,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
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
  } = useDashboardAdmin();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {toast && (
        <div className="fixed top-10 right-4 lg:right-10 bg-slate-900 text-white px-4 lg:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 lg:gap-4 z-[200] animate-in slide-in-from-right duration-300 w-[90%] lg:w-auto">
          <div className="bg-[#D9AB7B] p-2 rounded-full text-slate-900 flex-shrink-0"><FiInfo size={20} /></div>
          <div className="flex-1">
            <p className="text-[10px] text-[#D9AB7B] font-black uppercase tracking-widest">Sistem</p>
            <p className="font-bold text-xs lg:text-sm">{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white flex-shrink-0"><FiX size={20}/></button>
        </div>
      )}

      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      <div className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 lg:z-40 shadow-2xl overflow-y-auto custom-scrollbar transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:top-[72px] lg:h-[calc(100vh-72px)]`}>
        <div className="p-6 lg:p-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter text-[#D9AB7B]">PROPERTIKITA</h1>
            <p className="text-[9px] lg:text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1 uppercase">Admin Control</p>
          </div>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white text-2xl">
            <FiX />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 pb-10">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-4 mb-2">Manajemen Properti</p>
          <button onClick={() => {setActiveTab('all'); setFilterStatus('all'); setPage(1); setIsMobileSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'all' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiList size={20} /> <span className="text-sm uppercase">Semua Properti</span>
          </button>
          <button onClick={() => {setActiveTab('pending'); setPage(1); setIsMobileSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'pending' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiClock size={20} /> <span className="text-sm uppercase tracking-tight">Belum Verifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('approved'); setPage(1); setIsMobileSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'approved' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiCheckCircle size={20} /> <span className="text-sm uppercase">Terverifikasi</span>
          </button>
          <button onClick={() => {setActiveTab('rejected'); setPage(1); setIsMobileSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'rejected' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiX size={20} /> <span className="text-sm uppercase">Ditolak</span>
          </button>

          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Manajemen Akun</p>
          <button onClick={() => {setActiveTab('accounts'); setPage(1); setIsMobileSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'accounts' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiUsers size={20} /> <span className="text-sm uppercase tracking-tight">Kelola Akun</span>
          </button>

          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-5 mt-6 mb-2">Sistem</p>
          <button onClick={() => {setActiveTab('profile'); setIsMobileSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-[#D9AB7B] text-slate-900 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
            <FiUser size={20} /> <span className="text-sm uppercase tracking-tight">Profil Admin</span>
          </button>
        </nav>
        <div className="p-6 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all">
            <FiLogOut /> KELUAR SISTEM
          </button>
        </div>
      </div>

      <div className="flex-1 lg:ml-72 p-4 md:p-10 w-full overflow-x-hidden">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden text-gray-800 text-2xl p-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <FiMenu />
            </button>
            <div>
              <h1 className="text-2xl md:text-5xl font-black italic tracking-tighter text-gray-900 uppercase">
                {activeTab === 'all' ? 'Semua Properti' : activeTab === 'pending' ? 'Belum Verifikasi' : activeTab === 'approved' ? 'Terverifikasi' : activeTab === 'rejected' ? 'Properti Ditolak' : activeTab === 'accounts' ? 'Kelola Akun' : 'Profil Admin'}
              </h1>
              <p className="text-gray-500 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-1 md:mt-2 ml-1">Halo {user?.name}, Dashboard / {activeTab}</p>
            </div>
          </div>
          <div className="relative self-end md:self-auto">
            <button onClick={markNotificationsAsRead} className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-[#D9AB7B] relative transition-all">
              <FiBell size={20} className="md:w-6 md:h-6" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[9px] md:text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">{unreadCount}</span>}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 mt-4 w-[300px] md:w-[350px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="bg-slate-900 text-white p-5 md:p-6 flex justify-between items-center">
                  <span className="font-black italic uppercase text-sm md:text-base">Pemberitahuan</span>
                  <button onClick={handleClearNotifications} className="text-[9px] md:text-[10px] text-[#D9AB7B] hover:text-white font-bold uppercase">Bersihkan</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 md:p-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Kosong</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 md:p-5 border-b border-gray-50 flex gap-3 md:gap-4 transition-all cursor-pointer ${n.is_read ? 'bg-white' : 'bg-blue-50/30 hover:bg-blue-50'}`}>
                        <div className={`mt-1 ${n.status === 'info' || n.status === 'pending' ? 'text-blue-500' : 'text-[#D9AB7B]'}`}><FiInfo size={16} className="md:w-[18px] md:h-[18px]"/></div>
                        <div>
                          <p className="text-xs font-black text-gray-900 mb-1">{n.title || 'Informasi'}</p>
                          <p className="text-[10px] md:text-xs font-bold text-gray-600 leading-relaxed">{n.message}</p>
                          <p className="text-[8px] md:text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {isPropertyTab && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <button onClick={() => {setActiveTab('all'); setFilterStatus('all'); setPage(1);}} className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border flex flex-col xl:flex-row items-start xl:items-center gap-3 md:gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'all' ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-100'}`}>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0"><FiHome size={20} className="md:w-6 md:h-6"/></div>
              <div><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase leading-tight">Total</p><h3 className="text-lg md:text-2xl font-black text-gray-900 leading-tight">{allPropertiForStats.length}</h3></div>
            </button>

            <button onClick={() => {setActiveTab('approved'); setPage(1);}} className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border flex flex-col xl:flex-row items-start xl:items-center gap-3 md:gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'approved' ? 'border-green-500 shadow-md ring-2 ring-green-100' : 'border-gray-100'}`}>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center text-green-500 flex-shrink-0"><FiCheckCircle size={20} className="md:w-6 md:h-6"/></div>
              <div><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase leading-tight">Diterima</p><h3 className="text-lg md:text-2xl font-black text-gray-900 leading-tight">{allPropertiForStats.filter(p => p.status === 'approved').length}</h3></div>
            </button>

            <button onClick={() => {setActiveTab('pending'); setPage(1);}} className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border flex flex-col xl:flex-row items-start xl:items-center gap-3 md:gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'pending' ? 'border-amber-500 shadow-md ring-2 ring-amber-100' : 'border-gray-100'}`}>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-50 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0"><FiClock size={20} className="md:w-6 md:h-6"/></div>
              <div><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase leading-tight">Pending</p><h3 className="text-lg md:text-2xl font-black text-gray-900 leading-tight">{allPropertiForStats.filter(p => p.status === 'pending').length}</h3></div>
            </button>

            <button onClick={() => {setActiveTab('rejected'); setPage(1);}} className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border flex flex-col xl:flex-row items-start xl:items-center gap-3 md:gap-5 transition-all active:scale-95 text-left border-b-4 ${activeTab === 'rejected' ? 'border-red-500 shadow-md ring-2 ring-red-100' : 'border-gray-100'}`}>
              <div className="w-10 h-10 md:w-14 md:h-14 bg-red-50 rounded-xl md:rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0"><FiX size={20} className="md:w-6 md:h-6"/></div>
              <div><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase leading-tight">Ditolak</p><h3 className="text-lg md:text-2xl font-black text-gray-900 leading-tight">{allPropertiForStats.filter(p => p.status === 'rejected').length}</h3></div>
            </button>
          </div>
        )}

        {activeTab === 'profile' ? (
          <ProfileAdmin />
        ) : activeTab === 'accounts' ? (
          <div className="space-y-6 w-full">
             <div className="flex gap-2 bg-gray-100 p-2 rounded-[1.5rem] w-fit shadow-inner overflow-x-auto max-w-full">
               <button onClick={() => {setSubTabAccount('user'); setPage(1);}} className={`px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all whitespace-nowrap ${subTabAccount === 'user' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Daftar User</button>
               <button onClick={() => {setSubTabAccount('agen'); setPage(1);}} className={`px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all whitespace-nowrap ${subTabAccount === 'agen' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Daftar Agen</button>
             </div>
             <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-gray-50/50 border-b">
                    <tr className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="p-4 md:p-6">Identitas {subTabAccount}</th>
                      <th className="p-4 md:p-6">Email Terdaftar</th>
                      <th className="p-4 md:p-6 text-center">Status</th>
                      <th className="p-4 md:p-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 uppercase text-[10px] md:text-xs font-bold">
                    {accountsData.map(u => (
                      <tr key={u.id} className="hover:bg-blue-50/20 transition">
                        <td className="p-4 md:p-8 flex items-center gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#D9AB7B]/20 text-[#D9AB7B] flex items-center justify-center font-black flex-shrink-0">{u.name.charAt(0)}</div>
                          <span className="text-slate-800 line-clamp-1">{u.name}</span>
                        </td>
                        <td className="p-4 md:p-8 text-slate-500 normal-case">{u.email}</td>
                        <td className="p-4 md:p-8 text-center"><span className="px-2 py-1 md:px-3 md:py-1.5 bg-green-100 text-green-600 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-tighter">Verified</span></td>
                        <td className="p-4 md:p-8 text-center">
                          <button onClick={() => handleDeleteAccount(u.id)} className="p-2.5 md:p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><FiTrash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {accountsData.length === 0 && <div className="p-16 md:p-20 text-center text-gray-300 font-black italic uppercase tracking-widest text-xs">Data {subTabAccount} Kosong</div>}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 w-full">
            <div className="p-6 md:p-8 flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-gray-50 gap-6">
               <div className="w-full xl:w-auto">
                 <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-gray-800">
                   Properti {activeTab === 'pending' ? 'Belum Verifikasi' : activeTab === 'approved' ? 'Terverifikasi' : activeTab === 'rejected' ? 'Ditolak' : 'Keseluruhan'}
                 </h2>
                 {activeTab === 'all' && (
                   <div className="flex gap-1.5 md:gap-2 mt-4 bg-gray-100 p-1.5 rounded-xl md:rounded-2xl w-full xl:w-fit shadow-inner overflow-x-auto no-scrollbar">
                      <button onClick={() => {setFilterStatus('all'); setPage(1);}} className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all whitespace-nowrap flex-1 xl:flex-none ${filterStatus === 'all' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Semua</button>
                      <button onClick={() => {setFilterStatus('approved'); setPage(1);}} className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all whitespace-nowrap flex-1 xl:flex-none ${filterStatus === 'approved' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Terverifikasi</button>
                      <button onClick={() => {setFilterStatus('pending'); setPage(1);}} className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all whitespace-nowrap flex-1 xl:flex-none ${filterStatus === 'pending' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>Belum Verifikasi</button>
                   </div>
                 )}
               </div>
               <div className="relative w-full xl:w-auto">
                 <input type="text" placeholder="Cari unit..." className="w-full xl:w-64 pl-10 pr-4 py-3 bg-[#F1F3F6] border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#D9AB7B]/50 transition-all" />
                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               </div>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50/50">
                  <tr className="text-left text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="p-4 md:p-6 w-[45%]">Detail Properti</th>
                    <th className="p-4 md:p-6 text-center">Status</th>
                    <th className="p-4 md:p-6 text-center">Harga Unit</th>
                    <th className="p-4 md:p-6 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 uppercase text-[10px] md:text-xs font-bold">
                  {propertiData.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/20 transition">
                      <td className="p-4 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5">
                          <img src={p.imageUrl || p.image_url} className="w-20 h-16 md:w-24 md:h-20 rounded-xl md:rounded-[1.2rem] object-cover bg-gray-100 shadow-sm flex-shrink-0" alt="" />
                          <div>
                            <div className="font-black text-sm md:text-xl text-slate-800 leading-tight italic tracking-tighter mb-1 line-clamp-2">{p.title}</div>
                            <div className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 tracking-tighter"><FiMapPin className="flex-shrink-0"/> <span className="line-clamp-1">{p.lokasi}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        <span className={`text-[7px] md:text-[8px] px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-black uppercase tracking-tighter border ${
                          p.status === 'approved' ? 'bg-green-100 text-green-600 border-green-200' : 
                          p.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                          p.status === 'rejected' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-center"><div className="font-black text-gray-800 text-sm md:text-lg whitespace-nowrap">{formatRupiah(p.harga)}</div></td>
                      <td className="p-4 md:p-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleReviewClick(p)} className="px-5 md:px-6 py-2 bg-blue-600 text-white rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition uppercase tracking-widest">Review</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {propertiData.length === 0 && (
                <div className="p-16 md:p-20 text-center text-gray-300 font-black italic uppercase tracking-widest text-xs">Data Properti Kosong</div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 border-t border-gray-50 bg-gray-50/30 gap-4 sm:gap-0">
              <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Halaman {page} / {totalPages === 0 ? 1 : totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-200 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs disabled:opacity-50 transition uppercase tracking-widest">Prev</button>
                <button disabled={page >= totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-200 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs disabled:opacity-50 transition uppercase tracking-widest">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedProperty && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[150] p-3 md:p-4">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h2 className="text-lg md:text-2xl font-black text-center uppercase text-gray-900">Review Listing</h2>
              <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-red-500 p-1.5 md:p-2 bg-white rounded-full shadow-sm hover:shadow transition"><FiX size={18} className="md:w-5 md:h-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 custom-scrollbar">
              <div className="flex-1 space-y-4 md:space-y-6">
                
                <div className="bg-gray-100 h-48 md:h-80 rounded-xl md:rounded-[1.5rem] overflow-hidden shadow-inner relative group">
                  <img src={selectedProperty.gallery && selectedProperty.gallery.length > 0 ? selectedProperty.gallery[currentImageIndex] : (selectedProperty.imageUrl || selectedProperty.image_url)} className="w-full h-full object-cover transition-all duration-500" alt="Properti" />
                  
                  {selectedProperty.gallery && selectedProperty.gallery.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 md:p-2 rounded-full opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all shadow-md">
                        <FiChevronLeft size={20} className="md:w-6 md:h-6" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 md:p-2 rounded-full opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all shadow-md">
                        <FiChevronRight size={20} className="md:w-6 md:h-6" />
                      </button>
                      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
                        {selectedProperty.gallery.map((_, idx) => (
                          <div key={idx} className={`h-1.5 md:h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3 md:w-4' : 'bg-white/50 w-1.5 md:w-2'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl md:text-3xl font-black uppercase text-gray-900 leading-tight">{selectedProperty.title}</h3>
                  <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1 md:mt-1.5">{selectedProperty.nama_kategori || selectedProperty.kategori || 'Properti'} • {selectedProperty.tipe}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase">Luas</p>
                    <p className="font-bold text-gray-800 text-xs md:text-base mt-0.5">{selectedProperty.luas || 0} m²</p>
                  </div>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase">K. Tidur</p>
                    <p className="font-bold text-gray-800 text-xs md:text-base mt-0.5">{selectedProperty.kamar_tidur || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase">K. Mandi</p>
                    <p className="font-bold text-gray-800 text-xs md:text-base mt-0.5">{selectedProperty.kamar_mandi || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Deskripsi</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{selectedProperty.deskripsi || 'Tidak ada deskripsi.'}</p>
                </div>

                <div>
                  <div>
                      <h4 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Fasilitas</h4>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {selectedProperty.fasilitas && selectedProperty.fasilitas.length > 0 ? (
                          selectedProperty.fasilitas.map((item, index) => (
                            <span 
                              key={index} 
                              className="px-2.5 md:px-3 py-1 bg-blue-50 text-blue-600 text-[8px] md:text-[10px] font-black rounded-full uppercase border border-blue-100"
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs md:text-sm font-medium text-gray-400">Tidak ada info fasilitas.</span>
                        )}
                      </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3 flex flex-col gap-4 md:gap-6 mt-4 lg:mt-0">
                <div className="bg-gray-50 rounded-xl md:rounded-[1.5rem] p-4 md:p-6 relative">
                  <h4 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2"><FiMapPin /> Lokasi</h4>
                  <p className="text-gray-800 font-bold text-xs md:text-sm leading-relaxed mb-3 md:mb-4">{selectedProperty.lokasi}</p>
                  
                  <div className="pt-3 md:pt-4 border-t border-gray-200 flex flex-col gap-1 text-[8px] md:text-[10px] font-black uppercase text-gray-500">
                    <span>Lat: {selectedProperty.latitude}</span>
                    <span>Lng: {selectedProperty.longitude}</span>
                  </div>

                  <a href={`https://www.google.com/maps?q=$${selectedProperty.latitude},${selectedProperty.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-4 md:mt-5 w-full flex items-center justify-center gap-1.5 md:gap-2 bg-blue-50 text-blue-600 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition">
                    <FiExternalLink size={12} className="md:w-3.5 md:h-3.5"/> Maps
                  </a>
                </div>

                <div className="flex-1 bg-gray-200 rounded-xl md:rounded-[1.5rem] overflow-hidden min-h-[200px] md:min-h-[250px] relative shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    className="absolute inset-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(selectedProperty.longitude)-0.005},${parseFloat(selectedProperty.latitude)-0.005},${parseFloat(selectedProperty.longitude)+0.005},${parseFloat(selectedProperty.latitude)+0.005}&layer=mapnik&marker=${selectedProperty.latitude},${selectedProperty.longitude}`}
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 flex-shrink-0">
              <div className="text-2xl md:text-3xl font-black text-gray-900 w-full sm:w-auto text-center sm:text-left">{formatRupiah(selectedProperty.harga)}</div>
              {selectedProperty.status === 'pending' && (
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                  <button onClick={() => handleUpdateStatus(selectedProperty.id, 'rejected')} className="flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 bg-red-50 text-red-600 rounded-lg md:rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-red-500 hover:text-white transition">Tolak</button>
                  <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 bg-green-500 text-white rounded-lg md:rounded-xl font-black shadow-lg uppercase text-[10px] md:text-xs tracking-widest hover:bg-green-600 transition">Terima</button>
                </div>
              )}
              {selectedProperty.status === 'rejected' && (
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                  <button onClick={() => handleUpdateStatus(selectedProperty.id, 'approved')} className="w-full sm:w-auto px-4 md:px-8 py-2.5 md:py-3 bg-green-500 text-white rounded-lg md:rounded-xl font-black shadow-lg uppercase text-[10px] md:text-xs tracking-widest hover:bg-green-600 transition">Terima Kembali</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
