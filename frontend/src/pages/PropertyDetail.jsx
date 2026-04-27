import React from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  MdLocationOn,
  MdWhatsapp,
  MdVerifiedUser,
  MdWifi,
  MdPool,
  MdAcUnit,
  MdLocalParking,
} from "react-icons/md";

import { FaBed, FaBath, FaRulerCombined } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import usePropertyDetail from "../hooks/usePropertyDetail";

const BlueIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = BlueIcon;

export default function PropertyDetail() {
  const { slug } = useParams();

  const {
    item,
    agen,
    loading,
    images,
    currentImage,
    setCurrentImage,
    position,
    handleHubungiAgen,
  } = usePropertyDetail(slug);

  if (loading)
    return <div className="text-center py-20 font-bold">Memuat Detail...</div>;

  if (!item)
    return (
      <div className="text-center py-20 font-bold text-red-500">
        Properti tidak ditemukan.
      </div>
    );

  const fotoAgen =
    agen?.foto_profil
      ? agen.foto_profil.startsWith("http")
        ? agen.foto_profil
        : `http://127.0.0.1:9000/propertikita/${agen.foto_profil}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          agen?.nama_agen || item.nama_agen || "Agen"
        )}`;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* KIRI */}
        <div className="lg:col-span-2">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 font-semibold hover:underline mb-6"
          >
            <FiArrowLeft className="mr-2" /> Kembali ke Beranda
          </Link>

          {/* CAROUSEL */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8 bg-gray-100 group">
            <img
              src={images[currentImage]}
              className="w-full h-[350px] md:h-[550px] object-cover"
              alt="property"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100"
                >
                  ‹
                </button>

                <button
                  onClick={() =>
                    setCurrentImage((prev) => (prev + 1) % images.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100"
                >
                  ›
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-2.5 rounded-full cursor-pointer ${
                        currentImage === i
                          ? "bg-blue-600 w-8"
                          : "bg-white/60 w-2.5"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-2">{item.title}</h1>

          <p className="flex items-center text-gray-500 mb-6">
            <MdLocationOn className="mr-2 text-red-500" />
            {item.lokasi}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center bg-gray-50 p-4 rounded-xl">
              <FaBed /> {item.kamar_tidur}
            </div>

            <div className="text-center bg-gray-50 p-4 rounded-xl">
              <FaBath /> {item.kamar_mandi}
            </div>

            <div className="text-center bg-gray-50 p-4 rounded-xl">
              <FaRulerCombined /> {item.luas} m²
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="font-bold mb-3">Tentang Properti Ini</h2>
            <p>{item.deskripsi || "Belum ada deskripsi"}</p>
          </div>

          {/* FASILITAS */}
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <h2 className="font-bold mb-4">Fasilitas</h2>

            {Array.isArray(item?.fasilitas) && item.fasilitas.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {item.fasilitas.map((nama, index) => {
                  const fasilitas = nama.trim().toLowerCase();

                  const iconMap = {
                    wifi: <MdWifi />,
                    ac: <MdAcUnit />,
                    parkir: <MdLocalParking />,
                    security: <MdVerifiedUser />,
                    "keamanan 24 jam": <MdVerifiedUser />,
                    "kolam renang": <MdPool />,
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl"
                    >
                      {iconMap[fasilitas] || <MdVerifiedUser />}
                      <span>{nama}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada fasilitas</p>
            )}
          </div>

          {/* MAP */}
          <MapContainer center={position} zoom={15} style={{ height: "400px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={position}>
              <Popup>
                <div className="w-52">
                  <img
                    src={images[0]}
                    className="w-full h-24 object-cover rounded mb-2"
                    alt="property"
                  />

                  <p className="font-bold mb-2">{item.title}</p>

                  <a
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold underline"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* KANAN */}
        <div>
          <div className="bg-white p-6 rounded-2xl shadow sticky top-28">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(item.harga)}
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={fotoAgen}
                className="w-12 h-12 rounded-full object-cover"
                alt="agen"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    agen?.nama_agen || item.nama_agen || "Agen"
                  )}`;
                }}
              />

              <div>
                <p className="font-bold">
                  {agen?.nama_agen || item.nama_agen}
                </p>

                <span className="text-green-600 text-xs flex items-center">
                  <MdVerifiedUser className="mr-1" />
                  Terverifikasi
                </span>
              </div>
            </div>

            <button
              onClick={handleHubungiAgen}
              className="block w-full text-center bg-green-500 text-white py-3 rounded-xl font-bold"
            >
              <MdWhatsapp className="inline mr-2" />
              Chat WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}