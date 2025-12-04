import React, { useState, useEffect } from 'react';
import ChatStorageService from '../services/chatStorageService';

/**
 * Chat History Viewer - Admin/Debug Component
 * Shows recent conversations and their messages
 */
export const ChatHistoryViewer = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const loadUserConversations = async () => {
    setLoading(true);
    try {
      const currentUserId = userId || ChatStorageService.getUserId();
      const userConversations = await ChatStorageService.getUserConversations(currentUserId, 20);
      setConversations(userConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    setLoading(true);
    try {
      const conversationMessages = await ChatStorageService.getConversationHistory(conversationId);
      setMessages(conversationMessages);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserConversations();
  }, [userId]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate(); // Firestore Timestamp
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp); // ISO string
    } else {
      date = timestamp; // Regular Date object
    }
    
    return date.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900">Chat History Viewer</h2>
          <p className="text-sm text-blue-700 mt-1">View and analyze conversation logs from Firestore</p>
        </div>

        <div className="p-6">
          {/* User ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID (leave empty for current user):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={`Current: ${ChatStorageService.getUserId()}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={loadUserConversations}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversations List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Conversations ({conversations.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => loadConversationMessages(conversation.id)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {conversation.id.substring(0, 8)}...
                      </span>
                      <span className="text-xs text-gray-500">
                        {conversation.messageCount || 0} msgs
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Started: {formatTimestamp(conversation.startTime)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: {conversation.status || 'active'}
                    </div>
                  </button>
                ))}
                {conversations.length === 0 && !loading && (
                  <p className="text-gray-500 text-center py-4">No conversations found</p>
                )}
              </div>
            </div>

            {/* Messages List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Messages {selectedConversation ? `(${messages.length})` : ''}
              </h3>
              {selectedConversation ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-100 ml-4' 
                          : 'bg-gray-100 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${
                          message.role === 'user' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {message.role === 'user' ? 'User' : 'AI'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {message.text}
                      </p>
                      {message.metadata && (
                        <div className="mt-2 text-xs text-gray-400">
                          Type: {message.metadata.messageType || 'unknown'}
                          {message.metadata.apiUsed && ` | API: ${message.metadata.apiUsed}`}
                        </div>
                      )}
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No messages in this conversation</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a conversation to view messages
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryViewer;