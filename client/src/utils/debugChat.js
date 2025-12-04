/**
 * Debug utilities for testing Firestore chat logging
 * Use in browser console for testing
 */

import ChatStorageService from '../services/chatStorageService';

// Debug utilities for chat functionality
export const debugChatSession = (chatSession) => {
  console.log("Chat Session Debug:", {
    exists: !!chatSession,
    type: typeof chatSession,
    methods: chatSession ? Object.getOwnPropertyNames(chatSession) : []
  });
};

export const debugApiKey = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  console.log("API Key Debug:", {
    exists: !!apiKey,
    length: apiKey ? apiKey.length : 0,
    starts: apiKey ? apiKey.substring(0, 10) + "..." : "N/A"
  });
};

// Make utilities available globally for debugging
window.ChatDebug = {
  
  // Test creating a conversation
  async testCreateConversation() {
    try {
      const userId = ChatStorageService.getUserId();
      const conversationId = await ChatStorageService.createConversation(userId, {
        testSession: true,
        debugMode: true
      });
      console.log('✅ Test conversation created:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('❌ Failed to create test conversation:', error);
    }
  },

  // Test logging messages
  async testLogMessages(conversationId) {
    if (!conversationId) {
      conversationId = await this.testCreateConversation();
    }

    try {
      // Log test user message
      await ChatStorageService.logMessage(conversationId, 'user', 
        'This is a test user message for debugging Firestore integration.',
        { testMessage: true, messageType: 'debug_user' }
      );

      // Log test AI response
      await ChatStorageService.logMessage(conversationId, 'model', 
        'This is a test AI response. The Firestore integration is working correctly!',
        { testMessage: true, messageType: 'debug_ai', apiUsed: 'test' }
      );

      console.log('✅ Test messages logged to conversation:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('❌ Failed to log test messages:', error);
    }
  },

  // Get recent conversations
  async getRecentConversations(limit = 10) {
    try {
      const userId = ChatStorageService.getUserId();
      const conversations = await ChatStorageService.getUserConversations(userId, limit);
      console.log(`✅ Retrieved ${conversations.length} conversations:`, conversations);
      return conversations;
    } catch (error) {
      console.error('❌ Failed to get conversations:', error);
    }
  },

  // Get messages from a conversation
  async getConversationMessages(conversationId) {
    try {
      const messages = await ChatStorageService.getConversationHistory(conversationId);
      console.log(`✅ Retrieved ${messages.length} messages:`, messages);
      return messages;
    } catch (error) {
      console.error('❌ Failed to get messages:', error);
    }
  },

  // Full test workflow
  async runFullTest() {
    console.log('🚀 Starting Firestore integration test...');
    
    try {
      // 1. Create conversation
      const conversationId = await this.testCreateConversation();
      
      // 2. Log some test messages
      await this.testLogMessages(conversationId);
      
      // 3. Retrieve and verify
      await this.getConversationMessages(conversationId);
      
      // 4. End conversation
      await ChatStorageService.endConversation(conversationId);
      
      console.log('✅ Full Firestore test completed successfully!');
      return conversationId;
    } catch (error) {
      console.error('❌ Full test failed:', error);
    }
  },

  // Get current user ID
  getCurrentUserId() {
    return ChatStorageService.getUserId();
  },

  // Generate new user ID
  generateNewUserId() {
    localStorage.removeItem('floodguard_user_id');
    return ChatStorageService.getUserId();
  }
};

// Instructions for using in console
console.log(`
🔧 Firebase Chat Debug Utilities Loaded!

Available commands in browser console:
- ChatDebug.runFullTest() - Run complete test workflow
- ChatDebug.testCreateConversation() - Create test conversation
- ChatDebug.testLogMessages(conversationId) - Log test messages
- ChatDebug.getRecentConversations() - Get recent conversations
- ChatDebug.getConversationMessages(conversationId) - Get conversation messages
- ChatDebug.getCurrentUserId() - Get current user ID
- ChatDebug.generateNewUserId() - Generate new user ID

Example usage:
> await ChatDebug.runFullTest()
> await ChatDebug.getRecentConversations()
`);