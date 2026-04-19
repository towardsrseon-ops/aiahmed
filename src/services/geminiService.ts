import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty, TranslationResult, VocabularyWord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const geminiService = {
  async generateQuestions(content: string, difficulty: Difficulty): Promise<Question[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the following educational content, generate 5 multiple-choice questions for a student with weak English.
      Content: ${content}
      Difficulty level: ${difficulty}

      Requirements:
      1. Questions must be in English.
      2. Provide 4 options (A, B, C, D).
      3. Provide a simple Arabic explanation (Iraqi-friendly) specifically teaching the grammar or vocabulary point.
      4. Extract 3-5 key English words with Arabic meaning, a simple explanation, and an example.
      5. Breakdown the QUESTION text into small chunks with their meanings.
      6. Provide 2-3 "How to think" hints in Arabic.
      7. Provide Literal vs Real context meanings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER, description: "Index 0-3" },
              explanation: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  arabic: { type: Type.STRING }
                },
                required: ["english", "arabic"]
              },
              arabicExplanation: { type: Type.STRING, description: "Main Iraqi Arabic summary" },
              chunks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    part: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["part", "meaning"]
                }
              },
              howToThink: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              contextLiteral: { type: Type.STRING },
              contextReal: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    english: { type: Type.STRING },
                    arabic: { type: Type.STRING },
                    simpleExplanation: { type: Type.STRING },
                    example: { type: Type.STRING }
                  },
                  required: ["english", "arabic", "simpleExplanation", "example"]
                }
              }
            },
            required: ["text", "options", "correctAnswer", "explanation", "arabicExplanation", "keywords", "chunks", "howToThink", "contextLiteral", "contextReal"]
          }
        }
      }
    });

    const questions: any[] = JSON.parse(response.text);
    return questions.map((q, idx) => ({
      ...q,
      id: `q-${idx}-${Date.now()}`,
      difficulty
    })) as Question[];
  },

  async translateAndExplain(text: string): Promise<TranslationResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate and explain the following English text to a student who has very weak English.
      Text: "${text}"

      Include:
      1. A very simple Iraqi Arabic explanation.
      2. A list of key vocabulary with simple explanation and example.
      3. A breakdown of the sentence into simpler parts.
      4. A "Think Strategy" in Arabic on how to tackle this text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleArabic: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  arabic: { type: Type.STRING },
                  simpleExplanation: { type: Type.STRING },
                  example: { type: Type.STRING }
                },
                required: ["english", "arabic", "simpleExplanation", "example"]
              }
            },
            thinkStrategy: { type: Type.STRING },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["part", "explanation"]
              }
            }
          },
          required: ["simpleArabic", "vocabulary", "breakdown", "thinkStrategy"]
        }
      }
    });

    return JSON.parse(response.text) as TranslationResult;
  }
};
