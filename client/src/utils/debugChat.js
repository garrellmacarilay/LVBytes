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