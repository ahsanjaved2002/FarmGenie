import { useState } from "react";
import { useToast } from "./use-toast";

export const useSimpleFarmingChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Generate a simple user ID (in production, this would come from auth)
  const getUserId = () => {
    let userId = localStorage.getItem('chatbot-user-id');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatbot-user-id', userId);
    }
    return userId;
  };

  const sendMessage = async (input) => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { 
      role: "user", 
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const CHAT_URL = import.meta.env.PROD 
        ? 'https://farmgenie-alpha.vercel.app/api/chat'
        : 'http://localhost:3000/api/chat';

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          userId: getUserId()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that request.";

      // Add assistant message
      const assistantMessage = {
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      
      // Add error message
      let errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error.message.includes('API key')) {
        errorMessage = "API configuration error. Please contact support.";
      } else if (error.message.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message.includes('quota')) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      }
      
      const errorResponse = {
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now(),
        isError: true
      };

      setMessages(prev => [...prev, errorResponse]);

      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    // Also clear conversation history on server
    const userId = getUserId();
    fetch(`${import.meta.env.PROD ? 'https://farmgenie-alpha.vercel.app' : 'http://localhost:3000'}/api/chat/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }).catch(console.error);
  };

  return { 
    messages, 
    sendMessage, 
    isLoading, 
    clearMessages
  };
};
