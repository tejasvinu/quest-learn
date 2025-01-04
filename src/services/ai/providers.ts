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
        messages: [
          {
            role: "system",
            content: "You are an educational story generator. Always respond with valid JSON that matches the required structure. Never include markdown formatting or code blocks in your response."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
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
        // Handle raw text content from Gemini response
        let responseText = '';
        if (typeof response === 'string') {
            responseText = response;
        } else {
            responseText = response.response?.text() || response.text?.() || response.toString();
        }
        
        // Clean up the response text
        responseText = responseText.trim();
        
        // If response starts and ends with backticks, remove them
        if (responseText.startsWith('```json')) {
            responseText = responseText.slice(7);
        }
        if (responseText.startsWith('```')) {
            responseText = responseText.slice(3);
        }
        if (responseText.endsWith('```')) {
            responseText = responseText.slice(0, -3);
        }

        console.log('Cleaning Gemini response:', responseText);
        
        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parsing error:', e);
            // If not valid JSON, create a basic story structure
            return {
                story: responseText,
                choices: [
                    { text: "Continue", expectedOutcome: "Progress the story" },
                    { text: "Ask for clarification", expectedOutcome: "Get more details" }
                ],
                metrics: {
                    comprehensionLevel: 0,
                    topicsCovered: [],
                    suggestedFocus: ''
                }
            };
        }
        
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
        const responseText = response.choices[0]?.message?.content || '';
        console.log('Raw Groq response text:', responseText);
        
        // Ensure we're working with clean JSON
        const cleanedText = responseText.replace(/```json\s*|\s*```/g, '').trim();
        console.log('Cleaned Groq response:', cleanedText);
        
        const parsed = JSON.parse(cleanedText);
        
        // Check if this is a review response
        if (parsed.choiceAnalysis || parsed.overallReview) {
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

        // Return standard story response format
        return {
            story: parsed.story || '',
            choices: Array.isArray(parsed.choices) ? parsed.choices.map(choice => ({
                text: choice.text || '',
                expectedOutcome: choice.expectedOutcome || ''
            })) : [],
            metrics: {
                comprehensionLevel: parsed.progressMetrics?.comprehensionLevel || 0,
                topicsCovered: Array.isArray(parsed.progressMetrics?.topicsCovered) 
                    ? parsed.progressMetrics.topicsCovered 
                    : [],
                suggestedFocus: parsed.progressMetrics?.suggestedFocus || ''
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
