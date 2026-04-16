import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiHome } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const hoverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { animate: true });
        }
    }, [center, map]);
    return null;
}

export default function MapSearch() {
    const [allProperties, setAllProperties] = useState([]); // Simpan semua data asli
    const [filteredProperties, setFilteredProperties] = useState([]); // Data hasil filter
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([-5.397140, 105.266800]);
    const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

    // --- STATE UNTUK FILTER ---
    const [searchQuery, setSearchQuery] = useState('');
    const [maxHarga, setMaxHarga] = useState(2000000000); // Default 2 Milyar
    const [kamarTidur, setKamarTidur] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/properti?limit=100');
                if (res.data.success) {
                    const data = res.data.data.features || [];
                    setAllProperties(data);
                    setFilteredProperties(data); // Inisialisasi awal
                }
            } catch (error) {
                console.error("Error fetch map data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // --- LOGIKA FILTERING ---
    useEffect(() => {
        let result = allProperties;

        // 1. Filter Berdasarkan Nama/Lokasi
        if (searchQuery) {
            result = result.filter(item => 
                item.properties.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.properties.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter Berdasarkan Harga
        result = result.filter(item => item.properties.harga <= maxHarga);

        // 3. Filter Berdasarkan Kamar Tidur
        if (kamarTidur) {
            result = result.filter(item => {
                if (kamarTidur === '3+') return item.properties.kamar_tidur >= 3;
                return item.properties.kamar_tidur === parseInt(kamarTidur);
            });
        }

        setFilteredProperties(result);
    }, [searchQuery, maxHarga, kamarTidur, allProperties]);

    const formatHarga = (harga) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(harga);
    };

    const handleReset = () => {
        setSearchQuery('');
        setMaxHarga(2000000000);
        setKamarTidur(null);
    };

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-white">
            {/* --- SIDEBAR KIRI (FILTER & LIST) --- */}
            <div className="w-[400px] flex flex-col border-r border-gray-200 bg-[#F9FBFF] z-20">
                
                <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2 mb-6 text-[#1E293B]">
                        <FiFilter className="text-xl" />
                        <h2 className="text-xl font-bold italic uppercase tracking-tighter">Filter</h2>
                        <button 
                            onClick={handleReset}
                            className="ml-auto text-xs text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Search Input */}
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Cari lokasi (contoh: sukarame)..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Harga Slider */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                                MAKS HARGA: <span className="text-blue-600">{formatHarga(maxHarga)}</span>
                            </label>
                            <input 
                                type="range" 
                                min="100000000" 
                                max="5000000000" 
                                step="100000000"
                                value={maxHarga}
                                onChange={(e) => setMaxHarga(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase italic">
                                <span>100 JT</span>
                                <span>5 MILYAR</span>
                            </div>
                        </div>

                        {/* Kamar Tidur Buttons */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Kamar Tidur</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['1', '2', '3+'].map((v) => (
                                    <button 
                                        key={v} 
                                        onClick={() => setKamarTidur(kamarTidur === v ? null : v)}
                                        className={`py-2 text-[10px] font-bold border rounded-md transition-all uppercase italic
                                            ${kamarTidur === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {v === '3+' ? '3+ KT' : `${v} KT`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Hasil Pencarian */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Hasil Pencarian</span>
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                            {filteredProperties.length} Properti
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400 animate-pulse font-bold italic">Memuat data...</div>
                    ) : filteredProperties.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-medium italic">Tidak ada properti yang cocok.</div>
                    ) : (
                        filteredProperties.map((item) => (
                            <div 
                                key={item.properties.id} 
                                className={`flex gap-3 bg-white p-2 rounded-xl border transition-all duration-300 cursor-pointer 
                                    ${hoveredPropertyId === item.properties.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-100 hover:shadow-sm'}`}
                                onMouseEnter={() => {
                                    setHoveredPropertyId(item.properties.id);
                                    setMapCenter([item.geometry.coordinates[1], item.geometry.coordinates[0]]);
                                }}
                                onMouseLeave={() => setHoveredPropertyId(null)}
                            >
                                <img src={item.properties.imageUrl || '/path/to/no-image.jpg'} alt="prop" className="w-20 h-20 object-cover rounded-lg shrink-0 shadow-sm" />
                                <div className="flex flex-col justify-center min-w-0">
                                    <h4 className="text-[13px] font-bold text-gray-800 truncate leading-tight mb-1">{item.properties.title}</h4>
                                    <p className="text-[14px] font-black text-blue-600 mb-1">{formatHarga(item.properties.harga)}</p>
                                    <p className="text-[10px] text-gray-400 truncate flex items-center gap-1 italic">
                                        <FiHome size={10} /> {item.properties.lokasi}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- PANEL KANAN (MAP) --- */}
            <div className="flex-1 relative z-10">
                <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapController center={mapCenter} />
                    {filteredProperties.map((item) => (
                        <Marker 
                            key={item.properties.id} 
                            position={[item.geometry.coordinates[1], item.geometry.coordinates[0]]}
                            icon={hoveredPropertyId === item.properties.id ? hoverIcon : defaultIcon}
                            eventHandlers={{
                                mouseover: () => setHoveredPropertyId(item.properties.id),
                                mouseout: () => setHoveredPropertyId(null),
                            }}
                        >
                            <Popup minWidth={220}>
                                <div className="flex flex-col gap-2 p-1">
                                    <img src={item.properties.imageUrl} className="w-full h-24 object-cover rounded-lg" alt="pop" />
                                    <div>
                                        <div className="font-black text-blue-600 text-base leading-none mb-1">{formatHarga(item.properties.harga)}</div>
                                        <div className="text-xs font-bold text-gray-800 line-clamp-1 italic uppercase tracking-tighter">{item.properties.title}</div>
                                    </div>
                                    <Link 
                                        to={`/properti/${item.properties.slug}`}
                                        className="bg-[#D9AB7B] text-[#1E293B] text-center py-2 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-[#c49a6e] transition-all"
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}