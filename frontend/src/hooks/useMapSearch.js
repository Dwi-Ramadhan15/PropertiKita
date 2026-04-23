<<<<<<< HEAD
// src/hooks/useMapSearch.js
import { useState, useEffect } from "react";
import axios from "axios";
=======
import { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> ayu

export default function useMapSearch() {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  const [mapCenter, setMapCenter] = useState([-5.397140, 105.266800]);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [maxHarga, setMaxHarga] = useState(2000000000);
  const [kamarTidur, setKamarTidur] = useState(null);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/properti?limit=100"
        );

=======
  const [mapCenter, setMapCenter] = useState([-5.397140, 105.266800]);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [maxHarga, setMaxHarga] = useState(2000000000);
  const [kamarTidur, setKamarTidur] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti?limit=100');
>>>>>>> ayu
        if (res.data.success) {
          const data = res.data.data.features || [];
          setAllProperties(data);
          setFilteredProperties(data);
        }
      } catch (error) {
        console.error("Error fetch map data:", error);
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD

    fetchProperties();
  }, []);

  // =========================
  // FILTER
  // =========================
  useEffect(() => {
    let result = [...allProperties];

    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.properties.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.properties.lokasi
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    result = result.filter(
      (item) => item.properties.harga <= maxHarga
    );

    if (kamarTidur) {
      result = result.filter((item) => {
        if (kamarTidur === "3+") {
          return item.properties.kamar_tidur >= 3;
        }

        return (
          item.properties.kamar_tidur === parseInt(kamarTidur)
        );
=======
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = allProperties;

    if (searchQuery) {
      result = result.filter(item =>
        item.properties.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.properties.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result = result.filter(item => item.properties.harga <= maxHarga);

    if (kamarTidur) {
      result = result.filter(item => {
        if (kamarTidur === '3+') return item.properties.kamar_tidur >= 3;
        return item.properties.kamar_tidur === parseInt(kamarTidur);
>>>>>>> ayu
      });
    }

    setFilteredProperties(result);
  }, [searchQuery, maxHarga, kamarTidur, allProperties]);

<<<<<<< HEAD
  // =========================
  // FORMAT HARGA
  // =========================
  const formatHarga = (harga) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  // =========================
  // RESET FILTER
  // =========================
  const handleReset = () => {
    setSearchQuery("");
=======
  const formatHarga = (harga) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(harga);
  };

  const handleReset = () => {
    setSearchQuery('');
>>>>>>> ayu
    setMaxHarga(2000000000);
    setKamarTidur(null);
  };

<<<<<<< HEAD
  // =========================
  // HOVER CARD
  // =========================
  const handleHoverProperty = (item) => {
    setHoveredPropertyId(item.properties.id);

    setMapCenter([
      item.geometry.coordinates[1],
      item.geometry.coordinates[0],
    ]);
  };

  const handleLeaveProperty = () => {
    setHoveredPropertyId(null);
  };

  // =========================
  // GOOGLE MAPS URL
  // =========================
  const getGoogleMapsUrl = (item) => {
    const lat = item.geometry.coordinates[1];
    const lng = item.geometry.coordinates[0];

    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

=======
>>>>>>> ayu
  return {
    loading,
    mapCenter,
    hoveredPropertyId,
    searchQuery,
    maxHarga,
    kamarTidur,
    filteredProperties,
<<<<<<< HEAD

    setMapCenter,
    setSearchQuery,
    setMaxHarga,
    setKamarTidur,

    formatHarga,
    handleReset,
    handleHoverProperty,
    handleLeaveProperty,
    getGoogleMapsUrl,
=======
    setMapCenter,
    setHoveredPropertyId,
    setSearchQuery,
    setMaxHarga,
    setKamarTidur,
    formatHarga,
    handleReset
>>>>>>> ayu
  };
}