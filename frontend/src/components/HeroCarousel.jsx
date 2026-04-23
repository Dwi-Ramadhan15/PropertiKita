import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import useHeroCarousel from '../hooks/useHeroCarousel';

export default function HeroCarousel() {

  const {
    slides,
    current,
    loading,
    setCurrent,
    prevSlide,
    nextSlide
  } = useHeroCarousel();

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
        Memuat Banner...
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-800 text-white flex items-center justify-center">
        Belum ada properti di database.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden group">

      {/* SLIDES */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.imageUrl || "https://via.placeholder.com/2000x1000"}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-blue-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>

          {/* text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm mb-4">
              Properti Unggulan
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 capitalize">
              {slide.title}
            </h1>

            <p className="text-xl md:text-2xl font-bold text-blue-200">
              {formatRupiah(slide.harga)}
            </p>

            <p className="mt-2">
              📍 {slide.lokasi}
            </p>
          </div>
        </div>
      ))}

      {/* BUTTON */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full opacity-0 group-hover:opacity-100"
          >
            <FiChevronLeft size={30} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full opacity-0 group-hover:opacity-100"
          >
            <FiChevronRight size={30} />
          </button>
        </>
      )}

      {/* DOT */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 w-full flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 rounded-full ${
                index === current ? "w-10 bg-white" : "w-3 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

    </div>
  );
}