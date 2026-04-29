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
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
    return (
      <div className="min-h-screen flex items-center justify-center text-[#1E293B] font-semibold text-lg">
        Memuat Detail Properti...
      </div>
    );

  if (!item)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold text-lg">
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

  const fasilitasIcon = {
    wifi: <MdWifi />,
    ac: <MdAcUnit />,
    parkir: <MdLocalParking />,
    security: <MdVerifiedUser />,
    "keamanan 24 jam": <MdVerifiedUser />,
    "kolam renang": <MdPool />,
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-14">
      {/* HERO */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
        <Link
          to="/"
          className="inline-flex items-center text-[#1E293B] hover:text-[#D9AB7B] transition mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Kembali ke Beranda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2">
            {/* IMAGE */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white">
              <img
                src={images[currentImage]}
                alt="property"
                className="w-full h-[320px] md:h-[520px] object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-105 transition"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentImage((prev) => (prev + 1) % images.length)
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-105 transition"
                  >
                    <FiChevronRight />
                  </button>

                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`h-2 rounded-full transition-all ${
                          currentImage === i
                            ? "w-8 bg-white"
                            : "w-2 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CONTENT */}
            <div className="mt-8 bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] leading-tight">
                {item.title}
              </h1>

              <p className="flex items-center text-gray-500 mt-3">
                <MdLocationOn className="mr-2 text-[#D9AB7B]" />
                {item.lokasi}
              </p>

              {/* INFO */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="rounded-2xl bg-[#F8F8F8] p-5 text-center">
                  <FaBed className="mx-auto text-[#D9AB7B] text-xl mb-2" />
                  <p className="font-bold text-[#1E293B]">
                    {item.kamar_tidur}
                  </p>
                  <span className="text-xs text-gray-500">Kamar</span>
                </div>

                <div className="rounded-2xl bg-[#F8F8F8] p-5 text-center">
                  <FaBath className="mx-auto text-[#D9AB7B] text-xl mb-2" />
                  <p className="font-bold text-[#1E293B]">
                    {item.kamar_mandi}
                  </p>
                  <span className="text-xs text-gray-500">Kamar Mandi</span>
                </div>

                <div className="rounded-2xl bg-[#F8F8F8] p-5 text-center">
                  <FaRulerCombined className="mx-auto text-[#D9AB7B] text-xl mb-2" />
                  <p className="font-bold text-[#1E293B]">
                    {item.luas} m²
                  </p>
                  <span className="text-xs text-gray-500">Luas</span>
                </div>
              </div>

              {/* DESC */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[#1E293B] mb-3">
                  Tentang Properti
                </h2>
                <p className="text-gray-600 leading-8">
                  {item.deskripsi || "Belum ada deskripsi."}
                </p>
              </div>

              {/* FACILITY */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[#1E293B] mb-4">
                  Fasilitas
                </h2>

                {Array.isArray(item?.fasilitas) &&
                item.fasilitas.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.fasilitas.map((nama, index) => {
                      const key = nama.trim().toLowerCase();

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-[#F8F8F8] px-4 py-3 rounded-2xl"
                        >
                          <span className="text-[#D9AB7B] text-xl">
                            {fasilitasIcon[key] || <MdVerifiedUser />}
                          </span>
                          <span className="text-sm font-medium text-[#1E293B]">
                            {nama}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada fasilitas.</p>
                )}
              </div>
            </div>

            {/* MAP */}
            <div className="mt-8 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <MapContainer
                center={position}
                zoom={15}
                style={{ height: "380px" }}
              >
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
                        className="text-[#D9AB7B] font-semibold underline"
                      >
                        Buka di Google Maps
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="sticky top-24 bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-400 mb-2">
                Harga Properti
              </p>

              <h2 className="text-3xl font-bold text-[#1E293B] leading-tight">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(item.harga)}
              </h2>

              {/* AGENT */}
              <div className="mt-7 flex items-center gap-4 p-4 rounded-2xl bg-[#F8F8F8]">
                <img
                  src={fotoAgen}
                  alt="agen"
                  className="w-14 h-14 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      agen?.nama_agen || item.nama_agen || "Agen"
                    )}`;
                  }}
                />

                <div>
                  <p className="font-bold text-[#1E293B]">
                    {agen?.nama_agen || item.nama_agen}
                  </p>

                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <MdVerifiedUser className="mr-1" />
                    Agen Terverifikasi
                  </span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleHubungiAgen}
                className="mt-7 w-full bg-[#D9AB7B] text-[#1E293B] py-3.5 rounded-2xl font-bold hover:bg-[#c49a6e] transition shadow-md"
              >
                <MdWhatsapp className="inline mr-2 text-lg" />
                Chat WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}