import React from "react"
import { WifiOff, Phone, RefreshCw } from "./Icons"

const OfflineOverlay = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-red-900 via-slate-900 to-red-950 flex flex-col items-center justify-center text-white p-6 overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
      <div className="bg-red-600/30 p-8 rounded-full mb-8 animate-pulse border-2 border-red-500/50">
        <WifiOff className="w-16 h-16 text-red-400" />
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center text-red-100">CONNECTION LOST</h1>
      <p className="text-red-200 text-center mb-8 max-w-md font-medium">
        ⚠️ Emergency Mode Active - Critical contacts available below for immediate assistance
      </p>

      <div className="w-full max-w-sm space-y-4">
        <a
          href="tel:911"
          className="flex items-center justify-center w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-red-900/50 border-2 border-red-400 animate-pulse"
        >
          <Phone className="w-6 h-6 mr-3" />
          🚨 CALL EMERGENCY (911)
        </a>

        <button
          onClick={onRetry}
          className="flex items-center justify-center w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 px-6 rounded-xl transition-colors border border-orange-400"
        >
          <RefreshCw className="w-5 h-5 mr-3" />
          Retry Connection
        </button>
      </div>

      <div className="mt-12 text-sm text-red-300 bg-red-950/50 px-4 py-2 rounded-lg border border-red-700">
        🛡️ FloodGuard AI - Emergency Offline Mode
      </div>
    </div>
  )
}

export default OfflineOverlay
