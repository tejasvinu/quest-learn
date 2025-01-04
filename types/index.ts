export interface GameHistory {
  story: string
  choice: string
}

export interface Review {
  rating: number
  overallReview: string
  choiceAnalysis: ChoiceAnalysis[]
  suggestedTopics: string[]
}

export interface ChoiceAnalysis {
  explanation: string
}

