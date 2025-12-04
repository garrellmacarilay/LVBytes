import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Collection names
const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

/**
 * Chat Storage Service for Firebase Firestore
 * Handles conversation logging and retrieval for AI chat sessions
 */
export class ChatStorageService {
  
  /**
   * Create a new conversation session
   * @param {string} userId - User identifier (can be anonymous ID)
   * @param {Object} metadata - Additional metadata like user agent, location, etc.
   * @returns {Promise<string>} - Conversation ID
   */
  static async createConversation(userId = 'anonymous', metadata = {}) {
    try {
      const conversationData = {
        userId,
        startTime: serverTimestamp(),
        lastActivity: serverTimestamp(),
        messageCount: 0,
        status: 'active',
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };

      const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
      console.log('✅ New conversation created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Log a message to the conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} role - 'user' or 'model'
   * @param {string} text - Message content
   * @param {Object} metadata - Additional message metadata
   * @returns {Promise<string>} - Message ID
   */
  static async logMessage(conversationId, role, text, metadata = {}) {
    try {
      const messageData = {
        conversationId,
        role,
        text,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        metadata: {
          textLength: text.length,
          ...metadata
        }
      };

      // Add message to messages collection
      const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);

      // Update conversation metadata
      await this.updateConversationActivity(conversationId);

      console.log(`✅ Message logged: ${role} - ${text.substring(0, 50)}...`);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Error logging message:', error);
      throw error;
    }
  }

  /**
   * Update conversation activity and message count
   * @param {string} conversationId - Conversation ID
   */
  static async updateConversationActivity(conversationId) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      
      // Get current message count
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      await updateDoc(conversationRef, {
        lastActivity: serverTimestamp(),
        messageCount: messagesSnapshot.size
      });
    } catch (error) {
      console.error('❌ Error updating conversation activity:', error);
    }
  }

  /**
   * Get conversation history
   * @param {string} conversationId - Conversation ID
   * @param {number} limitCount - Maximum number of messages to retrieve
   * @returns {Promise<Array>} - Array of messages
   */
  static async getConversationHistory(conversationId, limitCount = 100) {
    try {
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(messagesQuery);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Retrieved ${messages.length} messages for conversation ${conversationId}`);
      return messages;
    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      throw error;
    }
  }

  /**
   * Get user's recent conversations
   * @param {string} userId - User identifier
   * @param {number} limitCount - Maximum number of conversations to retrieve
   * @returns {Promise<Array>} - Array of conversations
   */
  static async getUserConversations(userId = 'anonymous', limitCount = 20) {
    try {
      const conversationsQuery = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('lastActivity', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(conversationsQuery);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Retrieved ${conversations.length} conversations for user ${userId}`);
      return conversations;
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * End a conversation session
   * @param {string} conversationId - Conversation ID
   */
  static async endConversation(conversationId) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        status: 'ended',
        endTime: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      console.log('✅ Conversation ended:', conversationId);
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
      throw error;
    }
  }

  /**
   * Generate or retrieve user ID (for anonymous users)
   * @returns {string} - User identifier
   */
  static getUserId() {
    let userId = localStorage.getItem('floodguard_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('floodguard_user_id', userId);
    }
    return userId;
  }

  /**
   * Search conversations by content
   * @param {string} searchTerm - Search term
   * @param {string} userId - User identifier
   * @param {number} limitCount - Maximum results
   * @returns {Promise<Array>} - Array of matching messages
   */
  static async searchConversations(searchTerm, userId = 'anonymous', limitCount = 50) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or Elasticsearch
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount * 3) // Get more to filter client-side
      );

      const snapshot = await getDocs(messagesQuery);
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filtering (not ideal for large datasets)
      const filteredMessages = allMessages.filter(message => 
        message.text.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, limitCount);

      console.log(`✅ Found ${filteredMessages.length} messages matching "${searchTerm}"`);
      return filteredMessages;
    } catch (error) {
      console.error('❌ Error searching conversations:', error);
      throw error;
    }
  }
}

export default ChatStorageService;