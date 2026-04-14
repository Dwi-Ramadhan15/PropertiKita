import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MdLocationOn, MdWhatsapp, MdVerifiedUser, MdWifi, MdPool, MdAcUnit, MdLocalParking } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi'; 
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ 
  iconUrl: markerIcon, 
  shadowUrl: markerShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyDetail() {
  const { slug } = useParams(); 
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properti/${slug}`);
        setItem(res.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) return <div className="text-center py-20 font-bold">Memuat Detail...</div>;
  if (!item) return <div className="text-center py-20 font-bold text-red-500">Properti tidak ditemukan.</div>;

  const position = [parseFloat(item.latitude) || 0, parseFloat(item.longitude) || 0];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center text-blue-600 font-semibold hover:underline mb-6 transition-all">
            <FiArrowLeft className="mr-2" /> Kembali ke Beranda
          </Link>

          <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8">
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-[350px] md:h-[550px] object-cover" 
            />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{item.title}</h1>
          <p className="flex items-center text-gray-500 text-lg mb-8 italic">
            <MdLocationOn className="text-red-500 mr-2" size={24} /> {item.lokasi}
          </p>

          {/* DETAIL UTAMA (KAMAR, MANDI, LUAS) */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <FaBed className="text-2xl text-blue-600 mb-2" />
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Kamar</p>
              <p className="font-bold text-lg text-gray-800">{item.kamar_tidur || 0}</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <FaBath className="text-2xl text-blue-600 mb-2" />
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Mandi</p>
              <p className="font-bold text-lg text-gray-800">{item.kamar_mandi || 0}</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <FaRulerCombined className="text-2xl text-blue-600 mb-2" />
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Luas</p>
              <p className="font-bold text-lg text-gray-800">{item.luas || 0} m²</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-4">Tentang Properti Ini</h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
              {item.deskripsi || "Informasi deskripsi belum tersedia."}
            </p>
            
            {/* FASILITAS */}
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Fasilitas & Fitur</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
                {item.wifi && (
                  <div className="flex items-center gap-3 text-gray-700 font-semibold">
                    <MdWifi className="text-2xl text-green-500" /> <span className="text-sm">Wifi / Internet</span>
                  </div>
                )}
                {item.kolam_renang && (
                  <div className="flex items-center gap-3 text-gray-700 font-semibold">
                    <MdPool className="text-2xl text-blue-500" /> <span className="text-sm">Kolam Renang</span>
                  </div>
                )}
                {item.ac && (
                  <div className="flex items-center gap-3 text-gray-700 font-semibold">
                    <MdAcUnit className="text-2xl text-cyan-400" /> <span className="text-sm">Full AC</span>
                  </div>
                )}
                {item.keamanan_24jam && (
                  <div className="flex items-center gap-3 text-gray-700 font-semibold">
                    <MdVerifiedUser className="text-2xl text-red-500" /> <span className="text-sm">Security 24/7</span>
                  </div>
                )}
                {item.parkir && (
                  <div className="flex items-center gap-3 text-gray-700 font-semibold">
                    <MdLocalParking className="text-2xl text-gray-500" /> <span className="text-sm">Lahan Parkir</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PETA */}
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-[400px]">
              <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position}>
                  <Popup>{item.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (SIDEBAR) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50 sticky top-28">
            <p className="text-gray-400 font-bold text-sm uppercase mb-2 tracking-widest">Harga Penawaran</p>
            <h2 className="text-3xl font-black mb-8 text-blue-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga)}
            </h2>
            
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <img 
                  src={item.foto_profil || `https://ui-avatars.com/api/?name=${item.nama_agen || 'Agen'}&background=random`} 
                  alt="Agen" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100" 
                />
                <div>
                  <h4 className="font-bold text-xl text-gray-800 leading-tight">{item.nama_agen || "Agen Properti"}</h4>
                  <span className="text-green-600 text-xs font-bold flex items-center mt-1">
                    <MdVerifiedUser className="mr-1" /> Terverifikasi
                  </span>
                </div>
              </div>
              
              <a 
                href={`https://wa.me/${item.no_wa || '6283180228231'}?text=Halo, saya tertarik dengan properti: ${item.title}`}
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-lg hover:shadow-xl transition-all active:scale-95"
              >
                <MdWhatsapp size={28} /> Chat WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}