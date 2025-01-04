import type { NextApiRequest, NextApiResponse } from 'next';
import { getAIResponse } from '../../src/services/ai/providers';
import { AIConfig } from '../../src/types/ai';

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

interface GameHistory {
    story: string;
    choice: {
        text: string;
        difficulty: string;
        learningStyle: string;
        timestamp: Date;
    };
    metrics: {
        comprehensionScore: number;
        timeSpent: number;
        topicsCovered: string[];
    };
}

interface EnhancedReview {
    choiceAnalysis: {
        choice: string;
        explanation: string;
    }[];
    overallReview: string;
    rating: number;
    suggestedTopics: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { input, topic, history, isFinal, provider, apiKey } = req.body;
            
            if (!apiKey || !provider) {
                res.status(400).json({ error: 'API key and provider are required' });
                return;
            }

            if (!topic) {
                res.status(400).json({ error: 'Topic is required' });
                return;
            }

            const aiConfig: AIConfig = {
                provider,
                apiKey
            };

            if (isFinal && history) {
                const review = await getFinalReview(history, topic, aiConfig);
                res.status(200).json(review);
                return;
            }

            const story = await getStoryResponse(input || '', topic, aiConfig, history || []);
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

async function getStoryResponse(input: string, topic: string, aiConfig: AIConfig, history: GameHistory[] = []) {
    try {
        const prompt = `You are an engaging educational game about ${topic}. Your role is to create an 
interactive learning experience that adapts to the user's understanding.

CORE OBJECTIVES:
- Maintain educational accuracy and age-appropriate content
- Create branching narratives that explore different aspects of ${topic}
- Include subtle assessments of user understanding
- Progress naturally based on user responses

STORY GUIDELINES:
- Each story segment should be 150-200 words
- Include relevant facts and concepts about ${topic}
- Create immersive scenarios that require critical thinking
- Reference previous choices to maintain continuity
- Include occasional "knowledge checks" within the narrative

CHOICE GUIDELINES:
- Provide 3-4 meaningful choices
- Each choice should represent different approaches:
  * Understanding core concepts
  * Applying knowledge
  * Problem-solving
  * Exploring context and connections

RESPONSE FORMAT:
{
  "story": "your educational story text here",
  "choices": [
    {
      "text": "choice text",
      "expectedOutcome": "understanding of X concept"
    }
  ],
  "currentTopics": ["specific concepts being covered"],
  "progressMetrics": {
    "comprehensionLevel": 1-5,
    "topicsCovered": ["concept1", "concept2"],
    "suggestedFocus": "area that needs more attention"
  }
}`;
        const response = await getAIResponse(aiConfig.provider, aiConfig.apiKey, prompt);
        return {
            story: response.story || "There was an error generating the story.",
            choices: Array.isArray(response.choices) ? response.choices : [],
            metrics: response.metrics || { 
                comprehensionLevel: 0, 
                topicsCovered: [], 
                suggestedFocus: "" 
            }
        };
    } catch (error) {
        console.error('AI Service Error:', error);
        return {
            story: "There was an error generating the story. Please try again.",
            choices: [{ text: "Start Over", expectedOutcome: "restart the learning journey" }],
            metrics: { comprehensionLevel: 0, topicsCovered: [], suggestedFocus: "" }
        };
    }
}

async function getFinalReview(history: GameHistory[], topic: string, aiConfig: AIConfig): Promise<EnhancedReview> {
    try {
        const prompt = `Provide a friendly, personal review of the user's learning journey about ${topic}.

ANALYSIS REQUIREMENTS:
1. Talk directly to the user ("you", "your")
2. Use a conversational, encouraging tone
3. Keep feedback constructive and supportive
4. Make specific references to their choices
5. Be engaging but educational

Based on this history: ${JSON.stringify(history)}

Provide a friendly educational review following this structure:
{
  "choiceAnalysis": [{
    "choice": "user's choice",
    "explanation": "personal analysis including:
      - What this choice showed about your understanding
      - Other approaches you could have tried
      - Key concepts you grasped or might want to review
      - How your critical thinking showed here"
  }],
  "overallReview": "friendly learning assessment including:
    - What you did really well
    - How your approach to learning worked
    - Concepts you've clearly mastered
    - Areas where you might want to spend more time
    - Any misconceptions we should clear up",
  "rating": "score (1-5) based on:
    - How well you understood the concepts
    - Your critical thinking
    - Your engagement with the material
    - Your learning progress",
  "suggestedTopics": [
    "interesting related topics you might enjoy",
    "fundamentals you might want to brush up on",
    "cool advanced concepts you're ready for"
  ]
}`;
        const response = await getAIResponse(aiConfig.provider, aiConfig.apiKey, prompt);
        // Transform response to EnhancedReview format
        return {
            choiceAnalysis: response.choiceAnalysis,
            overallReview: response.overallReview,
            rating: response.rating,
            suggestedTopics: response.suggestedTopics
        };
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