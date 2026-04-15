import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaBed, FaBath, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] !== 0) map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

export default function MapSearch() {
  const [properti, setProperti] = useState([]);
  const [filteredProperti, setFilteredProperti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState([-5.3971, 105.2668]);

  const MAX_PRICE = 5000000000;
  const [filterHarga, setFilterHarga] = useState(MAX_PRICE);
  const [filterKamar, setFilterKamar] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // MODIFIKASI: Menambahkan parameter limit agar mengambil semua data
        // Sesuaikan dengan backend kamu, biasanya menggunakan limit=all atau limit=9999
        const res = await axios.get('http://localhost:5000/api/properti?limit=100');
        
        const rawFeatures = res.data.data.features || [];
        
        const cleanData = rawFeatures.map(item => {
          const prop = item.properties;
          const geom = item.geometry;
          return {
            id: prop.id,
            title: prop.title,
            slug: prop.slug || prop.id,
            harga: Number(prop.harga) || 0,
            latitude: geom.coordinates[1] || 0,
            longitude: geom.coordinates[0] || 0,
            kamar_tidur: Number(prop.kamar_tidur || prop.kamarTidur) || 0,
            kamar_mandi: Number(prop.kamar_mandi || prop.kamarMandi) || 0,
            luas: Number(prop.luas) || 0,
            image_url: prop.imageUrl || "https://via.placeholder.com/400x300",
            lokasi: prop.lokasi
          };
        });
        setProperti(cleanData);
        setFilteredProperti(cleanData);
      } catch (err) {
        console.error("Gagal ambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const hasil = properti.filter(item => {
      const hargaMatch = filterHarga >= MAX_PRICE || item.harga <= filterHarga;
      const kamarMatch = filterKamar === 0 || item.kamar_tidur >= filterKamar;
      return hargaMatch && kamarMatch;
    });
    setFilteredProperti(hasil);
  }, [filterHarga, filterKamar, properti]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white font-sans">
      {/* Search & Filter Bar */}
      <div className="p-4 shadow-md z-[1001] flex flex-wrap gap-10 items-center px-10 border-b bg-white">
        <div className="flex flex-col min-w-[300px]">
          <label className="text-[10px] font-black text-gray-400 uppercase mb-1">
            Maks Harga: {filterHarga >= MAX_PRICE ? 'SEMUA' : `Rp ${filterHarga.toLocaleString('id-ID')}`}
          </label>
          <input 
            type="range" min="0" max={MAX_PRICE} step="10000000"
            value={filterHarga} onChange={(e) => setFilterHarga(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 uppercase mb-1">Minimal Kamar</label>
          <select 
            className="border-none bg-gray-100 rounded-lg p-2 text-sm font-bold outline-none ring-1 ring-gray-200"
            onChange={(e) => setFilterKamar(Number(e.target.value))}
          >
            <option value="0">Semua</option>
            <option value="1">1+ Kamar</option>
            <option value="2">2+ Kamar</option>
            <option value="3">3+ Kamar</option>
          </select>
        </div>

        <div className="ml-auto text-right">
            <span className="text-[10px] font-bold text-gray-400 block uppercase font-black">Total Properti</span>
            <span className="text-2xl font-black text-blue-600">{filteredProperti.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar List */}
        <div className="w-[450px] overflow-y-auto p-5 bg-gray-50/50 border-r">
          {loading ? (
            <div className="text-center py-10 font-bold text-gray-400">Mengunduh Data...</div>
          ) : filteredProperti.length === 0 ? (
            <div className="text-center py-10 font-bold text-gray-400">Tidak ada properti ditemukan.</div>
          ) : (
            filteredProperti.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setMapCenter([item.latitude, item.longitude]);
                }}
                className={`bg-white rounded-2xl shadow-sm border mb-5 overflow-hidden cursor-pointer transition-all hover:shadow-xl ${selectedId === item.id ? 'border-blue-600 ring-4 ring-blue-50' : 'border-transparent'}`}
              >
                <img src={item.image_url} className="w-full h-44 object-cover" alt="img" />
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-base truncate">{item.title}</h3>
                  <p className="text-blue-600 font-black text-xl mt-1">Rp {item.harga.toLocaleString('id-ID')}</p>
                  <p className="text-gray-400 text-[11px] mt-1 flex items-center gap-1 font-medium"><FaMapMarkerAlt/> {item.lokasi}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Area */}
        <div className="flex-1 h-full z-0">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap coords={mapCenter} />
            
            {filteredProperti.map((item) => (
              <Marker 
                key={item.id} 
                position={[item.latitude, item.longitude]}
                icon={selectedId === item.id ? selectedIcon : defaultIcon}
                eventHandlers={{
                  click: () => setSelectedId(item.id),
                }}
              >
                <Popup minWidth={200}>
                  <div className="font-sans">
                    <img src={item.image_url} alt="popup" className="w-full h-24 object-cover rounded-md mb-2" />
                    <p className="font-black text-blue-600 text-sm mb-0">Rp {item.harga.toLocaleString('id-ID')}</p>
                    <p className="font-bold text-gray-700 text-xs mb-2 truncate">{item.title}</p>
                    
                    <div className="flex gap-3 text-[10px] text-gray-500 mb-3 font-bold">
                       <span className="flex items-center gap-1"><FaBed/> {item.kamar_tidur}</span>
                       <span className="flex items-center gap-1"><FaBath/> {item.kamar_mandi}</span>
                    </div>

                    <Link 
                      to={`/properti/${item.slug}`}
                      className="bg-green-500 text-white text-[11px] font-bold py-2 px-3 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-green-600 transition-colors no-underline"
                    >
                      Lihat Detail <FaExternalLinkAlt size={10}/>
                    </Link>
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