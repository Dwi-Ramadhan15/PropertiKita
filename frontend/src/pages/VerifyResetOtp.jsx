import React, { useState, useRef, useEffect } from 'react';

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Menghilangkan Navbar khusus di halaman ini agar persis gambar
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'none';
    return () => {
      if (navbar) navbar.style.display = 'flex';
    };
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1].focus();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Teks kecil di pojok kiri atas */}
      <div className="p-6 text-gray-300 text-xs font-medium">
        halaman lupa pw user
      </div>

      {/* Box Putih Tengah */}
      <div className="flex-grow flex items-center justify-center px-4 -mt-12">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-lg text-center border border-gray-50">
          
          {/* Logo Emas */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 mb-2">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37] fill-current">
                <path d="M50 10 L90 40 L90 90 L10 90 L10 40 Z" fill="none" stroke="currentColor" strokeWidth="4"/>
                <path d="M30 90 L30 50 L70 50 L70 90" fill="none" stroke="currentColor" strokeWidth="4"/>
                <path d="M50 10 L90 40 L10 40 Z" />
              </svg>
            </div>
            <h1 className="text-[#D4AF37] font-bold text-xl tracking-tighter">PropertiKita</h1>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Verifikasi Kode</h2>
          <p className="text-gray-400 text-xs font-medium mb-10 leading-relaxed">
            Masukan 6 digit kode yang telah <br /> dikirimkan ke nomor WhatsApp Anda
          </p>

          {/* Input Kotak 6 biji */}
          <div className="flex justify-center gap-2 mb-10">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-11 h-14 border border-gray-200 rounded-xl text-center text-lg font-bold focus:border-[#1A314D] focus:ring-1 focus:ring-[#1A314D] outline-none transition-all"
              />
            ))}
          </div>

          {/* Tombol Biru Gelap */}
          <button className="w-full bg-[#1A314D] text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:bg-[#14263b] transition-all mb-8 uppercase">
            verifikasi
          </button>

          {/* Footer Link Kirim Ulang */}
          <div className="text-xs font-semibold text-gray-500">
            Tidak terima kode? <br />
            <button className="text-[#D4AF37] mt-1 flex items-center justify-center gap-1 mx-auto hover:underline font-bold">
              <span className="text-sm">↻</span> Kirim ulang kode
            </button>
          </div>
        </div>
      </div>

      {/* Footer Gelap Persis Gambar */}
      <footer className="bg-[#1A314D] text-white p-12 md:px-24 flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-4 text-[#D4AF37]">
            <span className="font-bold text-2xl tracking-tighter text-white">PropertiKita</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed font-medium">
            Platform properti premium untuk menemukan hunian impian Anda di seluruh Indonesia.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-sm mb-2">Menu</h4>
          <a href="/" className="text-gray-400 text-xs hover:text-white transition">Beranda</a>
          <a href="/dijual" className="text-gray-400 text-xs hover:text-white transition">Properti Dijual</a>
          <a href="/disewa" className="text-gray-400 text-xs hover:text-white transition">Properti Disewa</a>
          <a href="/agen" className="text-gray-400 text-xs hover:text-white transition">Agen</a>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-sm mb-2">Kontak</h4>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            📞 +62 812-3456-7890
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            ✉️ info@propertiku.id
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            📍 Lampung, Indonesia
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VerifyResetOtp;