import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import MapView from './components/Map/MapView';
import ListingCard from './features/search/ListingCard';
import { Property } from './types/property';
import './App.css';

const MOCK_DATA: Property[] = [
  { 
    id: 1, title: "Modern Villa Kuningan", price: 1500000000, 
    lat: -6.224, lng: 106.843, beds: 3, baths: 2, sqft: 150,
    address: "Jakarta Selatan", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"
  },
  { 
    id: 2, title: "Minimalist Apartment", price: 700000000, 
    lat: -6.210, lng: 106.812, beds: 1, baths: 1, sqft: 45,
    address: "Jakarta Pusat", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
  }
];

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(MOCK_DATA);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [search, setSearch] = useState<string>("");

  // Fungsi Filter Lokal (Simulasi)
  const filterData = (query: string) => {
    const filtered = MOCK_DATA.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
    );
    setProperties(filtered);
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      filterData(query);
    }, 500),
    []
  );

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-black text-blue-700 italic">PropertiKita</h1>
          <input 
            type="text" 
            placeholder="Cari lokasi..." 
            className="w-full mt-4 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        <div className="listing-container">
          <p className="px-2 mb-2 text-sm text-gray-500">{properties.length} properti ditemukan</p>
          {properties.map(item => (
            <ListingCard 
              key={item.id}
              property={item}
              isSelected={selectedProp?.id === item.id}
              onClick={() => setSelectedProp(item)}
            />
          ))}
        </div>
      </aside>

      <main className="map-container">
        <MapView 
          properties={properties} 
          selectedProp={selectedProp} 
          onMarkerClick={setSelectedProp}
        />
      </main>
    </div>
  );
}

export default App;