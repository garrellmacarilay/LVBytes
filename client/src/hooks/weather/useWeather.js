import { useState, useEffect } from "react";
import { api } from "../../utils/api";

export function useWeather(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    let isMounted = true;

    const fetchWeather = () => {
      setLoading(true);
      setError(null);

      api
        .get(`/weather/${encodeURIComponent(city)}`)
        .then((res) => {
          if (!isMounted) return;
          if (res.data.status === "success") {
            setWeather(res.data.data);
          } else {
            setError(res.data.message || "Failed to fetch weather");
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(err.response?.data?.message || err.message || "Something went wrong");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchWeather(); // initial fetch
    const interval = setInterval(fetchWeather, 2 * 60 * 1000); // ✅ 2-minute polling

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [city]);

  return { weather, loading, error };
}
