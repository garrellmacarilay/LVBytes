import { useState, useEffect } from "react";
import api from "../utils/api"; // your axios instance

/**
 * Custom hook to fetch crisis alerts for a specific city
 * @param {string} city - city name
 */
export function useCrisisAlerts(city) {
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    setError(null);

    api
      .get(`/crisis/${encodeURIComponent(city)}`)
      .then((res) => {
        if (res.data.status === "success") {
          setAlerts(res.data.alerts);
          setLocation(res.data.location);
        } else {
          setError(res.data.message || "Failed to fetch alerts");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [city]);

  return { alerts, location, loading, error };
}
