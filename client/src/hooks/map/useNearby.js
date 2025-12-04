import { useState, useEffect } from "react";
import api from "../utils/api";

/**
 * Custom hook to fetch nearby places
 * @param {number} lat
 * @param {number} lon
 * @param {number} radius - search radius in meters (optional)
 * @param {string} keyword - filter by keyword (optional)
 */
export function useNearby({ lat, lon, radius = 1500, keyword = "" }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) return;

    setLoading(true);
    setError(null);

    api
      .get("/map/nearby", {
        params: { lat, lon, radius, keyword },
      })
      .then((res) => setPlaces(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [lat, lon, radius, keyword]);

  return { places, loading, error };
}
