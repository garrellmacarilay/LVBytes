import { useState, useEffect } from "react";
import api from "../utils/api";

/**
 * Custom hook to fetch weather data for a specific city
 * @param {string} city - city name
 */
export function useWeather(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    setError(null);

    api
      .get(`/weather/${encodeURIComponent(city)}`)
      .then((res) => {
        if (res.data.status === "success") {
          setWeather(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch weather");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [city]);

  return { weather, loading, error };
}
