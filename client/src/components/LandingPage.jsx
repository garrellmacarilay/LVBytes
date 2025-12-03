import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Shield,
  Activity,
  MapPin,
  MessageSquare,
  Phone,
  ChevronRight,
  CloudRain,
  AlertTriangle
} from "./Icons"

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 font-inter selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-blue-600 p-2 rounded-xl mr-3 shadow-lg shadow-blue-600/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                FloodGuard AI
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="tel:911"
                className="hidden md:flex items-center text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors border border-red-100"
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency: 911
              </a>
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              <button
                onClick={() => navigate("/login")}
                className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 relative mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Live Flood Monitoring System v2.5
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              Disaster Response, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Reimagined.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Equipping communities with AI-driven insights, real-time
              evacuation routes, and offline-first safety tools when it matters
              most.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-500 transition-all transform hover:scale-105 shadow-xl shadow-blue-600/30"
              >
                Access Command Center
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all hover:shadow-lg"
              >
                View Live Demo
              </button>
            </div>

            {/* Dashboard Preview Mockup with Static Map Image */}
            <div className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl bg-white rotate-x-12 transform-gpu overflow-hidden aspect-[16/9] z-20">
              {/* 
                      NOTE: Replace the src below with the URL of the specific image you want to use.
                      Using a placeholder Philippine map for now.
                  */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Philippines_location_map.svg/1024px-Philippines_location_map.svg.png"
                alt="Live Flood Map Visualization"
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                AI Safety Assistant
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Powered by Gemini 2.5, receive instant, context-aware safety
                guidance and evacuation protocols tailored to your specific
                location and situation.
              </p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Live Evacuation Maps
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Real-time routing to the nearest safe zones. Our maps update
                dynamically based on flood levels and road accessibility
                reports.
              </p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Community Intelligence
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Crowdsourced incident reporting allows residents to flag
                hazards, creating a living map of the disaster zone for faster
                authority response.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Mode Banner */}
      <div className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <div className="inline-flex items-center text-red-400 font-bold mb-4 uppercase tracking-wider text-xs bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <CloudRain className="w-4 h-4 mr-2" />
              Offline Resilience
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              No Internet? <br />
              No Problem.
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-md">
              Disasters often mean connectivity loss. FloodGuard automatically
              switches to a low-bandwidth Emergency Mode to keep critical
              contacts and cached maps available.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-white border-b border-red-500 pb-1 font-semibold hover:text-red-400 transition-colors"
            >
              See how offline mode works &rarr;
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl max-w-sm w-full relative">
              <div className="flex items-center justify-between mb-8">
                <span className="text-red-500 font-bold flex items-center animate-pulse">
                  <Activity className="w-5 h-5 mr-2" /> Connection Lost
                </span>
                <span className="text-slate-500 text-sm">12:42 PM</span>
              </div>
              <div className="space-y-4">
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <h4 className="font-bold text-red-400 mb-1">
                    Emergency Hotline
                  </h4>
                  <p className="text-2xl font-bold">911</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                  <h4 className="font-bold text-slate-300 mb-1">
                    Nearest Safe Zone
                  </h4>
                  <p className="text-white">Capalangan Center (0.8km)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900 font-bold text-lg">
                FloodGuard AI
              </span>
            </div>
            <div className="flex space-x-6 text-slate-500 text-sm font-medium">
              <a href="#" className="hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} FloodGuard AI Response System.
            Built for resilience.
          </div>
        </div>
      </footer>
    </div>
  )
}
