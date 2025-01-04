import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { AIProvider, AIResponse } from "../../types/ai";

const createGeminiModel = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },  
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ]
  });
};

const createGroqModel = (apiKey: string) => {
  return new Groq({
    apiKey: apiKey,
  });
};

export async function getAIResponse(
  provider: AIProvider,
  apiKey: string,
  prompt: string
): Promise<AIResponse> {
  console.log('AI Request:', { provider, prompt });

  switch (provider) {
    case 'gemini':
      const geminiModel = createGeminiModel(apiKey);
      const geminiResult = await geminiModel.generateContent(prompt);
      console.log('Gemini Raw Response:', geminiResult);
      const geminiResponse = parseGeminiResponse(geminiResult);
      console.log('Parsed Gemini Response:', geminiResponse);
      return geminiResponse;

    case 'groq':
      const groqModel = createGroqModel(apiKey);
      const groqResult = await groqModel.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-specdec",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
      });
      console.log('Groq Raw Response:', groqResult);
      const groqResponse = parseGroqResponse(groqResult);
      console.log('Parsed Groq Response:', groqResponse);
      return groqResponse;

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// Helper functions to parse responses
function parseGeminiResponse(response: any): AIResponse {
    try {
        console.log('Parsing Gemini response text:', response.text());
        const parsed = JSON.parse(response.text());
        console.log('Parsed Gemini JSON:', parsed);
        
        // Add validation for review format
        if (parsed.choiceAnalysis) {
            return {
                choiceAnalysis: Array.isArray(parsed.choiceAnalysis) ? parsed.choiceAnalysis : [],
                overallReview: parsed.overallReview || '',
                rating: typeof parsed.rating === 'number' ? parsed.rating : 0,
                suggestedTopics: Array.isArray(parsed.suggestedTopics) ? parsed.suggestedTopics : [],
                story: '',
                choices: [],
                metrics: {
                    comprehensionLevel: 0,
                    topicsCovered: [],
                    suggestedFocus: ''
                }
            };
        }

        // Return standard response format
        return {
            story: parsed.story || '',
            choices: Array.isArray(parsed.choices) ? parsed.choices : [],
            metrics: parsed.progressMetrics || {
                comprehensionLevel: 0,
                topicsCovered: [],
                suggestedFocus: ''
            }
        };
    } catch (error) {
        console.error('Gemini parsing error:', error);
        return {
            story: '',
            choices: [],
            metrics: {
                comprehensionLevel: 0,
                topicsCovered: [],
                suggestedFocus: ''
            }
        };
    }
}

function parseGroqResponse(response: any): AIResponse {
    try {
        console.log('Parsing Groq response:', response.choices[0]?.message?.content);
        const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
        console.log('Parsed Groq JSON:', parsed);
        
        // Add validation for review format
        if (parsed.choiceAnalysis) {
            return {
                choiceAnalysis: Array.isArray(parsed.choiceAnalysis) ? parsed.choiceAnalysis : [],
                overallReview: parsed.overallReview || '',
                rating: typeof parsed.rating === 'number' ? parsed.rating : 0,
                suggestedTopics: Array.isArray(parsed.suggestedTopics) ? parsed.suggestedTopics : [],
                story: '',
                choices: [],
                metrics: {
                    comprehensionLevel: 0,
                    topicsCovered: [],
                    suggestedFocus: ''
                }
            };
        }

        // Return standard response format
        return {
            story: parsed.story || '',
            choices: Array.isArray(parsed.choices) ? parsed.choices : [],
            metrics: parsed.progressMetrics || {
                comprehensionLevel: 0,
                topicsCovered: [],
                suggestedFocus: ''
            }
        };
    } catch (error) {
        console.error('Groq parsing error:', error);
        return {
            story: '',
            choices: [],
            metrics: {
                comprehensionLevel: 0,
                topicsCovered: [],
                suggestedFocus: ''
            }
        };
    }
}
