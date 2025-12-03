import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Use Vite environment variable
const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  console.error("❌ Missing VITE_API_KEY in .env file");
}

// Initialize Gemini
const ai = new GoogleGenerativeAI(apiKey);

// System prompt for your FloodGuard AI
const SYSTEM_INSTRUCTION = `
You are FloodGuard AI, a specialized safety assistant for flood and disaster management. 
Your tone should be calm, reassuring, and concise. 
Prioritize clear instructions, evacuation guidance, and safety protocols.
Use bullet points for lists.
If a user asks about immediate life-threatening situations, advise them to contact emergency services immediately.
Do not provide medical advice.
Keep responses short and easy to read on mobile.
`;

// Create chat session
export const createChatSession = () => {
  return ai.getGenerativeModel({ model: "gemini-2.5-flash" }).startChat({
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.4,
    thinkingConfig: { thinkingBudget: 0 } // disable deep thinking for speed
  });
};

// Send chat message as a stream
export const sendMessageStream = async (chat, message) => {
  try {
    const response = await chat.sendMessageStream(message);
    return response;
  } catch (error) {
    console.error("Gemini API Stream Error:", error);
    throw error;
  }
};

// Fetch AI-generated weather for PH location
export const fetchRealtimeWeather = async (lat, lng) => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Provide realistic simulated real-time weather stats for latitude ${lat}, longitude ${lng} in the Philippines.
Assume rainy season. Return ONLY JSON matching the schema.`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            stats: {
              type: SchemaType.OBJECT,
              properties: {
                rainfall: { type: SchemaType.NUMBER },
                windSpeed: { type: SchemaType.NUMBER },
                waterLevel: { type: SchemaType.NUMBER },
                trend: {
                  type: SchemaType.STRING,
                  enum: ["rising", "falling", "stable"]
                },
                condition: { type: SchemaType.STRING },
                locationName: { type: SchemaType.STRING }
              },
              required: [
                "rainfall",
                "windSpeed",
                "waterLevel",
                "trend",
                "condition",
                "locationName"
              ]
            },
            alerts: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          },
          required: ["stats", "alerts"]
        }
      }
    });

    const text = response.response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Error fetching simulated weather:", error);

    return {
      stats: {
        rainfall: 0,
        windSpeed: 0,
        waterLevel: 0,
        trend: "stable",
        condition: "Unknown",
        locationName: "Unknown"
      },
      alerts: []
    };
  }
};
