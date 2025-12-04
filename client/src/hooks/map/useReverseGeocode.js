import { useState, useEffect } from "react";
import api from "../utils/api";

/**
 * Custom hook to geocode an address
 * @param {string} address - the address to convert to coordinates
 */
export function useGeocode(address) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    setLoading(true);
    setError(null);

    api
      .get(`/map/geocode/${encodeURIComponent(address)}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [address]);

  return { data, loading, error };
}
