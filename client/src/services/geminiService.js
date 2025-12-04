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

// Create chat session with fallback models
export const createChatSession = () => {
  const modelNames = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-flash-latest", "gemini-pro-latest"];
  
  if (!apiKey) {
    throw new Error("API_KEY is missing - check your .env file");
  }
  
  for (const modelName of modelNames) {
    try {
      console.log(`Creating chat session with model: ${modelName}`);
      
      const model = ai.getGenerativeModel({ 
        model: modelName
      });
      
      const chatSession = model.startChat({
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        }
      });
      
      console.log(`✅ Chat session created successfully with ${modelName}`);
      return chatSession;
    } catch (error) {
      console.warn(`❌ Model ${modelName} failed for chat session:`, error.message);
      continue;
    }
  }
  
  throw new Error("All Gemini models failed for chat session creation");
};

// Test Gemini API connection
export const testGeminiConnection = async () => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, respond with 'Connection successful'");
    const response = await result.response;
    const text = response.text();
    console.log("✅ Gemini connection test successful:", text);
    return text;
  } catch (error) {
    console.error("❌ Gemini connection test failed:", error);
    throw error;
  }
};

// Send chat message as a stream
export const sendMessageStream = async (chat, message) => {
  try {
    if (!chat) {
      throw new Error("Chat session not initialized");
    }
    
    console.log("Sending message to Gemini:", message);
    const response = await chat.sendMessageStream(message);
    console.log("Gemini response received");
    
    return response;
  } catch (error) {
    console.error("Gemini API Stream Error:", error);
    
    // Provide more specific error information
    if (error.message?.includes('API_KEY')) {
      throw new Error("API_KEY configuration issue: " + error.message);
    } else if (error.message?.includes('quota')) {
      throw new Error("quota exceeded: " + error.message);
    } else if (!navigator.onLine) {
      throw new Error("network connectivity issue");
    }
    
    throw error;
  }
};

// Fallback: Send message through server API
export const sendMessageViaServer = async (message) => {
  try {
    const response = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Server API error:", error);
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
