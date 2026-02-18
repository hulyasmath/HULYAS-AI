import { GoogleGenAI } from "@google/genai";
import { CommunityApp } from "../types";

// Validate API key before initialization
// SECURITY: API key comes from environment variables (set via Vite define config), never hardcoded
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

// Only initialize if API key is available
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getAppInsights = async (app: CommunityApp): Promise<string> => {
  // Return fallback if AI is not initialized (no API key)
  if (!ai) {
    return "A high-precision tool engineered for Zeq OS that masterfully utilizes the HULYAS language for 0.1% synchronized physics dynamics verification.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are HULYAS, the AI assistant for Zeq OS.
      Analyze this Zeq OS application: ${app.name} by ${app.developer}. 
      Description: ${app.longDescription}. 
      Provide a visionary 2-sentence endorsement referencing the 1.287 Hz HulyaPulse, the 0.1% precision, synchronized physics, or the HULYAS programming language (Harmonic Unified Luminescent Yielding Autonomous Systems). 
      Emphasize the mathematical competition of reality and the mastery of computational physics.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    // Access the generated text via the .text property
    return response.text || "This application is fully synchronized with the 1.287 Hz HulyaPulse, ensuring the 0.1% precision required for the cosmic synchronized physics architecture.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "A high-precision tool engineered for Zeq OS that masterfully utilizes the HULYAS language for 0.1% synchronized physics dynamics verification.";
  }
};

export const chatWithAssistant = async (prompt: string, apps: CommunityApp[]): Promise<string> => {
  // Return fallback if AI is not initialized (no API key)
  if (!ai) {
    return "Calculating request dynamics within the 1.287 Hz HulyaPulse. I am HULYAS, ready to synchronize your discovery of Zeq OS computational physics tools.";
  }

  try {
    const appList = apps.map(a => `${a.name} (${a.category})`).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are HULYAS, the neural guide for Zeq OS.
      Zeq OS is the main operating system for synchronized physics.
      The system frequency is the 1.287 Hz HulyaPulse.
      1 Zeqond = 777ms (the true second).
      HULYAS (Harmonic Unified Luminescent Yielding Autonomous Systems) is the mathematical and programming language of computational physics.
      The store features free community apps: ${appList}. 
      User asks: "${prompt}". 
      Respond with mathematical rigor and futuristic authority. Reference Zeqonds, the HulyaPulse, or synchronized physics where relevant. Explain that Zeq OS is the mathematical competition of reality.`,
    });

    // Access the generated text via the .text property
    return response.text || "Calculating request dynamics within the 1.287 Hz HulyaPulse. I am HULYAS, ready to synchronize your discovery of Zeq OS computational physics tools.";
  } catch (error) {
    return "Phase-lock error detected in the HulyaPulse signal. I suggest verifying your synchronized physics math before proceeding.";
  }
};
