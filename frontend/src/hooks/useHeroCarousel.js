// src/hooks/useHeroCarousel.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useHeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchHighlightProperties = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properti');
        const allProperties = res.data.data.features || [];

        const highlightData = allProperties
          .slice(0, 4)
          .map(item => item.properties);

        setSlides(highlightData);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightProperties();
  }, []);

  // AUTOPLAY
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  // NAVIGATION
  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  return {
    slides,
    current,
    loading,
    setCurrent,
    prevSlide,
    nextSlide
  };
}