import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure API Key is available
const apiKey = import.meta.env.VITE_APP_API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenerativeAI({ apiKey: apiKey || '' });
if (!ai.chats) {
  console.error("ai.chats is undefined. Check your API key or SDK version.");
}
// System instruction for the safety assistant
const SYSTEM_INSTRUCTION = `
You are FloodGuard AI, a specialized safety assistant for flood and disaster management. 
Your tone should be calm, reassuring, and concise. 
Prioritize clear instructions, evacuation guidance, and safety protocols.
Use bullet points for lists.
If a user asks about immediate life-threatening situations, advise them to contact emergency services (911 or local equivalent) immediately.
Do not provide medical advice.
Keep responses short and easy to read on mobile devices during emergencies.
`;

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });
};

export const sendMessageStream = async (chat, message) => {
  try {
    const response = await chat.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const fetchRealtimeWeather = async (lat, lng) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide realistic simulated real-time weather stats and alerts for location at coordinates ${lat}, ${lng} in the Philippines (likely Central Luzon/Pampanga). 
      Assume it is currently rainy season.
      Return the data in JSON format matching the schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            stats: {
              type: 'object',
              properties: {
                rainfall: { type: 'number', description: "Rainfall in mm, e.g. 25.5" },
                windSpeed: { type: 'number', description: "Wind speed in km/h, e.g. 45" },
                waterLevel: { type: 'number', description: "River water level in meters, e.g. 2.1" },
                trend: { type: 'string', enum: ['rising', 'falling', 'stable'] },
                condition: { type: 'string', description: "Short condition description, e.g. 'Heavy Rain'" },
                locationName: { type: 'string', description: "City or Municipality name" }
              },
              required: ['rainfall', 'windSpeed', 'waterLevel', 'trend', 'condition', 'locationName']
            },
            alerts: {
              type: 'array',
              items: { type: 'string' },
              description: "List of active short alert messages for the area"
            }
          },
          required: ['stats', 'alerts']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Error fetching weather from Gemini:", error);
    return {
      stats: {
        rainfall: 0,
        windSpeed: 0,
        waterLevel: 0,
        trend: 'stable',
        condition: 'Unknown',
        locationName: 'Unknown Location'
      },
      alerts: []
    };
  }
};
