import React, { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Shield } from "./Icons"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import {initialCenters} from "./ListEvacCenter"

// Fix for default markers in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Add custom CSS styles for markers
const markerStyles = `
  .user-marker-icon {
    background: transparent !important;
    border: none !important;
  }
  
  .marker-pin {
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    position: absolute;
    transform: rotate(-45deg);
    left: 50%;
    top: 50%;
    margin: -15px 0 0 -15px;
  }
  
  .marker-pin.open {
    background: #10b981;
    border: 3px solid #ffffff;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }
  
  .marker-pin.full {
    background: #ef4444;
    border: 3px solid #ffffff;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  }
  
  .marker-pin.closed {
    background: #6b7280;
    border: 3px solid #ffffff;
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.4);
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = markerStyles
  if (!document.head.querySelector('style[data-leaflet-markers]')) {
    styleSheet.setAttribute('data-leaflet-markers', 'true')
    document.head.appendChild(styleSheet)
  }
}


// Helper to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

const deg2rad = deg => deg * (Math.PI / 180)

export const EvacuationCenters = () => {
  const [filter, setFilter] = useState("all")
  const [centers, setCenters] = useState(initialCenters)
  const [userLocation, setUserLocation] = useState(null)
  const [activeRouteId, setActiveRouteId] = useState(null)

  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])
  const routingControlRef = useRef(null)

  // Initialize Map and Geolocation
  useEffect(() => {
    // 1. Define fallback location (Apalit Public Market area) to ensure the demo looks good
    // even without GPS or if user is far away.
    const fallbackPos = { lat: 14.9495, lng: 120.7587 }

    const updateCentersWithDistance = (userLat, userLng) => {
      const updated = initialCenters
        .map(center => ({
          ...center,
          distance: calculateDistance(
            userLat,
            userLng,
            center.coordinates.lat,
            center.coordinates.lng
          )
        }))
        .sort((a, b) => a.distance - b.distance)
      setCenters(updated)
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords
          // If user is > 50km away, stick to fallback for the demo context to make sense
          // otherwise use real location
          const distToApalit = calculateDistance(
            latitude,
            longitude,
            fallbackPos.lat,
            fallbackPos.lng
          )

          if (distToApalit > 50) {
            console.log("User far from Apalit, using simulation location.")
            setUserLocation(fallbackPos)
            updateCentersWithDistance(fallbackPos.lat, fallbackPos.lng)
          } else {
            setUserLocation({ lat: latitude, lng: longitude })
            updateCentersWithDistance(latitude, longitude)
          }
        },
        error => {
          console.error("Error getting location:", error)
          setUserLocation(fallbackPos)
          updateCentersWithDistance(fallbackPos.lat, fallbackPos.lng)
        }
      )
    } else {
      setUserLocation(fallbackPos)
      updateCentersWithDistance(fallbackPos.lat, fallbackPos.lng)
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Update Map when User Location or Centers change
  useEffect(() => {
    if (!userLocation || !mapRef.current) return

    // Initialize Map if not exists
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView(
        [userLocation.lat, userLocation.lng],
        14
      )

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(leafletMap.current)

      // Add User Marker (Blue Pulse)
      const userIcon = L.divIcon({
        className: "user-marker-icon",
        html: `<div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md">
                 <div class="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
               </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(leafletMap.current)
        .bindPopup("Your Location")
    }

    // Clear existing center markers (but keep the map instance and routing control)
    markersRef.current.forEach(m => leafletMap.current.removeLayer(m))
    markersRef.current = []

    // Add Center Markers
    const filtered = centers.filter(center => {
      if (filter === "open") return center.status === "Open"
      if (filter === "full")
        return center.status === "Full" || center.status === "Closed"
      return true
    })

    filtered.forEach((center, index) => {
      const statusClass =
        center.status === "Open"
          ? "open"
          : center.status === "Full"
          ? "full"
          : "closed"

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style='background-color: transparent;' class='marker-pin ${statusClass}'></div>
               <span style='position:absolute; top:-8px; left:-2px; width:30px; text-align:center; font-weight:bold; color:white; font-size:12px; transform: rotate(45deg)'>${index +
                 1}</span>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      })

      const marker = L.marker(
        [center.coordinates.lat, center.coordinates.lng],
        { icon }
      ).addTo(leafletMap.current).bindPopup(`
          <div class="font-sans text-sm">
            <h3 class="font-bold text-slate-800">${center.name}</h3>
            <p class="text-slate-500 mb-1">${center.address}</p>
            <p class="text-blue-600 text-xs font-medium mb-2">${center.city}</p>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${
              center.status === "Open"
                ? "bg-green-500"
                : center.status === "Full"
                ? "bg-red-500"
                : "bg-gray-500"
            }">${center.status}</span>
          </div>
        `)

      // On marker click, trigger selection logic if needed
      marker.on("click", () => {
        // Could scroll to item
      })

      markersRef.current.push(marker)
    })

    // Fit bounds only if no active route. If routing, let the router handle bounds.
    if (markersRef.current.length > 0 && !routingControlRef.current) {
      const group = new L.featureGroup([
        L.marker([userLocation.lat, userLocation.lng]),
        ...markersRef.current
      ])
      leafletMap.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [userLocation, centers, filter])

  const filteredCenters = centers.filter(center => {
    if (filter === "open") return center.status === "Open"
    if (filter === "full")
      return center.status === "Full" || center.status === "Closed"
    return true
  })

  const handleExternalNavigate = center => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.lat},${center.coordinates.lng}`
    window.open(url, "_blank")
  }

  const handleEmbeddedNavigate = center => {
    if (!leafletMap.current || !userLocation) return

    setActiveRouteId(center.id)

    // Remove existing routing control
    if (routingControlRef.current) {
      leafletMap.current.removeControl(routingControlRef.current)
    }

    // Add new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(center.coordinates.lat, center.coordinates.lng)
      ],
      lineOptions: {
        styles: [{ color: "#2563eb", opacity: 0.7, weight: 6 }]
      },
      addWaypoints: false, // Disable dragging new points
      draggableWaypoints: false,
      fitSelectedRoutes: true, // Zoom to fit route
      showAlternatives: false,
      show: false, // Don't show the instructions container automatically
      createMarker: () => null // Don't create default markers, we have our own
    }).addTo(leafletMap.current)

    // Mobile UX: Scroll map into view
    if (window.innerWidth < 1024 && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const clearRoute = () => {
    if (routingControlRef.current && leafletMap.current) {
      leafletMap.current.removeControl(routingControlRef.current)
      routingControlRef.current = null
      setActiveRouteId(null)

      // Reset view to bounds of all markers
      if (markersRef.current.length > 0 && userLocation) {
        const group = new L.featureGroup([
          L.marker([userLocation.lat, userLocation.lng]),
          ...markersRef.current
        ])
        leafletMap.current.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="shrink-0 max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between py-4 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Evacuation Centers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Apalit, Pampanga - Emergency Shelters
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "all", label: "All Centers" },
            { id: "open", label: "Open Now" },
            { id: "full", label: "Full / Closed" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-none ${
                filter === f.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-6 pb-4 lg:pb-6 min-h-0 overflow-hidden">
        {/* Map View - Fixed within viewport */}
        <div className="flex-1 lg:col-span-2 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner group order-1 lg:order-2 min-h-0">
          {/* The Map Container */}
          <div ref={mapRef} className="w-full h-full z-10" />

          {/* User Location Loading State */}
          {!userLocation && (
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-slate-500 text-sm font-medium">
                  Locating nearest safe zones...
                </p>
              </div>
            </div>
          )}

          {/* Clear Route Button - Only when route active */}
          {activeRouteId && (
            <div className="absolute bottom-6 right-4 z-[1000]">
              <button
                onClick={clearRoute}
                className="bg-white text-red-600 text-xs font-bold px-3 py-2 rounded-lg shadow-lg border border-slate-200 hover:bg-red-50 transition-colors"
              >
                Clear Route
              </button>
            </div>
          )}

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-md text-[10px] text-slate-500 border border-slate-200 z-[1000] flex items-center">
            <Shield className="w-3 h-3 mr-1 text-blue-500" />
            Live Updates
          </div>
        </div>

        {/* Centers List - Horizontal scroll on mobile, vertical on desktop */}
        <div className="flex-1 lg:col-span-1 order-2 lg:order-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto overflow-y-hidden lg:overflow-y-auto">
            <div className="flex lg:flex-col gap-4 p-1 lg:pb-4">
              {filteredCenters.map((center, index) => (
                <div
                  key={center.id}
                  className={`w-[85vw] lg:w-full flex-shrink-0 lg:flex-shrink bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all ${
                    activeRouteId === center.id
                      ? "border-blue-500 ring-1 ring-blue-500 shadow-md"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                        center.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : center.status === "Full"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {center.status}
                    </span>
                    <span className="flex items-center text-slate-500 text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {center.distance} km
                    </span>
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <div className="mt-1 min-w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">
                        {center.name}
                      </h3>
                      <p className="text-slate-500 text-xs mb-1">{center.address}</p>
                      <p className="text-blue-600 text-xs font-medium">{center.city}, Pampanga</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleExternalNavigate(center)}
                      className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                      title="Open in Google Maps App"
                    >
                      <MapPin className="w-4 h-4 mr-2 opacity-70" />
                      G-Maps
                    </button>
                    <button
                      onClick={() => handleEmbeddedNavigate(center)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Route
                    </button>
                  </div>
                </div>
              ))}

              {filteredCenters.length === 0 && (
                <div className="w-full text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                  <p className="text-slate-400 text-sm">
                    No evacuation centers found.
                  </p>
                  <button
                    onClick={() => setFilter("all")}
                    className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
