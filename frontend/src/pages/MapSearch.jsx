<<<<<<< HEAD

import React from "react";
import {MapContainer, TileLayer, Marker, Popup, useMap,} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import {FiFilter, FiSearch, FiHome, FiMapPin,} from "react-icons/fi";

import "leaflet/dist/leaflet.css";
import useMapSearch from "../hooks/useMapSearch";

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
=======
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiHome } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import useMapSearch from '../hooks/useMapSearch';

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
>>>>>>> ayu
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const hoverIcon = new L.Icon({
<<<<<<< HEAD
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
=======
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
>>>>>>> ayu
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapController({ center }) {
  const map = useMap();
<<<<<<< HEAD

  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        animate: true,
      });
    }
  }, [center, map]);

=======
  React.useEffect(() => {
    if (center) map.flyTo(center, 13, { animate: true });
  }, [center, map]);
>>>>>>> ayu
  return null;
}

export default function MapSearch() {
<<<<<<< HEAD
=======

>>>>>>> ayu
  const {
    loading,
    mapCenter,
    hoveredPropertyId,
    searchQuery,
    maxHarga,
    kamarTidur,
    filteredProperties,
<<<<<<< HEAD

    setSearchQuery,
    setMaxHarga,
    setKamarTidur,

    formatHarga,
    handleReset,
    handleHoverProperty,
    handleLeaveProperty,
    getGoogleMapsUrl,
=======
    setMapCenter,
    setHoveredPropertyId,
    setSearchQuery,
    setMaxHarga,
    setKamarTidur,
    formatHarga,
    handleReset
>>>>>>> ayu
  } = useMapSearch();

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-white">
<<<<<<< HEAD
      
      {/* SIDEBAR */}
      <div className="w-[400px] flex flex-col border-r border-gray-200 bg-[#F9FBFF] z-20">
        
=======

      {/* SIDEBAR */}
      <div className="w-[400px] flex flex-col border-r border-gray-200 bg-[#F9FBFF] z-20">

>>>>>>> ayu
        {/* FILTER */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-6 text-[#1E293B]">
            <FiFilter className="text-xl" />
<<<<<<< HEAD

            <h2 className="text-xl font-bold italic uppercase tracking-tighter">
              Filter
            </h2>

            <button
              onClick={handleReset}
              className="ml-auto text-xs text-gray-400 hover:text-blue-600"
            >
=======
            <h2 className="text-xl font-bold italic uppercase tracking-tighter">Filter</h2>
            <button onClick={handleReset} className="ml-auto text-xs text-gray-400 hover:text-blue-600">
>>>>>>> ayu
              Reset
            </button>
          </div>

          <div className="space-y-6">
<<<<<<< HEAD
            
            {/* SEARCH */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />

=======

            {/* SEARCH */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
>>>>>>> ayu
              <input
                type="text"
                placeholder="Cari lokasi..."
                value={searchQuery}
<<<<<<< HEAD
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
=======
                onChange={(e) => setSearchQuery(e.target.value)}
>>>>>>> ayu
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            {/* HARGA */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
<<<<<<< HEAD
                MAKS HARGA:{" "}
                <span className="text-blue-600">
                  {formatHarga(maxHarga)}
                </span>
=======
                MAKS HARGA: <span className="text-blue-600">{formatHarga(maxHarga)}</span>
>>>>>>> ayu
              </label>

              <input
                type="range"
                min="100000000"
                max="5000000000"
                step="100000000"
                value={maxHarga}
<<<<<<< HEAD
                onChange={(e) =>
                  setMaxHarga(parseInt(e.target.value))
                }
=======
                onChange={(e) => setMaxHarga(parseInt(e.target.value))}
>>>>>>> ayu
                className="w-full mt-2"
              />
            </div>

            {/* KAMAR */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Kamar Tidur
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">
<<<<<<< HEAD
                {["1", "2", "3+"].map((v) => (
                  <button
                    key={v}
                    onClick={() =>
                      setKamarTidur(
                        kamarTidur === v ? null : v
                      )
                    }
                    className={`py-2 text-xs font-bold border rounded-md
                    ${
                      kamarTidur === v
                        ? "bg-blue-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {v === "3+" ? "3+ KT" : `${v} KT`}
=======
                {['1', '2', '3+'].map(v => (
                  <button
                    key={v}
                    onClick={() => setKamarTidur(kamarTidur === v ? null : v)}
                    className={`py-2 text-xs font-bold border rounded-md
                      ${kamarTidur === v ? 'bg-blue-600 text-white' : 'bg-white'}`}
                  >
                    {v === '3+' ? '3+ KT' : `${v} KT`}
>>>>>>> ayu
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

<<<<<<< HEAD
        {/* LIST PROPERTY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              Loading...
            </div>
          ) : (
            filteredProperties.map((item) => (
              <div
                key={item.properties.id}
                onMouseEnter={() =>
                  handleHoverProperty(item)
                }
                onMouseLeave={handleLeaveProperty}
                className="bg-white p-3 rounded-xl border hover:shadow transition"
              >
                <div className="flex gap-3">
                  <img
                    src={item.properties.imageUrl}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h4 className="text-sm font-bold line-clamp-2">
                      {item.properties.title}
                    </h4>

                    <p className="text-blue-600 font-bold text-sm mt-1">
                      {formatHarga(
                        item.properties.harga
                      )}
                    </p>

                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <FiHome size={10} />
                      {item.properties.lokasi}
                    </p>
                  </div>
                </div>

                {/* BUTTON DETAIL */}
                <Link
                  to={`/properti/${item.properties.slug}`}
                  className="mt-3 block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
                >
                  Detail Property
                </Link>
=======
        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            filteredProperties.map(item => (
              <div
                key={item.properties.id}
                onMouseEnter={() => {
                  setHoveredPropertyId(item.properties.id);
                  setMapCenter([item.geometry.coordinates[1], item.geometry.coordinates[0]]);
                }}
                onMouseLeave={() => setHoveredPropertyId(null)}
                className="flex gap-3 bg-white p-2 rounded-xl border hover:shadow"
              >
                <img
                  src={item.properties.imageUrl}
                  className="w-20 h-20 object-cover rounded"
                />

                <div>
                  <h4 className="text-sm font-bold">{item.properties.title}</h4>
                  <p className="text-blue-600 font-bold">{formatHarga(item.properties.harga)}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <FiHome size={10} /> {item.properties.lokasi}
                  </p>
                </div>
>>>>>>> ayu
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1">
<<<<<<< HEAD
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapController center={mapCenter} />

          {filteredProperties.map((item) => (
            <Marker
              key={item.properties.id}
              position={[
                item.geometry.coordinates[1],
                item.geometry.coordinates[0],
              ]}
              icon={
                hoveredPropertyId ===
                item.properties.id
                  ? hoverIcon
                  : defaultIcon
              }
            >
              <Popup>
                <div className="w-52">
                  <img
                    src={item.properties.imageUrl}
                    className="w-full h-24 object-cover rounded mb-2"
                  />

                  <p className="font-bold text-sm line-clamp-2">
                    {item.properties.title}
                  </p>

                  <p className="text-blue-600 font-bold text-sm mb-2">
                    {formatHarga(
                      item.properties.harga
                    )}
                  </p>

                  <a
                    href={getGoogleMapsUrl(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold"
                  >
                    <FiMapPin />
                    Lihat di GMaps
                  </a>
                </div>
=======
        <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController center={mapCenter} />

          {filteredProperties.map(item => (
            <Marker
              key={item.properties.id}
              position={[item.geometry.coordinates[1], item.geometry.coordinates[0]]}
              icon={hoveredPropertyId === item.properties.id ? hoverIcon : defaultIcon}
            >
              <Popup>
                <img src={item.properties.imageUrl} className="w-full h-24 object-cover mb-2" />
                <b>{formatHarga(item.properties.harga)}</b>
                <p>{item.properties.title}</p>
                <Link to={`/properti/${item.properties.slug}`}>
                  Lihat Detail
                </Link>
>>>>>>> ayu
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
<<<<<<< HEAD
=======

>>>>>>> ayu
    </div>
  );
}