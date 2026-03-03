// services/chatbotService.js - Clean Chatbot Service
import Groq from 'groq-sdk';

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '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' });

// Conversation history storage
const conversationHistory = new Map();

// Get conversation history for a user
const getConversationHistory = (userId) => {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
};

// Add message to conversation history
const addToHistory = (userId, role, content) => {
  const history = getConversationHistory(userId);
  history.push({ role, content, timestamp: new Date().toISOString() });
  
  // Keep only last 10 messages
  if (history.length > 10) {
    history.shift();
  }
  
  conversationHistory.set(userId, history);
};

// Clear conversation history
const clearHistory = (userId) => {
  conversationHistory.delete(userId);
};

// Get chat response from Groq API
export const getChatResponse = async (userId, message) => {
  try {
    // Validate inputs
    if (!userId || !message) {
      throw new Error('User ID and message are required');
    }

    // Add user message to history
    addToHistory(userId, 'User', message);

    // Build messages array for Groq
    const messages = [
      {
        role: "system",
        content: `You are FarmAssist, a helpful AI assistant. You can answer ANY question the user asks.

You are knowledgeable about:
- Math problems and calculations
- Coding questions and programming
- Creative writing, stories, and poems
- Science, history, and general knowledge
- Technology and everyday questions
- Farming equipment rental, bidding systems, and marketplace transactions
- Any other topic the user is interested in

Be helpful, friendly, and use simple language. If you don't know something, say so honestly. Keep responses concise but informative. Provide accurate information for any topic.`
      }
    ];

    // Add recent conversation history (last 5 messages)
    const history = getConversationHistory(userId);
    const recentHistory = history.slice(-5);
    for (const msg of recentHistory) {
      if (msg.role === 'User' || msg.role === 'Assistant') {
        messages.push({
          role: msg.role.toLowerCase(),
          content: msg.content
        });
      }
    }

    // Add current user message if not already in history
    if (recentHistory.length === 0 || recentHistory[recentHistory.length - 1].content !== message) {
      messages.push({
        role: "user",
        content: message
      });
    }

    // Get response from Groq
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024
    });

    const response = completion.choices[0].message.content;
    
    // Add assistant response to history
    addToHistory(userId, 'Assistant', response);

    return {
      success: true,
      response: response.trim(),
      history: getConversationHistory(userId)
    };

  } catch (error) {
    console.error('Chatbot service error:', error);
    
    // Handle different types of errors
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error.message.includes('API_KEY')) {
      errorMessage = 'API key error. Please check your configuration.';
    } else if (error.message.includes('RATE_LIMIT')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.message.includes('NETWORK')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    }

    return {
      success: false,
      error: errorMessage,
      details: error.message
    };
  }
};

// Get conversation history for frontend
export const getConversationHistoryForUser = (userId) => {
  return getConversationHistory(userId);
};

// Clear user conversation
export const clearUserConversation = (userId) => {
  clearHistory(userId);
  return { success: true, message: 'Conversation cleared' };
};

export default {
  getChatResponse,
  getConversationHistoryForUser,
  clearUserConversation
};
