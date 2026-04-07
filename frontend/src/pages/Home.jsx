import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import PropertyGrid from '../components/PropertyGrid';

export default function Home() {
  return (
    <main>
      {/* Banner Utama */}
      <HeroCarousel />
      
      {/* Grid Properti (Beri sedikit margin atas biar nggak nempel banget) */}
      <div className="mt-8">
        <PropertyGrid />
      </div>
    </main>
  );
}