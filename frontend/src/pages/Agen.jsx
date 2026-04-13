import React from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const daftarAgen = [
  { id: 1, nama: "Budi Santoso", spesialis: "Spesialis Rumah Mewah", foto: "https://via.placeholder.com/150" },
  { id: 2, nama: "Siti Aminah", spesialis: "Spesialis Apartemen & Sewa", foto: "https://via.placeholder.com/150" },
];

export default function Agen() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Agen Properti Kami</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {daftarAgen.map((ag) => (
          <div key={ag.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <img src={ag.foto} alt={ag.nama} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
            <h3 className="text-xl font-bold text-gray-800">{ag.nama}</h3>
            <p className="text-primary font-medium text-sm mb-4">{ag.spesialis}</p>
            <div className="flex justify-center gap-4">
              <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                <FaWhatsapp /> WhatsApp
              </button>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                <FaEnvelope /> Email
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}