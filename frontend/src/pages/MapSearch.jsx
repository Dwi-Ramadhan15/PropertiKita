import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Wajib import CSS

// --- DEFINISI ICON (Pastikan path-nya benar!) ---
const defaultIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const hoverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', // ICON MERAH
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


// --- KOMPONEN PEMBANTU UNTUK UPDATE POSISI PETA ---
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { animate: true }); // Efek terbang ke lokasi
        }
    }, [center, map]);
    return null;
}

export default function MapSearch() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([-5.397140, 105.266800]); // Default: Lampung

    // --- KUNCI FITUR HOVER 1: State untuk menyimpan ID yang sedang di-hover ---
    const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

    // Ambil data dari API
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/properti?limit=100');
                if (res.data.success) {
                    setProperties(res.data.data.features || []);
                }
            } catch (error) {
                console.error("Gagal ambil data map:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const formatHarga = (harga) => {
        return `Rp ${harga.toLocaleString('id-ID')}`;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
          {/* FILTER AREA (Header seperti di gambar kamu) */}
          <div className="bg-white p-4 shadow-sm border-b sticky top-[65px] z-30">
            <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-6">
                <div className="flex-1 flex items-center gap-4">
                    <div className="w-1/2">
                      <label className="text-xs text-gray-400 font-medium">MAKS HARGA: SEMUA</label>
                      <input type="range" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-medium">MINIMAL KAMAR</label>
                      <select className="border rounded-md px-3 py-1 text-sm bg-white">
                          <option>Semua</option>
                      </select>
                    </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-medium">TOTAL PROPERTI</div>
                  <div className="text-4xl font-bold text-blue-700">{properties.length}</div>
                </div>
            </div>
          </div>

          {/* MAIN MAP AREA */}
          <div className="flex h-[calc(100vh-130px)]">
            {/* SIDEBAR DAFTAR PROPERTI (Kiri) */}
            <div className="w-[420px] bg-white border-r overflow-y-auto p-6 space-y-6">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Memuat data...</div>
                ) : (
                    properties.map((item) => (
                        // --- KUNCI FITUR HOVER 2: Pasang Event Listener di Card ---
                        <div 
                          key={item.properties.id} 
                          className={`bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-300 transform 
                            ${hoveredPropertyId === item.properties.id ? 'border-blue-400 shadow-xl -translate-y-1' : 'border-gray-100'}`}
                          onMouseEnter={() => {
                              // Set state saat mouse masuk
                              setHoveredPropertyId(item.properties.id);
                              // Opsional: Pindahkan peta ke marker yang di-hover
                              setMapCenter([item.geometry.coordinates[1], item.geometry.coordinates[0]]);
                          }}
                          onMouseLeave={() => {
                              // Reset state saat mouse keluar
                              setHoveredPropertyId(null);
                          }}
                        >
                            <img src={item.properties.imageUrl || '/path/to/no-image.jpg'} alt="prop" className="w-full h-48 object-cover" />
                            <div className="p-4 space-y-1">
                                <h4 className="font-bold text-gray-800 line-clamp-1">{item.properties.title}</h4>
                                <p className="text-lg font-extrabold text-blue-600">{formatHarga(item.properties.harga)}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1">
                                  <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/></svg>
                                  {item.properties.lokasi}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* LEAFLET MAP (Kanan) */}
            <div className="flex-1 relative z-10">
                <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Mengontrol posisi peta */}
                    <MapController center={mapCenter} />

                    {/* MAPPING MARKER DARI DATA GEOM */}
                    {properties.map((item) => (
                        <Marker 
                          key={item.properties.id} 
                          position={[item.geometry.coordinates[1], item.geometry.coordinates[0]]} // [Lat, Long]
                          
                          // --- KUNCI FITUR HOVER 3: Ganti Icon Berdasarkan State ---
                          icon={hoveredPropertyId === item.properties.id ? hoverIcon : defaultIcon}
                          
                          // Sinkronisasi Terbalik (Marker -> Card): 
                          // Kalau marker di-hover, card di kiri juga ikut ter-highlight
                          eventHandlers={{
                            mouseover: () => setHoveredPropertyId(item.properties.id),
                            mouseout: () => setHoveredPropertyId(null),
                          }}
                        >
                            <Popup>
                                <div className="text-center p-1">
                                  <img src={item.properties.imageUrl} className="w-20 h-15 object-cover rounded mx-auto mb-1"/>
                                  <div className="font-bold text-sm text-blue-700">{formatHarga(item.properties.harga)}</div>
                                  <div className="text-xs text-gray-600 line-clamp-1">{item.properties.title}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
          </div>
        </div>
    );
}