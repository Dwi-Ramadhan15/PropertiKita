import React from 'react';
import { BsBuildingsFill, BsShieldCheck, BsMap, BsPeople } from 'react-icons/bs';

export default function Tentang() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary py-20 px-10 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Tentang PropertiKita</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Solusi modern untuk menemukan hunian impian dengan teknologi peta interaktif yang akurat dan terpercaya.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto py-16 px-10">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Misi Kami</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              PropertiKita hadir untuk mempermudah masyarakat dalam mencari properti, baik untuk investasi (jual) maupun tempat tinggal sementara (sewa). 
            </p>
            <p className="text-gray-600 leading-relaxed">
              Kami menggabungkan data real-time dengan antarmuka yang ramah pengguna, sehingga Anda bisa melihat lokasi persis properti langsung di atas peta sebelum melakukan kunjungan.
            </p>
          </div>
          <div className="bg-blue-50 p-10 rounded-3xl flex justify-center">
             <BsBuildingsFill className="text-[150px] text-primary opacity-20" />
          </div>
        </div>

        {/* Keunggulan Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
            <BsMap className="text-4xl text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Pencarian Presisi</h3>
            <p className="text-gray-500 text-sm">Cari unit berdasarkan titik koordinat yang tepat di Google Maps.</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
            <BsShieldCheck className="text-4xl text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Data Terverifikasi</h3>
            <p className="text-gray-500 text-sm">Setiap unit Jual dan Sewa sudah melewati proses verifikasi internal kami.</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
            <BsPeople className="text-4xl text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Agen Profesional</h3>
            <p className="text-gray-500 text-sm">Terhubung langsung dengan agen properti berpengalaman di bidangnya.</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 py-10 text-center border-t border-gray-100">
        <p className="text-gray-500 font-medium">© 2026 PropertiKita - Menemukan Rumah Jadi Lebih Mudah.</p>
      </div>
    </div>
  );
}