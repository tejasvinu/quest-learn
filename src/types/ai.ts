export type AIProvider = 'gemini' | 'groq';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface AIResponse {
  story?: string;
  choices?: {
    text: string;
    expectedOutcome: string;
  }[];
  metrics?: {
    comprehensionLevel: number;
    topicsCovered: string[];
    suggestedFocus: string;
  };
  // Add new properties for final review
  choiceAnalysis?: {
    choice: string;
    explanation: string;
  }[];
  overallReview?: string;
  rating?: number;
  suggestedTopics?: string[];
}
