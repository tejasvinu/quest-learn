import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

function createAIModel(apiKey: string) {
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
}

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

interface GameChoice {
    choice: string;
    timestamp?: Date;
}

interface GameHistory {
    story: string;
    choice: string;
}

async function getStoryResponse(input: string, topic: string, apiKey: string, history: GameHistory[] = []) {
    try {
        const model = createAIModel(apiKey);
        const chatSession = model.startChat({ generationConfig });

        // First, replay the history
        for (const entry of history) {
            await chatSession.sendMessage(
                `Story context: ${entry.story}\nUser choice: ${entry.choice}`
            );
        }

        // Then send the current input
        const result = await chatSession.sendMessage(
            `You are an educational game about ${topic}. Based on the previous context and the user's choice: "${input}", 
             continue the story. Make sure to build upon previous interactions and maintain continuity.
             Respond only with a valid JSON object.
             Format: {"story": "your educational story text here", "choices": ["choice1", "choice2"]}.
             Each choice should lead to learning different aspects about ${topic}.`
        );

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const jsonStr = jsonMatch[0].replace(/[\n\r]/g, ' ').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Service Error:', error);
        return {
            story: "There was an error generating the story. Please try again.",
            choices: ["Start Over"]
        };
    }
}

async function getFinalReview(history: GameChoice[], topic: string, apiKey: string) {
    try {
        const model = createAIModel(apiKey);
        const reviewChat = model.startChat({ generationConfig });
        const result = await reviewChat.sendMessage(
            `Based on this learning journey about ${topic}, analyze the choices made and provide feedback.
             The history is: ${JSON.stringify(history)}.
             Respond only with a valid JSON object.
             Format: {
               "choiceAnalysis": [{
                 "choice": "user's choice",
                 "explanation": "explanation of the educational impact of this choice"
               }],
               "overallReview": "overall learning journey review",
               "rating": number between 1-5,
               "suggestedTopics": ["related topic 1", "related topic 2"]
             }`
        );

        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('AI Service Error:', error);
        return {
            choiceAnalysis: [],
            overallReview: "Unable to generate review.",
            rating: 3,
            suggestedTopics: []
        };
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { input, topic, history, isFinal, apiKey } = req.body;

            if (!apiKey) {
                res.status(400).json({ error: 'API key is required' });
                return;
            }

            if (!topic) {
                res.status(400).json({ error: 'Topic is required' });
                return;
            }

            if (isFinal && history) {
                const review = await getFinalReview(history, topic, apiKey);
                res.status(200).json(review);
                return;
            }

            // Pass history to getStoryResponse
            const story = await getStoryResponse(input || '', topic, apiKey, history || []);
            res.status(200).json(story);
        } catch (error: unknown) {
            console.error('Handler error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}