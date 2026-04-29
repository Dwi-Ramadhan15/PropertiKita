import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FasilitasProperti = () => {
  const [listFasilitas, setListFasilitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fasilitas'); 
        setListFasilitas(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal ambil data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-10">
       <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Daftar Fasilitas</h1>
       <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-gray-50">
             <tr className="border-b font-black text-xs text-gray-400 uppercase tracking-widest">
               <th className="p-6">Nama Fasilitas</th>
               <th className="p-6 text-center">Status</th>
             </tr>
           </thead>
           <tbody>
             {listFasilitas.map((f) => (
               <tr key={f.id} className="border-b hover:bg-gray-50">
                 <td className="p-6 font-bold text-gray-700 uppercase">{f.nama_fasilitas}</td>
                 <td className="p-6 text-center">
                   <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">AKTIF</span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
};

export default FasilitasProperti;