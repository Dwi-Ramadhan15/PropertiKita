import React from 'react';
import { MdLocationOn, MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useProperties from '../hooks/useProperties';

export default function PropertyList({ type = "all" }) {

  const {
    loading,
    search,
    harga,
    kamar,
    currentPage,
    totalPages,
    filteredProperties,
    currentItems,
    setSearch,
    setHarga,
    setKamar,
    paginate
  } = useProperties(type);

  const isSewa = type === "sewa";

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number || 0);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {/* HERO */}
      {type !== "all" && (
        <div className={`${isSewa ? "bg-[#334155]" : "bg-[#475569]"} py-20 px-6 text-center text-white`}>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
            {type === "dijual" ? "Properti Dijual" : "Properti Disewa"}
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {type === "dijual"
              ? "Temukan hunian terbaik dengan harga ideal."
              : "Solusi hunian sementara yang nyaman dan strategis."}
          </p>
        </div>
      )}

      {/* CONTAINER */}
      <div className={`max-w-7xl mx-auto px-6 pb-20 ${type === "all" ? "-mt-20" : "-mt-10"}`}>

        {/* FILTER */}
        <div className="w-full flex justify-center mb-12 relative z-30">
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 items-center border border-gray-100 w-full max-w-4xl">

            <div className="flex-1 w-full relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Cari lokasi atau nama properti..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9925F]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full md:w-44 px-4 py-3 rounded-xl border border-gray-200 bg-white"
            >
              <option value="Semua">Semua Harga</option>
              <option value="0-500000000">Di bawah 500 Juta</option>
              <option value="500000000-1000000000">500 Jt - 1 M</option>
              <option value="1000000000">Di atas 1 M</option>
            </select>

            <select
              value={kamar}
              onChange={(e) => setKamar(e.target.value)}
              className="w-full md:w-40 px-4 py-3 rounded-xl border border-gray-200 bg-white"
            >
              <option value="Semua">Semua Kamar</option>
              <option value="1">1 Kamar</option>
              <option value="2">2 Kamar</option>
              <option value="3">3 Kamar</option>
            </select>

            <div className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap ${
              isSewa ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
            }`}>
              {filteredProperties.length} Unit
            </div>

          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((item) => (
                <div key={item.properties.id} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden">

                  <div className="h-60 overflow-hidden">
                    <img
                      src={item.properties.imageUrl || 'https://via.placeholder.com/400x300'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      alt="properti"
                    />
                  </div>

                  <div className="p-6 flex flex-col">
                    <h3 className="text-[#C9925F] font-bold text-xl mb-1">
                      {formatRupiah(item.properties.harga)}
                    </h3>

                    <p className="font-bold text-slate-800 line-clamp-1">
                      {item.properties.title}
                    </p>

                    <p className="text-gray-400 flex items-center text-sm mb-4">
                      <MdLocationOn className="mr-1 text-red-400" />
                      {item.properties.lokasi}
                    </p>

                    <div className="flex justify-between text-sm text-slate-500 border-t pt-4">
                      <span className="flex items-center gap-1"><FaBed /> {item.properties.kamar_tidur || 0}</span>
                      <span className="flex items-center gap-1"><FaBath /> {item.properties.kamar_mandi || 0}</span>
                      <span className="flex items-center gap-1"><FaRulerCombined /> {item.properties.luas || 0}</span>
                    </div>

                    <Link
                      to={`/properti/${item.properties.slug}`}
                      className="mt-4 block text-center py-3 bg-slate-50 rounded-xl font-bold hover:bg-[#D9AB7B] hover:text-black transition"
                    >
                      Lihat Detail
                    </Link>

                  </div>

                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center mt-12 gap-2 items-center">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                <MdChevronLeft size={24} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                <MdChevronRight size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}