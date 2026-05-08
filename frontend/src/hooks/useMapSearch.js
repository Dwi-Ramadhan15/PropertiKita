import { useState, useEffect } from "react";
import axios from "axios";

export default function useMapSearch() {
    const [allProperties, setAllProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [mapCenter, setMapCenter] = useState([-5.397140, 105.266800]);
    const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [maxHarga, setMaxHarga] = useState(2000000000);
    const [kamarTidur, setKamarTidur] = useState(null);

    // FETCH DATA
    useEffect(() => {
        const fetchProperties = async() => {
            try {
                const res = await axios.get(
                    "/_/backend/api/properti?limit=100"
                );

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

        fetchProperties();
    }, []);

    // FILTER
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
            });
        }

        setFilteredProperties(result);
    }, [searchQuery, maxHarga, kamarTidur, allProperties]);


    const formatHarga = (harga) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(harga);
    };


    const handleReset = () => {
        setSearchQuery("");
        setMaxHarga(2000000000);
        setKamarTidur(null);
    };


    // HOVER CARD
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


    const getGoogleMapsUrl = (item) => {
        const lat = item.geometry.coordinates[1];
        const lng = item.geometry.coordinates[0];

        return `https://www.google.com/maps?q=${lat},${lng}`;
    };

    return {
        loading,
        mapCenter,
        hoveredPropertyId,
        searchQuery,
        maxHarga,
        kamarTidur,
        filteredProperties,

        setMapCenter,
        setSearchQuery,
        setMaxHarga,
        setKamarTidur,

        formatHarga,
        handleReset,
        handleHoverProperty,
        handleLeaveProperty,
        getGoogleMapsUrl,
    };
}