import React from 'react';
import { Bed, Bath, Maximize } from 'lucide-react';
import { Property } from '../../types/property';

interface ListingCardProps {
  property: Property;
  isSelected: boolean;
  onClick: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ property, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-3 mb-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <img src={property.image} alt={property.title} className="w-full h-40 object-cover rounded-lg mb-3" />
      <h3 className="font-bold text-gray-800">{property.title}</h3>
      <p className="text-blue-600 font-bold">Rp {property.price.toLocaleString('id-ID')}</p>
      <p className="text-gray-500 text-xs mb-3">{property.address}</p>
      <div className="flex gap-4 text-gray-600 text-sm border-t pt-3">
        <span className="flex items-center gap-1"><Bed size={14}/> {property.beds}</span>
        <span className="flex items-center gap-1"><Bath size={14}/> {property.baths}</span>
        <span className="flex items-center gap-1"><Maximize size={14}/> {property.sqft}m²</span>
      </div>
    </div>
  );
};

export default ListingCard;