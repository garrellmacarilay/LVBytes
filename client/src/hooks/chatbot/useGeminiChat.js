import { useState } from "react";
import api from "../../utils/api";

/**
 * Custom hook to send prompts to Gemini AI and get a response
 */
export function useGeminiChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * sendPrompt - send a prompt to the Gemini API
   * @param {string} prompt - the user input
   */
  const sendPrompt = async (prompt) => {
    if (!prompt) return;

    setLoading(true);
    setError(null);

     const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    text: prompt,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, userMsg]);

  try {
    const res = await api.post("/ask-ai", { prompt });

    // Add AI message
    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: res.data.response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'model',
          text: "Connection error. Please try again.",
          timestamp: new Date()
        }
      ]);
        setError(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

  return { messages, loading, error, sendPrompt };
}
