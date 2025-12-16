import { GoogleGenAI, Type } from "@google/genai";
import { Attendee, PaymentStatus } from "../types";

// Initialize Gemini Client
// API Key is injected via process.env.API_KEY automatically
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseImportData = async (rawData: string): Promise<Partial<Attendee>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following unstructured data into a structured list of attendees for a class registration system. 
      
      The data might be CSV, a list of names, or natural language.
      If specific fields like 'sessionsRemaining' or 'totalSessions' are missing, infer reasonable defaults (e.g., 10 sessions package) or set to 0 if unknown.
      If payment status is unclear, default to 'Pending'.
      
      Data to parse:
      """
      ${rawData}
      """
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              classType: { type: Type.STRING },
              totalSessions: { type: Type.INTEGER },
              sessionsRemaining: { type: Type.INTEGER },
              paymentStatus: { type: Type.STRING, enum: ["Paid", "Pending", "Overdue"] },
              notes: { type: Type.STRING },
            },
            required: ["name", "classType", "totalSessions", "sessionsRemaining", "paymentStatus"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const parsedData = JSON.parse(text);
    
    // Map string status to Enum
    return parsedData.map((item: any) => ({
        ...item,
        paymentStatus: item.paymentStatus as PaymentStatus
    }));

  } catch (error) {
    console.error("Error parsing data with Gemini:", error);
    throw new Error("Failed to interpret data. Please check the format and try again.");
  }
};

export const generateInsights = async (attendees: Attendee[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this attendee list and give me 3 short, bulleted actionable insights for the business owner (e.g., regarding retention, payments, or popular classes). Keep it very brief.
      
      Data: ${JSON.stringify(attendees.map(a => ({ class: a.classType, remaining: a.sessionsRemaining, status: a.paymentStatus })))}
      `,
    });
    return response.text || "No insights available.";
  } catch (e) {
    return "Could not generate insights at this time.";
  }
}
