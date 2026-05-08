import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useVerify from '../hooks/useVerify';
import backgroundRumah from '../assets/rumah-mewah-Armada.jpg';
import logoPK from '../assets/logo.png';

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier } = location.state || {};

  const { otp, setOtp, loading, resendLoading, handleVerify, handleResend } = useVerify(navigate, identifier);
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    let newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative py-10"
      style={{ backgroundImage: `url(${backgroundRumah})` }}
    >
      <div className="absolute inset-0 bg-[#0A1A2E]/80 z-10"></div>

      <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg text-center relative z-20 animate-in zoom-in duration-300">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src={logoPK} alt="Logo" className="h-20 w-auto object-contain" />
          <span className="text-3xl font-black text-[#C6A265] tracking-tight">PropertiKita</span>
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Verifikasi Akun</h2>
        <p className="text-gray-400 text-xs font-bold mb-10 uppercase tracking-tight">
          Masukkan 6 digit kode yang dikirim ke <br/>
          <span className="text-[#C6A265] font-extrabold">{identifier || "Data tidak ditemukan"}</span>
        </p>
        
        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 md:gap-3">
            {otp.map((data, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-16 md:w-16 md:h-20 text-center text-4xl font-black bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-[#C6A265] focus:ring-2 focus:ring-[#C6A265]/20 outline-none transition-all shadow-inner"
                  value={data}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  required
                />
              );
            })}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 md:py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed bg-[#1A314D] hover:bg-black active:scale-[0.98]"
          >
            {loading ? "MENGECEK..." : "KONFIRMASI KODE"}
          </button>
        </form>

        <div className="mt-10 text-gray-400 text-xs font-bold uppercase tracking-wide">
          Tidak terima kode? <br/>
          <button 
            type="button" 
            onClick={handleResend} 
            disabled={resendLoading}
            className="text-[#C6A265] mt-3 hover:text-[#B39156] transition flex items-center justify-center gap-2 mx-auto font-extrabold text-sm disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:text-gray-300"
          >
            {resendLoading ? (
              <>
                <span className="animate-spin">⟳</span> Mengirim ulang...
              </>
            ) : (
              "⟳ Kirim ulang kode"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}