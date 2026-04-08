import { Property } from '../../types/property';

interface ListingCardProps {
  property: Property;
  isSelected: boolean;
  onClick: () => void;
}

const ListingCard = ({ property, isSelected, onClick }: ListingCardProps) => {
  const { image, harga, title, lokasi, tipe, beds, baths, sqft } = property;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl overflow-hidden shadow-md border transition-all duration-300 cursor-pointer
        ${isSelected
          ? 'border-blue-500 shadow-blue-200 shadow-xl scale-[1.02]'
          : 'border-gray-100 hover:shadow-xl hover:scale-[1.01]'
        }`}
    >
      <div className="relative">
        <img src={image} alt={title} className="w-full h-56 object-cover" />
        <span className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-full
          ${tipe === 'Dijual' ? 'bg-blue-600' : 'bg-emerald-500'}`}>
          {tipe}
        </span>
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
        >
          ❤
        </button>
      </div>

      <div className="p-5 text-left">
        <h3 className="text-blue-600 font-extrabold text-xl mb-1">
          Rp {harga.toLocaleString('id-ID')}
        </h3>
        <p className="font-bold text-gray-800 text-base leading-tight mb-1">{title}</p>
        <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
          📍 {lokasi}
        </p>

        {(beds || baths || sqft) && (
          <div className="flex justify-between items-center text-gray-500 border-t pt-4 text-sm font-medium">
            {beds && <span className="flex items-center gap-1">🛏 {beds} KT</span>}
            {baths && <span className="flex items-center gap-1">🚿 {baths} KM</span>}
            {sqft && <span className="flex items-center gap-1">📏 {sqft}m²</span>}
          </div>
        )}

        <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default ListingCard;