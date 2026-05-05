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

    const formatImage = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        return `http://127.0.0.1:9000/propertikita/${img}`;
    };

    const normalizeImages = (prop) => {
        let imgs = [];

        if (Array.isArray(prop.images) && prop.images.length > 0) {
            imgs = prop.images;
        } else if (Array.isArray(prop.gallery) && prop.gallery.length > 0) {
            imgs = prop.gallery;
        } else if (prop.image_url) {
            imgs = [prop.image_url];
        } else if (prop.imageUrl) {
            imgs = [prop.imageUrl];
        }

        imgs = imgs.map(img => formatImage(img));

        return imgs;
    };

    useEffect(() => {
        const fetchData = async() => {
            try {
                const res = await axios.get('http://localhost:5000/api/properti?limit=100');
                const allData = res.data.data.features || [];

                const withImages = allData.map(item => ({
                    ...item,
                    properties: {
                        ...item.properties,
                        images: normalizeImages(item.properties)
                    }
                }));

                let filtered = withImages;

                if (type === "dijual") {
                    filtered = withImages.filter(item =>
                        item.properties.kategori && item.properties.kategori.toLowerCase() === 'dijual'
                    );
                }

                if (type === "sewa") {
                    filtered = withImages.filter(item =>
                        item.properties.kategori && (
                            item.properties.kategori.toLowerCase().includes('sewa') ||
                            item.properties.kategori.toLowerCase().includes('kontrakan') ||
                            item.properties.kategori.toLowerCase().includes('kos')
                        )
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

    useEffect(() => {
        let temp = properties;

        if (search) {
            temp = temp.filter(p =>
                (p.properties.lokasi && p.properties.lokasi.toLowerCase().includes(search.toLowerCase())) ||
                (p.properties.title && p.properties.title.toLowerCase().includes(search.toLowerCase()))
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