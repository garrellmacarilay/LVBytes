import React from "react"
import { WifiOff, Phone, RefreshCw } from "./Icons"

const OfflineOverlay = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6">
      <div className="bg-red-600/20 p-8 rounded-full mb-8 animate-pulse">
        <WifiOff className="w-16 h-16 text-red-500" />
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center">Connection Lost</h1>
      <p className="text-slate-300 text-center mb-8 max-w-md">
        You are currently offline. Critical emergency contacts are available
        below.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <a
          href="tel:911"
          className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-red-900/50"
        >
          <Phone className="w-6 h-6 mr-3" />
          Call Emergency (911)
        </a>

        <button
          onClick={onRetry}
          className="flex items-center justify-center w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-3" />
          Retry Connection
        </button>
      </div>

      <div className="mt-12 text-sm text-slate-500">
        FloodGuard AI Offline Safety Mode
      </div>
    </div>
  )
}

export default OfflineOverlay
