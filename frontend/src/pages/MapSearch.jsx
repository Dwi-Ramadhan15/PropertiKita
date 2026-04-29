import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { FiFilter, FiSearch, FiHome, FiMapPin } from "react-icons/fi";

import "leaflet/dist/leaflet.css";
import useMapSearch from "../hooks/useMapSearch";

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const hoverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapController({ center }) {
  const map = useMap();

  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true });
    }
  }, [center, map]);

  return null;
}

export default function MapSearch() {
  const {
    loading,
    mapCenter,
    hoveredPropertyId,
    searchQuery,
    maxHarga,
    kamarTidur,
    filteredProperties,

    setSearchQuery,
    setMaxHarga,
    setKamarTidur,

    formatHarga,
    handleReset,
    handleHoverProperty,
    getGoogleMapsUrl,
  } = useMapSearch();

  const [selectedPropertyId, setSelectedPropertyId] = React.useState(null);

  const getId = (item) => String(item.properties.id);

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-[380px] flex flex-col border-r border-gray-200 bg-white shadow-sm z-20">
        {/* FILTER */}
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-5 text-slate-800">
            <FiFilter className="text-lg" />

            <h2 className="text-lg font-bold uppercase tracking-tight">
              Filter Properti
            </h2>

            <button
              onClick={handleReset}
              className="ml-auto text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Reset
            </button>
          </div>

          <div className="space-y-5">
            {/* SEARCH */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />

              <input
                type="text"
                placeholder="Cari lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* HARGA */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Maks Harga :
                <span className="text-[#C9925F] ml-1">
                  {formatHarga(maxHarga)}
                </span>
              </label>

              <input
                type="range"
                min="100000000"
                max="5000000000"
                step="100000000"
                value={maxHarga}
                onChange={(e) => setMaxHarga(parseInt(e.target.value))}
                className="w-full mt-2 accent-[#D9AB7B]"
              />
            </div>

            {/* KAMAR */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Kamar Tidur
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {["1", "2", "3+"].map((v) => (
                  <button
                    key={v}
                    onClick={() =>
                      setKamarTidur(kamarTidur === v ? null : v)
                    }
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      kamarTidur === v
                        ? "bg-[#C9925F] text-white border-blue-600"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    {v === "3+" ? "3+ KT" : `${v} KT`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PROPERTY LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              Loading...
            </div>
          ) : (
            filteredProperties.map((item) => {
              const id = getId(item);

              return (
                <div
                  key={id}
                  onMouseEnter={() => handleHoverProperty(item)}
                  onClick={() => setSelectedPropertyId(id)}
                  className="bg-white p-3 rounded-xl border border-gray-200 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.properties.imageUrl}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
                        {item.properties.title}
                      </h4>

                      <p className="text-[#C9925F] font-bold text-sm mt-1">
                        {formatHarga(item.properties.harga)}
                      </p>

                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <FiHome size={10} />
                        {item.properties.lokasi}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/properti/${item.properties.slug}`}
                    className="mt-3 block text-center bg-[#D9AB7B] hover:bg-[#c49a6e] text-[#1E293B] py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Detail Property
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1">
        <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapController center={mapCenter} />

          {filteredProperties.map((item) => {
            const id = getId(item);

            return (
              <Marker
                key={id}
                position={[
                  item.geometry.coordinates[1],
                  item.geometry.coordinates[0],
                ]}
                icon={
                  selectedPropertyId === id ||
                  hoveredPropertyId === id
                    ? hoverIcon
                    : defaultIcon
                }
                eventHandlers={{
                  click: () => setSelectedPropertyId(id),
                }}
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

                    <p className="text-blue-600 font-bold text-sm mb-2 mt-1">
                      {formatHarga(item.properties.harga)}
                    </p>

                    <a
                      href={getGoogleMapsUrl(item)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#D9AB7B] text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      <FiMapPin />
                      Lihat di GMaps
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}