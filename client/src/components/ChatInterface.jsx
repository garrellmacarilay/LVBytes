import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Shield } from './Icons';
import { createChatSession, sendMessageStream, testGeminiConnection, sendMessageViaServer } from '../services/geminiService';
import ChatStorageService from '../services/chatStorageService';

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

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

      // Try server API first (most reliable)
      try {
        console.log("Using server API...");
        aiResponse = await sendMessageViaServer(userMsg.text);
        
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
            const stream = await sendMessageStream(chatSession, userMsg.text);
            
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
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

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