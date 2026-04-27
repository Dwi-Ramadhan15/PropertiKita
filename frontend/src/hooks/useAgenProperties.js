import { useState, useEffect } from "react";
import axios from "axios";

export default function useAgenProperties(agenIdFromQuery) {
  const [properti, setProperti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperti = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const idToSearch = agenIdFromQuery || user?.id;

      if (!idToSearch) {
        setProperti([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const isPublic = !!agenIdFromQuery;
        const url = `http://localhost:5000/api/properti?agen=${idToSearch}${!isPublic ? '&status=all' : ''}`;

        const res = await axios.get(url);

        if (res.data.success && res.data.data?.features) {
          setProperti(res.data.data.features);
        } else {
          setProperti([]);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setProperti([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperti();
  }, [agenIdFromQuery]);

  return { properti, loading };
}