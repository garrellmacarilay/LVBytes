import React, { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  Menu,
  Shield,
  LayoutDashboard,
  MessageSquare,
  UserIcon,
  WifiOff,
  MapPin
} from "./Icons"
import { logoutUser } from "../services/userService"

export const Layout = ({ user, isOffline }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutUser()
      // Firebase auth state change will handle the redirect
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar - Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          isSidebarOpen ? "block" : "hidden"
        } overflow-hidden`}
        style={{ height: '100vh', width: '100vw' }}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col overflow-hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ height: '100vh' }}
      >
        {/* Header - Fixed at top */}
        <div className="shrink-0 h-16 flex items-center px-6 bg-slate-950">
          <Shield className="w-6 h-6 text-blue-400 mr-2" />
          <span className="text-xl font-bold tracking-tight">
            FloodGuard AI
          </span>
        </div>

        {/* Navigation - Scrollable middle section */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink
            to="/evacuation"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <MapPin className="w-5 h-5 mr-3" />
            Evacuation Centers
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            AI Safety Assistant
          </NavLink>
        </div>

        {/* Profile Section - Fixed at bottom, always visible */}
        <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center mb-4">
            <div className="bg-blue-900 p-2 rounded-full mr-3 shrink-0">
              <UserIcon className="w-5 h-5 text-blue-200" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-blue-400 truncate">Verified Resident</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <button
            className="lg:hidden text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            {isOffline && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                <WifiOff className="w-3 h-3 mr-1" /> Offline
              </span>
            )}
            <span className="hidden sm:inline-block text-sm text-gray-500">
              East River District &bull; Partly Cloudy
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
