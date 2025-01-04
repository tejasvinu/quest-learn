export type AIProvider = 'gemini' | 'groq';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface AIResponse {
  story: string;
  choices: {
    text: string;
    expectedOutcome: string;
  }[];
  metrics: {
    comprehensionLevel: number;
    topicsCovered: string[];
    suggestedFocus: string;
  };
}
