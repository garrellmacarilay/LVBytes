import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Shield } from '../icons/Icons';
import { createChatSession, sendMessageStream } from '../services/geminiService';

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
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const session = createChatSession();
    setChatSession(session);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${Math.max(newHeight, 46)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = '46px';

    try {
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: new Date(),
        isStreaming: true
      }]);

      const stream = await sendMessageStream(chatSession, userMsg.text);

      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }

      setMessages(prev => prev.map(msg =>
        msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
      ));
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "**Connection Error.** I'm having trouble connecting to the network. Please check your connection or call emergency services if this is life-threatening.",
        timestamp: new Date()
      }]);
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

  const renderContent = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Disclaimer Header */}
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-center shrink-0">
        <Shield className="w-4 h-4 text-blue-600 mr-2" />
        <p className="text-[10px] sm:text-xs text-blue-800 text-center font-medium">
          AI Assistant. For immediate life-threatening emergencies, dial 911.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.role === 'user' ? msg.text : renderContent(msg.text)}
              {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex space-x-1">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        {messages.length < 3 && (
            <div className="flex overflow-x-auto space-x-2 mb-3 pb-1 scrollbar-hide">
            {quickPrompts.map(prompt => (
                <button 
                key={prompt}
                onClick={() => { setInput(prompt); }}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-medium rounded-full border border-slate-200 transition-colors"
                >
                {prompt}
                </button>
            ))}
            </div>
        )}

        <div className="flex items-end space-x-2">
          <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors mb-0.5" title="Voice Input (Beta)">
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about flood risks, safe routes..."
              className="block w-full pl-4 pr-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-inner resize-none min-h-[46px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
