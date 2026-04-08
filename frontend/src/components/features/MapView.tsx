import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../../types/property';

// Fix icon leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icon merah untuk marker yang dipilih
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Icon biru default
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Komponen flyTo saat selectedProp berubah
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1.2 });
  }, [center, map]);
  return null;
};

// Fix blank map
const FixMapSize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

interface MapViewProps {
  properties: Property[];
  selectedProp: Property | null;
  onMarkerClick: (prop: Property) => void;
}

const MapView: React.FC<MapViewProps> = ({ properties, selectedProp, onMarkerClick }) => {
  return (
    <MapContainer
      center={[-6.250, 106.700]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FixMapSize />

      {selectedProp && (
        <MapController center={[selectedProp.lat, selectedProp.lng]} />
      )}

      {properties.map((item) => (
        <Marker
          key={item.id}
          position={[item.lat, item.lng]}
          icon={selectedProp?.id === item.id ? selectedIcon : defaultIcon}
          eventHandlers={{ click: () => onMarkerClick(item) }}
        >
          <Popup>
            <div className="p-1 w-44">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <p className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mb-1
                ${item.tipe === 'Dijual' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {item.tipe}
              </p>
              <h4 className="font-bold text-xs text-slate-800 leading-snug mb-1">{item.title}</h4>
              <p className="text-blue-600 font-extrabold text-sm">
                Rp {item.harga.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">📍 {item.lokasi}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;