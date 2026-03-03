// Chat API with Groq Integration
import { getChatResponse } from '../src/services/chatbotService.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, userId = 'default-user' } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get the last message from the conversation
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Get response from Groq
    const result = await getChatResponse(userId, lastMessage.content);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: result.error,
        details: result.details 
      });
    }

    // Return response in OpenAI-like format for compatibility
    res.json({
      choices: [{
        message: {
          content: result.response,
          role: 'assistant'
        }
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      history: result.history
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
}
