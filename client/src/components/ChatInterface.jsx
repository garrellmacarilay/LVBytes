import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Shield } from './Icons';
import { createChatSession, sendMessageStream, testGeminiConnection, sendMessageViaServer } from '../services/geminiService';
import ChatStorageService from '../services/chatStorageService';

// Evacuation Centers Data for context
const initialCenters = [
  {
    id: "1",
    name: "Sulipan Covered Court",
    address: "Sulipan Barangay, Apalit (Via Sulipan Road)",
    city: "Apalit",
    coordinates: { lat: 14.9368921, lng: 120.7579668 },
    phone: "(045) 302-7033",
    status: "Open"
  },
  {
    id: "2",
    name: "Capalangan Permanent Evacuation Center",
    address: "525 Alauli Rd, Capalangan Barangay",
    city: "Apalit",
    coordinates: { lat: 14.9309, lng: 120.7681 },
    phone: "(045) 302-9999",
    status: "Open"
  },
  {
    id: "3",
    name: "Apalit Municipal Covered Court",
    address: "San Juan (Poblacion), Municipal Center",
    city: "Apalit",
    coordinates: { lat: 14.949561, lng: 120.758692 },
    phone: "(045) 302-6001",
    status: "Open"
  },
  {
    id: "4",
    name: "Apalit High School",
    address: "151 Sulipan Road, Sulipan/San Vicente",
    city: "Apalit",
    coordinates: { lat: 14.941889, lng: 120.759722 },
    phone: "(045) 302-5555",
    status: "Full"
  },
  {
    id: "5",
    name: "Jose Escaler Memorial School",
    address: "Governor Gonzales Avenue, San Juan",
    city: "Apalit",
    coordinates: { lat: 14.95, lng: 120.758 },
    phone: "(045) 302-4444",
    status: "Open"
  },
  {
    id: "6",
    name: "Tabuyuc Barangay Covered Court",
    address: "Tabuyuc (Santo Rosario) Barangay",
    city: "Apalit",
    coordinates: { lat: 14.9738, lng: 120.7486 },
    phone: "(045) 302-2222",
    status: "Open"
  },
  {
    id: "7",
    name: "San Pedro Elementary School",
    address: "San Pedro Barangay, Apalit",
    city: "Apalit",
    coordinates: { lat: 14.9425, lng: 120.7512 },
    phone: "(045) 302-3333",
    status: "Open"
  },
  {
    id: "8",
    name: "Cansinala Evacuation Center",
    address: "Cansinala Barangay, Apalit",
    city: "Apalit",
    coordinates: { lat: 14.9567, lng: 120.7634 },
    phone: "(045) 302-4444",
    status: "Open"
  }
];

// Helper to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

const deg2rad = deg => deg * (Math.PI / 180);

export const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'model',
      text: 'Hello. I am FloodGuard AI. I can help you with flood risks, evacuation routes, and safety protocols. **How can I assist you right now?**',
      timestamp: new Date(),
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCenters, setNearestCenters] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Function to get top 8 nearest evacuation centers
  const getTop8NearestCenters = (userLat, userLng) => {
    const centersWithDistance = initialCenters.map(center => ({
      ...center,
      distance: calculateDistance(userLat, userLng, center.coordinates.lat, center.coordinates.lng)
    }));
    
    // Sort by distance and take top 8
    return centersWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  };

  // Function to get user location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const fallbackPos = { lat: 14.9495, lng: 120.7587 }; // Apalit center
          
          // If user is > 50km away from Apalit, use fallback for demo
          const distToApalit = calculateDistance(latitude, longitude, fallbackPos.lat, fallbackPos.lng);
          
          if (distToApalit > 50) {
            console.log('User far from Apalit, using simulation location.');
            resolve(fallbackPos);
          } else {
            resolve({ lat: latitude, lng: longitude });
          }
        },
        error => {
          console.warn('Geolocation error, using fallback location:', error);
          resolve({ lat: 14.9495, lng: 120.7587 }); // Apalit fallback
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations
    
    const initializeChat = async () => {
      console.log("🚀 Initializing FloodGuard AI...");
      
      try {
        // Initialize user and conversation tracking
        const currentUserId = ChatStorageService.getUserId();
        setUserId(currentUserId);
        
        const newConversationId = await ChatStorageService.createConversation(currentUserId, {
          sessionType: 'flood_guard_chat',
          userAgent: navigator.userAgent,
          startUrl: window.location.href
        });
        setConversationId(newConversationId);
        
        // Log initial system message
        await ChatStorageService.logMessage(newConversationId, 'model', 
          'Hello. I am FloodGuard AI. I can help you with flood risks, evacuation routes, and safety protocols. How can I assist you right now?',
          { messageType: 'welcome' }
        );
        
        // Get user location and nearest evacuation centers
        try {
          const location = await getUserLocation();
          setUserLocation(location);
          
          const top8Centers = getTop8NearestCenters(location.lat, location.lng);
          setNearestCenters(top8Centers);
          
          // Store location context in conversation
          await ChatStorageService.logMessage(newConversationId, 'system', 
            'Location context established',
            { 
              messageType: 'location_context',
              userLocation: location,
              nearestEvacuationCenters: top8Centers,
              contextSummary: `User located at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} in Apalit, Pampanga. Nearest evacuation centers: ${top8Centers.slice(0, 3).map(c => `${c.name} (${c.distance}km)`).join(', ')}`
            }
          );
          
          console.log(`✅ Location context added: ${top8Centers.length} nearest centers`);
        } catch (locationError) {
          console.warn('Failed to get location context:', locationError);
        }
        
        console.log(`✅ Chat session initialized: User ${currentUserId}, Conversation ${newConversationId}`);
        
        // Test server API first
        try {
          console.log("Testing server API...");
          const testResponse = await sendMessageViaServer("Test");
          console.log("✅ Server API working:", testResponse);
          
          const systemReadyMessage = {
            id: 'server-ready',
            role: 'model',
            text: '**System Ready.** AI service is online. You can now ask me about flood safety and evacuation procedures.',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, systemReadyMessage]);
          
          // Log system ready message
          await ChatStorageService.logMessage(newConversationId, 'model', 
            systemReadyMessage.text,
            { messageType: 'system_ready', apiStatus: 'server_online' }
          );
          
        } catch (serverError) {
          console.warn("❌ Server API failed, trying direct API:", serverError);
          
          // Try direct API as fallback
          try {
            console.log("Testing direct Gemini API...");
            await testGeminiConnection();
            console.log("✅ Direct API connection successful");
            
            const session = createChatSession();
            setChatSession(session);
            
            const directReadyMessage = {
              id: 'direct-ready',
              role: 'model',
              text: '**System Ready.** Direct AI connection established. You can now ask me about flood safety and evacuation procedures.',
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, directReadyMessage]);
            
            // Log direct API ready message
            await ChatStorageService.logMessage(newConversationId, 'model', 
              directReadyMessage.text,
              { messageType: 'system_ready', apiStatus: 'direct_online' }
            );
            
          } catch (directError) {
            console.error("❌ Both APIs failed:", directError);
            
            const errorMessage = {
              id: 'error-init',
              role: 'model',
              text: `**Connection Error.** AI services are temporarily unavailable. Please check your internet connection or try refreshing the page. For immediate emergencies, call 911.`,
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, errorMessage]);
            
            // Log error message
            await ChatStorageService.logMessage(newConversationId, 'model', 
              errorMessage.text,
              { messageType: 'system_error', errorDetails: directError.message }
            );
          }
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize chat storage:', error);
      } finally {
        setIsInitialized(true); // Mark as initialized regardless of success/failure
      }
    };

    initializeChat();
  }, [isInitialized]);

  // Separate useEffect for cleanup handling
  useEffect(() => {
    if (!conversationId) return;

    const handleBeforeUnload = () => {
      if (conversationId) {
        ChatStorageService.endConversation(conversationId).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (conversationId) {
        ChatStorageService.endConversation(conversationId).catch(console.error);
      }
    };
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${Math.max(newHeight, 46)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Log user message to Firestore
    if (conversationId) {
      try {
        await ChatStorageService.logMessage(conversationId, 'user', userMsg.text, {
          messageType: 'user_input',
          timestamp: userMsg.timestamp.toISOString()
        });
      } catch (error) {
        console.warn('Failed to log user message:', error);
      }
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = '46px';
    }

    try {
      const aiMsgId = (Date.now() + 1).toString();

      // AI placeholder
      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          role: 'model',
          text: '',
          timestamp: new Date(),
          isStreaming: true
        }
      ]);

      let aiResponse = '';
      let apiUsed = 'server'; // Track which API was used

      // Prepare context with nearest evacuation centers
      let locationContext = '';
      if (nearestCenters.length > 0) {
        locationContext = `\n\nContext: User is currently in Apalit, Pampanga. Nearest evacuation centers are: ${nearestCenters.map(center => 
          `${center.name} in ${center.city} (${center.distance}km away, coordinates: ${center.lat}, ${center.lng})`
        ).join('; ')}. Use this information to provide relevant, location-specific guidance.`;
      }

      const messageWithContext = userMsg.text + locationContext;

      // Try server API first (most reliable)
      try {
        console.log("Using server API...");
        aiResponse = await sendMessageViaServer(messageWithContext);
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, text: aiResponse } : msg
          )
        );
      } catch (serverError) {
        console.warn("Server API failed, trying direct API:", serverError);
        
        // Try direct Gemini API as fallback if chat session exists
        if (chatSession) {
          try {
            apiUsed = 'direct';
            const stream = await sendMessageStream(chatSession, messageWithContext);
            
            // Handle the streaming response properly
            for await (const chunk of stream.stream) {
              if (chunk.text) {
                aiResponse += chunk.text();
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, text: aiResponse } : msg
                  )
                );
              }
            }
          } catch (streamError) {
            console.error("Both APIs failed:", streamError);
            throw new Error("Both server and direct APIs failed: " + streamError.message);
          }
        } else {
          console.error("No fallback available - no chat session");
          throw new Error("Server API failed and no direct API session available: " + serverError.message);
        }
      }

      // Mark streaming complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
        )
      );

      // Log AI response to Firestore
      if (conversationId && aiResponse) {
        try {
          await ChatStorageService.logMessage(conversationId, 'model', aiResponse, {
            messageType: 'ai_response',
            responseLength: aiResponse.length,
            apiUsed: apiUsed
          });
        } catch (error) {
          console.warn('Failed to log AI response:', error);
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove the placeholder message if it exists
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      
      let errorMessage = "**Connection Error.** I'm having trouble connecting to the AI service.";
      
      if (error.message?.includes('API_KEY')) {
        errorMessage = "**Configuration Error.** API key is missing or invalid.";
      } else if (error.message?.includes('quota')) {
        errorMessage = "**Service Limit.** AI service quota exceeded. Please try again later.";
      } else if (error.message?.includes('network')) {
        errorMessage = "**Network Error.** Please check your internet connection.";
      }
      
      const fullErrorMessage = errorMessage + " For emergency situations, call 911 immediately.";
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: fullErrorMessage,
          timestamp: new Date()
        }
      ]);

      // Log error message to Firestore
      if (conversationId) {
        try {
          await ChatStorageService.logMessage(conversationId, 'model', fullErrorMessage, {
            messageType: 'error_response',
            errorType: error.message?.includes('API_KEY') ? 'api_key' : 
                      error.message?.includes('quota') ? 'quota' : 
                      error.message?.includes('network') ? 'network' : 'unknown',
            originalError: error.message
          });
        } catch (logError) {
          console.warn('Failed to log error message:', logError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Am I in a risk zone?",
    "Where is the nearest evacuation center?",
    "How to sandbag my door?",
    "Emergency hotline numbers"
  ];

  // Basic markdown bold
  const renderContent = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col w-se h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ maxHeight: 'calc(100vh - 8rem)' }}>

      {/* Header */}
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-center shrink-0">
        <Shield className="w-4 h-4 text-blue-600 mr-2" />
        <p className="text-[10px] sm:text-xs text-blue-800 text-center font-medium">
          AI Assistant. For immediate life-threatening emergencies, dial 911.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex w-full ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'user' ? msg.text : renderContent(msg.text)}

              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0">

        {messages.length < 100000 && (
          <div className="flex overflow-x-auto space-x-2 mb-3 pb-1 scrollbar-hide">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-medium rounded-full border border-slate-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2">
          <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors mb-0.5">
            <Mic className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about flood risks, safe routes..."
              className="block w-full pl-4 pr-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-inner resize-none min-h-[46px] max-h-[120px]"
              disabled={isLoading}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ChatInterface;