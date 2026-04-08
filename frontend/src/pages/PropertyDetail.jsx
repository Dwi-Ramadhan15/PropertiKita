import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MdLocationOn, MdWhatsapp } from 'react-icons/md';
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
  const { id } = useParams(); 
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properti/${id}`);
        setItem(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading detail:", error);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="text-center py-20 font-bold">Memuat Detail...</div>;
  if (!item) return <div className="text-center py-20 font-bold">Properti tidak ditemukan.</div>;

  const position = [parseFloat(item.latitude), parseFloat(item.longitude)];

  return (
    <div className="max-w-7xl mx-auto px-10 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KOLOM KIRI: Gambar & Deskripsi */}
        <div className="lg:col-span-2">
          
          <Link to="/" className="inline-flex items-center text-primary font-semibold hover:text-blue-800 transition mb-6">
            <FiArrowLeft className="mr-2 text-xl" /> 
            Kembali ke Beranda
          </Link>

          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-[500px] object-cover rounded-2xl shadow-lg mb-8"
          />
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
          <p className="flex items-center text-gray-500 text-lg mb-6">
            <MdLocationOn className="text-primary mr-2" /> {item.lokasi}
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold mb-4">Deskripsi Properti</h2>
            <p className="text-gray-600 leading-relaxed italic">
              "Hunian eksklusif dengan desain modern di lokasi strategis. Cocok untuk keluarga muda yang menginginkan kenyamanan dan aksesibilitas tinggi."
            </p>
            
            <div className="flex gap-8 mt-8">
                {/* Kamar Tidur */}
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl w-24">
                    <FaBed className="text-2xl text-primary mb-2" />
                    <span className="font-bold">{item.kamar_tidur || item.kamarTidur || 0}</span>
                </div>
                {/* Kamar Mandi */}
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl w-24">
                    <FaBath className="text-2xl text-primary mb-2" />
                    <span className="font-bold">{item.kamar_mandi || item.kamarMandi || 0}</span>
                </div>
                {/* Luas Bangunan/Tanah */}
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl w-24">
                    <FaRulerCombined className="text-2xl text-primary mb-2" />
                    <span className="font-bold">{item.luas || 0}m²</span>
                </div>
            </div>
          </div>

          {/* MAPS INTEGRATION */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-4">Lokasi di Peta</h2>
            <div className="h-[400px] rounded-xl overflow-hidden border">
              <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position}>
                  <Popup>{item.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Harga & Agen */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-28">
            <p className="text-gray-500 font-medium mb-1">Harga Penawaran</p>
            <h2 className="text-3xl font-black text-primary mb-6">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga)}
            </h2>
            
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <img src={item.foto_profil || "https://ui-avatars.com/api/?name=Agen+Properti"} alt="Profil Agen" className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-lg">{item.nama_agen || "Agen Terpercaya"}</h4>
                  <p className="text-gray-500 text-sm">Spesialis {item.lokasi}</p>
                </div>
              </div>
              
              {/* TOMBOL WHATSAPP MANUAL/HARDCODE */}
              <a 
                href="https://wa.me/6283180228231" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-md"
              >
                <MdWhatsapp size={24} /> Hubungi Agen via WA
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}