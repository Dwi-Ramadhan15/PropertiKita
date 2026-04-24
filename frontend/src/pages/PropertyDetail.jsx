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

const BlueIcon = L.icon({ 
  iconUrl: markerIcon, 
  shadowUrl: markerShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = BlueIcon;

export default function PropertyDetail() {
  const { slug } = useParams(); 

  const [item, setItem] = useState(null);
  const [agen, setAgen] = useState(null); // 🔥 tambahan
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  // 🔥 FORMAT NOMOR WA
  const formatWA = (no) => {
    if (!no) return '6280000000000';
    let cleaned = no.replace(/\D/g, '');
    if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  // FETCH PROPERTI
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properti/${slug}`);
        setItem(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  // 🔥 FETCH AGEN
  useEffect(() => {
    if (!item?.agen_id) return;

    const fetchAgen = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/agen');
        const found = res.data.data.find(a => a.id === item.agen_id);
        setAgen(found);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAgen();
  }, [item]);

  // HANDLE GAMBAR
  const images = item?.images?.length
    ? item.images
    : item?.gallery?.length
      ? item.gallery
      : item?.image_url
        ? [item.image_url]
        : [];

  // AUTO SLIDE
  useEffect(() => {
    if (images.length < 2) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (loading) return <div className="text-center py-20 font-bold">Memuat Detail...</div>;
  if (!item) return <div className="text-center py-20 font-bold text-red-500">Properti tidak ditemukan.</div>;

  const position = [parseFloat(item.latitude) || 0, parseFloat(item.longitude) || 0];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KIRI */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center text-blue-600 font-semibold hover:underline mb-6">
            <FiArrowLeft className="mr-2" /> Kembali ke Beranda
          </Link>

          {/* CAROUSEL */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8 bg-gray-100 group">
            <img 
              src={images[currentImage]} 
              className="w-full h-[350px] md:h-[550px] object-cover"
            />

            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100"
                >‹</button>

                <button 
                  onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100"
                >›</button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <div key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-2.5 rounded-full cursor-pointer ${
                        currentImage === i ? 'bg-blue-600 w-8' : 'bg-white/60 w-2.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-2">{item.title}</h1>
          <p className="flex items-center text-gray-500 mb-6">
            <MdLocationOn className="mr-2 text-red-500"/> {item.lokasi}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center bg-gray-50 p-4 rounded-xl"><FaBed/> {item.kamar_tidur}</div>
            <div className="text-center bg-gray-50 p-4 rounded-xl"><FaBath/> {item.kamar_mandi}</div>
            <div className="text-center bg-gray-50 p-4 rounded-xl"><FaRulerCombined/> {item.luas} m²</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="font-bold mb-3">Tentang Properti Ini</h2>
            <p>{item.deskripsi || "Belum ada deskripsi"}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="font-bold mb-4">Fasilitas</h2>
            <div className="grid grid-cols-2 gap-4">
              {item.wifi && <div className="flex items-center gap-2"><MdWifi/> Wifi</div>}
              {item.kolam_renang && <div className="flex items-center gap-2"><MdPool/> Kolam Renang</div>}
              {item.ac && <div className="flex items-center gap-2"><MdAcUnit/> AC</div>}
              {item.keamanan_24jam && <div className="flex items-center gap-2"><MdVerifiedUser/> Security</div>}
              {item.parkir && <div className="flex items-center gap-2"><MdLocalParking/> Parkir</div>}
            </div>
          </div>

          <MapContainer center={position} zoom={15} style={{ height: '400px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup>
                <img src={images[0]} className="w-full h-24 object-cover"/>
                {item.title}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div>

          <div className="bg-white p-6 rounded-2xl shadow sticky top-28">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.harga)}
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <img 
                src={
                  item.foto_profil 
                    ? `http://localhost:5000/uploads/${item.foto_profil}` 
                    : `https://ui-avatars.com/api/?name=${item.nama_agen}`
                } 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-bold">{item.nama_agen}</p>
                <span className="text-green-600 text-xs flex items-center">
                  <MdVerifiedUser className="mr-1"/> Terverifikasi
                </span>
              </div>
            </div>

            <a 
              href={`https://wa.me/${item.no_whatsapp?.replace(/^0/, '62')}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-green-500 text-white py-3 rounded-xl font-bold"
            >
              <MdWhatsapp className="inline mr-2"/> Chat WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}