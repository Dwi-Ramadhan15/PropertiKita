import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../../types/property';

// Fix Icon Leaflet issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapViewProps {
  properties: Property[];
  selectedProp: Property | null;
  onMarkerClick: (prop: Property) => void;
}

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ properties, selectedProp, onMarkerClick }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={[-6.2000, 106.8166]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.lat, item.lng]} 
            icon={DefaultIcon}
            eventHandlers={{ 
              click: () => onMarkerClick(item) 
            }}
          >
            <Popup>
              <div className="w-32">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="rounded w-full h-20 object-cover" 
                />
                <h4 className="font-bold text-xs mt-1 text-blue-700">{item.title}</h4>
                <p className="text-[10px] text-gray-600 text-nowrap">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedProp && <MapController center={[selectedProp.lat, selectedProp.lng]} />}
      </MapContainer>
    </div>
  );
};

export default MapView;