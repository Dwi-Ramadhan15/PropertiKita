import React from 'react';
import { FaMapMarkedAlt, FaUserShield, FaUserTie } from 'react-icons/fa';

export default function Tentang() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER STYLE - Disamakan dengan Halaman Agen */}
      <div className="bg-[#1E293B]  py-20 px-10 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Tentang PropertiKita
        </h1>
        <p className="text-blue-50 text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Solusi modern untuk menemukan hunian impian dengan teknologi peta interaktif yang akurat dan terpercaya.
        </p>
      </div>

      {/* KONTEN MISI */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 mb-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#1E293B] mb-6">Misi Kami</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              PropertiKita hadir untuk mempermudah masyarakat dalam mencari properti, baik untuk investasi (jual) maupun tempat tinggal sementara (sewa).
            </p>
            <p className="text-slate-600 leading-relaxed">
              Kami menggabungkan data real-time dengan antarmuka yang ramah pengguna, sehingga Anda bisa melihat lokasi persis properti langsung di atas peta sebelum melakukan kunjungan.
            </p>
          </div>
          <div className="flex-1 w-full">
             <div className="bg-slate-100 h-64 md:h-80 rounded-[2rem] flex items-center justify-center">
                {/* Placeholder untuk gambar gedung/kantor */}
                <FaMapMarkedAlt size={80} className="text-slate-300" />
             </div>
          </div>
        </div>

        {/* GRID FITUR UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fitur 1 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
              <FaMapMarkedAlt size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-3">Pencarian Presisi</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Cari unit berdasarkan titik koordinat yang tepat di Google Maps untuk akurasi lokasi maksimal.
            </p>
          </div>

          {/* Fitur 2 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
              <FaUserShield size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#475569] mb-3">Data Terverifikasi</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Setiap unit Jual dan Sewa sudah melewati proses verifikasi internal kami untuk menjamin keamanan.
            </p>
          </div>

          {/* Fitur 3 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
              <FaUserTie size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-3">Agen Profesional</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Terhubung langsung dengan agen properti berpengalaman yang siap mendampingi proses transaksi Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}