import React, { useState, useEffect, useRef } from "react"
import { Camera, Send, AlertOctagon, ThumbsUp } from "./Icons"

export const ReportIncident = () => {
  const [reportType, setReportType] = useState("Flood")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])

  // Mock Feed Data
  const [feed, setFeed] = useState([
    {
      id: "1",
      type: "Flood",
      description:
        "Waist-deep water near San Juan Plaza. Passable only by truck.",
      timestamp: "10m ago",
      location: { lat: 14.9495, lng: 120.7587 },
      reporter: "Barangay Captain",
      verified: true,
      upvotes: 12
    },
    {
      id: "2",
      type: "Road Block",
      description: "Fallen tree on McArthur Highway. Traffic stalled.",
      timestamp: "25m ago",
      location: { lat: 14.94, lng: 120.76 },
      reporter: "Juan D.",
      verified: false,
      upvotes: 5
    }
  ])

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Default to Apalit center
      leafletMap.current = L.map(mapRef.current).setView(
        [14.9495, 120.7587],
        14
      )

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(leafletMap.current)
    }

    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Update Markers when feed changes
  useEffect(() => {
    if (!leafletMap.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => leafletMap.current.removeLayer(marker))
    markersRef.current = []

    // Add new markers
    feed.forEach(item => {
      const color = item.type === "Flood" ? "bg-blue-500" : "bg-red-500"
      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="w-4 h-4 rounded-full ${color} border-2 border-white shadow-sm"></div>`,
        iconSize: [16, 16]
      })
      const marker = L.marker([item.location.lat, item.location.lng], { icon })
        .addTo(leafletMap.current)
        .bindPopup(`<b>${item.type}</b><br/>${item.description}`)

      markersRef.current.push(marker)
    })
  }, [feed])

  const handleSubmit = e => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newIncident = {
        id: Date.now().toString(),
        type: reportType,
        description,
        timestamp: "Just now",
        location: {
          lat: 14.9495 + (Math.random() * 0.01 - 0.005),
          lng: 120.7587 + (Math.random() * 0.01 - 0.005)
        },
        reporter: "You",
        verified: false,
        upvotes: 0
      }

      setFeed(prev => [newIncident, ...prev])
      setDescription("")
      setIsSubmitting(false)

      // Pan to new incident
      if (leafletMap.current) {
        leafletMap.current.setView(
          [newIncident.location.lat, newIncident.location.lng],
          15
        )
      }
    }, 1000)
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] lg:h-auto pb-4 lg:pb-20 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Community Reports</h1>
        <p className="text-slate-500 text-sm">
          Crowdsourced updates from Apalit residents.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-6 min-h-0">
        {/* Map Column */}
        <div className="lg:col-span-2 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative min-h-[300px] lg:min-h-0 order-2 lg:order-1 flex-1">
          <div ref={mapRef} className="w-full h-full" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs font-medium z-400">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>{" "}
              Flood
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>{" "}
              Hazard
            </div>
          </div>
        </div>

        {/* Feed & Form Column */}
        <div className="lg:col-span-1 flex flex-col gap-4 order-1 lg:order-2 h-auto lg:h-[calc(100vh-10rem)] lg:overflow-hidden">
          {/* Report Form */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-none">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center">
              <AlertOctagon className="w-5 h-5 text-orange-500 mr-2" />
              Report an Incident
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Incident Type
                </label>
                <div className="flex gap-2">
                  {["Flood", "Road Block", "Rescue Needed"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReportType(type)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        reportType === type
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the situation and location..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 bg-slate-50"
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-sm shadow-blue-200"
                >
                  {isSubmitting ? "Posting..." : "Submit Report"}
                  <Send className="w-4 h-4 ml-2" />
                </button>
              </div>
            </form>
          </div>

          {/* Live Feed */}
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-2">
            {feed.map(item => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        item.type === "Flood" ? "bg-blue-500" : "bg-red-500"
                      }`}
                    ></span>
                    <span className="font-bold text-sm text-slate-800">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    {item.reporter}{" "}
                    {item.verified && (
                      <span className="text-blue-500 ml-1">✓ Verified</span>
                    )}
                  </span>
                  <div className="flex items-center text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                    <ThumbsUp className="w-3 h-3 mr-1" /> {item.upvotes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
