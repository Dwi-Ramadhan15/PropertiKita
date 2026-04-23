import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useProperties(type = "all") {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [harga, setHarga] = useState('Semua');
  const [kamar, setKamar] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti?limit=100');
        const allData = res.data.data.features || [];

        let filtered = allData;

        if (type === "dijual") {
          filtered = allData.filter(item =>
            item.properties.kategori?.toLowerCase() === 'dijual'
          );
        }

        if (type === "sewa") {
          filtered = allData.filter(item =>
            item.properties.kategori?.toLowerCase().includes('sewa') ||
            item.properties.kategori?.toLowerCase().includes('kontrakan') ||
            item.properties.kategori?.toLowerCase().includes('kos')
          );
        }

        setProperties(filtered);
        setFilteredProperties(filtered);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  // FILTER
  useEffect(() => {
    let temp = properties;

    if (search) {
      temp = temp.filter(p =>
        p.properties.lokasi?.toLowerCase().includes(search.toLowerCase()) ||
        p.properties.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (harga !== 'Semua') {
      const [min, max] = harga.split('-').map(Number);
      temp = temp.filter(p =>
        p.properties.harga >= min && (max ? p.properties.harga <= max : true)
      );
    }

    if (kamar !== 'Semua') {
      temp = temp.filter(p =>
        p.properties.kamar_tidur === Number(kamar)
      );
    }

    setFilteredProperties(temp);
    setCurrentPage(1);
  }, [search, harga, kamar, properties]);

  // PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredProperties.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return {
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
  };
}