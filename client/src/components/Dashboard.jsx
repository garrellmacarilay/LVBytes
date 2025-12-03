import React, { useState, useEffect } from "react";
import { AlertTriangle, CloudRain, Wind, Shield, MessageSquare, Phone, MapPin, Camera } from "./Icons";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchRealtimeWeather } from "../services/geminiService";

// JS Replacement for TypeScript Enum
const RiskLevel = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

// Water Level Mock Data
const waterLevelData = [
  { time: "06:00", level: 1.2 },
  { time: "09:00", level: 1.4 },
  { time: "12:00", level: 1.8 },
  { time: "15:00", level: 2.1 },
  { time: "18:00", level: 2.3 },
  { time: "21:00", level: 2.2 },
];

const RiskGauge = ({ level }) => {
  const getRiskColor = () => {
    switch (level) {
      case RiskLevel.LOW:
        return "text-green-500 border-green-500";
      case RiskLevel.MODERATE:
        return "text-yellow-500 border-yellow-500";
      case RiskLevel.HIGH:
        return "text-orange-500 border-orange-500";
      case RiskLevel.CRITICAL:
        return "text-red-500 border-red-500";
      default:
        return "text-gray-500 border-gray-500";
    }
  };

  const getRiskPercentage = () => {
    switch (level) {
      case RiskLevel.LOW:
        return "25%";
      case RiskLevel.MODERATE:
        return "50%";
      case RiskLevel.HIGH:
        return "75%";
      case RiskLevel.CRITICAL:
        return "95%";
      default:
        return "0%";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="w-48 h-24 overflow-hidden relative">
        <div className="w-48 h-48 rounded-full border-16 border-slate-100 absolute top-0 left-0 box-border"></div>

        <div
          className={`w-48 h-48 rounded-full border-16 absolute top-0 left-0 box-border transition-all duration-1000 ease-out border-t-transparent border-r-transparent border-l-transparent ${
            getRiskColor().split(" ")[1]
          }`}
          style={{
            transform: `rotate(${parseInt(getRiskPercentage()) * 1.8 - 45}deg)`,
          }}
        />
      </div>

      <div className="absolute -bottom-2 text-center">
        <span className={`text-3xl font-bold ${getRiskColor().split(" ")[0]}`}>{level}</span>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Flood Risk Level</p>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();

  const [riskLevel, setRiskLevel] = useState(RiskLevel.MODERATE);

  const [weather, setWeather] = useState({
    rainfall: 0,
    windSpeed: 0,
    waterLevel: 2.3,
    trend: "stable",
    condition: "Loading...",
    locationName: "Locating...",
  });

  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  const [alerts, setAlerts] = useState([
    {
      id: "1",
      type: "warning",
      severity: "high",
      title: "River Level Rising",
      message: "Water levels at East Bank have exceeded 2.0m. Prepare for potential evacuation.",
      timestamp: "10 min ago",
    },
  ]);

  useEffect(() => {
    const initWeather = async () => {
      let lat = 14.9495;
      let lng = 120.7587;

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (e) {
          console.log("Geolocation fallback used.");
        }
      }

      try {
        const data = await fetchRealtimeWeather(lat, lng);

        setWeather((prev) => ({
          ...prev,
          rainfall: data.stats.rainfall,
          windSpeed: data.stats.windSpeed,
          condition: data.stats.condition,
          locationName: data.stats.locationName,
        }));

        if (data.stats.rainfall > 50 || data.stats.windSpeed > 100) setRiskLevel(RiskLevel.CRITICAL);
        else if (data.stats.rainfall > 20 || data.stats.windSpeed > 60) setRiskLevel(RiskLevel.HIGH);
        else if (data.stats.rainfall > 5 || data.stats.windSpeed > 30) setRiskLevel(RiskLevel.MODERATE);
        else setRiskLevel(RiskLevel.LOW);

        if (data.alerts.length > 0) {
          const newAlerts = data.alerts.map((a, i) => ({
            id: `real-${i}`,
            type: "advisory",
            severity: "medium",
            title: "Local Weather Alert",
            message: a,
            timestamp: "Just now",
          }));
          setAlerts((prev) => [...newAlerts, ...prev]);
        }
      } catch (error) {
        console.error("Failed to load real weather", error);
        setWeather((prev) => ({
          ...prev,
          condition: "Unavailable",
          locationName: "Offline Mode",
        }));
      } finally {
        setIsLoadingWeather(false);
      }
    };

    initWeather();
  }, []);

  return (
     <div className="max-w-7xl mx-auto pb-20">
      {/* Location Header Update */}
      <div className="mb-6 flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">{weather.locationName}</h2>
            <p className="text-slate-500 text-sm flex items-center">
               {isLoadingWeather ? 'Updating live conditions...' : weather.condition}
            </p>
         </div>
         {isLoadingWeather && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Risk Gauge Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-between border border-gray-100">
          <h3 className="text-gray-500 font-medium self-start mb-4">Current Status</h3>
          <RiskGauge level={riskLevel} />
          <div className="w-full mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-xl flex items-center">
              <CloudRain className="text-blue-500 w-8 h-8 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Rainfall</p>
                <p className="text-lg font-bold text-gray-800">{weather.rainfall}mm</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl flex items-center">
              <Wind className="text-slate-500 w-8 h-8 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Wind</p>
                <p className="text-lg font-bold text-gray-800">{weather.windSpeed}kph</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Map / Weather Map */}
        <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden relative border border-slate-800 min-h-[300px] group flex flex-col">
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/120.7587,14.9495,12,0/800x600?access_token=placeholder')] bg-cover opacity-50"></div>
          
          {/* Weather Overlay */}
          <div className="relative z-10 p-6 flex-1 flex flex-col justify-between bg-linear-to-b from-slate-900/80 to-transparent">
             <div className="flex justify-between items-start">
               <span className="bg-slate-900/90 text-white text-xs font-bold px-2 py-1 rounded border border-slate-700 shadow-sm">
                  Live Incident Map
               </span>
               <div className="flex flex-col items-end">
                  <div className="flex items-center text-white">
                     <CloudRain className="w-4 h-4 mr-1 text-blue-400" />
                     <span className="font-bold text-lg">{weather.rainfall}mm</span>
                  </div>
                  <span className="text-[10px] text-slate-300">Precipitation</span>
               </div>
             </div>

             {/* Mock Incidents on "Map" */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[40%] left-[60%] animate-pulse">
                   <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1 rounded whitespace-nowrap">High Water</div>
                </div>
             </div>
          </div>
          
          {/* Bottom Controls */}
          <div className="relative z-10 bg-slate-900/90 p-3 border-t border-slate-700 flex justify-between items-center backdrop-blur-sm">
             <div className="text-xs text-slate-400">
               <span className="w-2 h-2 inline-block rounded-full bg-red-500 mr-1"></span> Flood
               <span className="w-2 h-2 inline-block rounded-full bg-green-500 ml-3 mr-1"></span> Safe
             </div>
             <button onClick={() => navigate('/report')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">
                View Full Map
             </button>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Latest Alerts
            </h3>
            <span className="text-xs text-blue-600 font-medium cursor-pointer">View All</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {alerts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No active alerts for your area.</p>
            ) : alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-500' : 
                alert.severity === 'medium' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                     alert.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>{alert.type}</span>
                  <span className="text-xs text-gray-400">{alert.timestamp}</span>
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Section: Protocol, Trends & Emergency Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Water Level Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full">
           <h3 className="text-gray-500 font-medium mb-4">Water Level Trend (Last 12h)</h3>
           <div className="flex-1 min-h-[180px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={waterLevelData}>
                 <defs>
                   <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis hide domain={[0, 4]} />
                 <Tooltip />
                 <Area type="monotone" dataKey="level" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLevel)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Right Column: Actions & Emergency Contacts */}
        <div className="flex flex-col gap-4">
          
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/evacuation')}
              className="bg-green-50 rounded-2xl p-5 border border-green-100 flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <Shield className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-bold text-green-900">Evacuation Centers</h4>
              <p className="text-xs text-green-700 mt-1">6 Centers Monitored</p>
            </div>
            <div 
              onClick={() => navigate('/report')}
              className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mb-3 text-indigo-600">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-indigo-900">Report Incident</h4>
              <p className="text-xs text-indigo-700 mt-1">Submit Situation Update</p>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <h4 className="font-bold text-red-900 flex items-center mb-3 text-sm uppercase tracking-wide">
              <Phone className="w-5 h-5 mr-2" />
              Emergency Contacts
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-red-100 pb-2 border-dashed">
                <span className="text-sm text-red-800 font-medium">MDRRMO Apalit</span>
                <a href="tel:0580230313" className="font-bold text-red-900 hover:bg-red-200 px-2 py-1 rounded transition-colors">(058) 023-0313</a>
              </div>
              <div className="flex justify-between items-center border-b border-red-100 pb-2 border-dashed">
                <span className="text-sm text-red-800 font-medium">National Hotline</span>
                <a href="tel:911" className="font-bold text-red-900 text-lg hover:bg-red-200 px-2 py-1 rounded transition-colors">911</a>
              </div>
              <div className="text-xs text-red-700 pt-1 flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold mr-1">Barangay Halls:</span> 
                <span>8:00 AM - 5:00 PM (Weekdays)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/chat')}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-30 ${
          riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL ? 'animate-pulse shadow-red-500/50 ring-4 ring-red-500/30 bg-red-600 hover:bg-red-500' : 'shadow-blue-500/40'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
   
 
};
