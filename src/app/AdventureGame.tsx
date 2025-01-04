"use client";
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './Spinner';
import { APIKeyInput } from './APIKeyInput';
import Image from 'next/image';
import { BookOpen, Brain } from 'lucide-react'; // Removed unused imports

// Theme configuration
const THEME = {
  primary: '#6366f1',    // Indigo
  secondary: '#4f46e5',  // Darker indigo
  accent: '#818cf8',     // Light indigo
  success: '#22c55e',    // Green
  warning: '#eab308',    // Yellow
  text: '#1e40af',       // Added missing 'text' property
};

// Define types for props
interface GameHistory {
  story: string;
  choice: string;
}

interface Review {
  rating: number;
  overallReview: string;
  choiceAnalysis: ChoiceAnalysis[];
  suggestedTopics: string[];
}

interface ChoiceAnalysis {
  explanation: string;
}

interface ChoiceButtonProps {
  choice: string;
  onClick: () => void;
  delay: number;
}

interface JourneySummaryCardProps {
  history: GameHistory[];
  topic: string;
  onRestart: () => void;
  review: Review;
}

// Animated choice button component with types
const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onClick, delay }) => (
  <button
    type="button" // Added type attribute
    onClick={onClick}
    className="group relative w-full p-6 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-indigo-100 
               hover:border-indigo-300 hover:bg-white/80 transition-all duration-300 
               hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-4">
      <div className="mt-1 p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
        <BookOpen className="w-5 h-5 text-indigo-600" />
      </div>
      <p className="flex-1 text-left text-lg text-gray-700">{choice}</p>
    </div>
  </button>
);

// Journey summary card component with types
const JourneySummaryCard: React.FC<JourneySummaryCardProps> = ({ history, topic, onRestart, review }) => (
  <div className="bg-white shadow-lg rounded-xl p-8">
    <h2 className="text-3xl font-bold text-black mb-6">Learning Journey Summary</h2>
    <p className="text-black font-medium mb-6">Topic: {topic}</p>
    
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <h3 className="text-xl font-bold text-black">Overall Rating:</h3>
        <div className="ml-3 flex">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="text-black leading-relaxed">{review.overallReview}</p>
    </div>

    <div className="space-y-8">
      {history.map((item, index) => {
        const analysis = review.choiceAnalysis[index];
        return (
          <div key={index} className="border-l-4 border-blue-500 pl-6 py-2">
            <p className="text-black leading-relaxed mb-3">{item.story}</p>
            <p className="text-blue-700 font-medium mb-2">Your choice: {item.choice}</p>
            {analysis && (
              <p className="text-black italic leading-relaxed">{analysis.explanation}</p>
            )}
          </div>
        );
      })}
    </div>

    <div className="mt-8">
      <h3 className="text-xl font-bold text-black mb-4">Suggested Related Topics:</h3>
      <div className="flex flex-wrap gap-3">
        {review.suggestedTopics.map((topic, index) => (
          <span key={index} className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full font-medium">
            {topic}
          </span>
        ))}
      </div>
    </div>

    <button
      type="button"
      onClick={onRestart}
      className="mt-8 w-full p-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
    >
      Start New Adventure
    </button>
  </div>
);

// Move ImportMeta augmentation to global scope
declare global {
  interface ImportMetaEnv {
    VITE_BACKEND_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

function AdventureGame() {
  const [apiKey, setApiKey] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [choices, setChoices] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [review, setReview] = useState<Review | null>(null);
  const [customAnswer, setCustomAnswer] = useState<string>(''); // Add new state for custom answer

  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('geminiApiKey', key);
    setApiKey(key);
  };

  const startNewStory = async () => {
    if (!selectedTopic || !apiKey) return;
    setLoading(true);
    setGameStarted(true);
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: 'Start a new story', 
          topic: selectedTopic,
          apiKey 
        }),
      });
      const data = await response.json();
      setStory(data.story);
      setChoices(data.choices);
    } catch (error) {
      console.error('Error starting story:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeChoice = async (choice: string) => {
    if (!choice.trim()) return;
    setLoading(true);
    
    // Create new history entry but don't update state yet
    const newHistoryEntry = { story, choice };
    const updatedHistory = [...gameHistory, newHistoryEntry];
    
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: choice, 
          topic: selectedTopic,
          apiKey,
          history: updatedHistory // Send the updated history
        }),
      });
      const data = await response.json();
      
      // Only update states after successful response
      setGameHistory(updatedHistory);
      setStory(data.story);
      setChoices(data.choices);
      setCustomAnswer('');
    } catch (error) {
      console.error('Error making choice:', error);
    } finally {
      setLoading(false);
    }
  };

  const finishGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: gameHistory, 
          topic: selectedTopic, 
          isFinal: true,
          apiKey 
        }),
      });
      const finalReview = await response.json();
      setReview(finalReview);
      setIsComplete(true);
    } catch (error) {
      console.error('Error finishing game:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setIsComplete(false);
    setStory('');
    setChoices([]);
    setGameHistory([]);
    setSelectedTopic('');
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center gap-8 mb-12">
            <div className="relative w-48 h-48 bg-white rounded-full shadow-xl 
                          flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
              <Brain className="w-24 h-24 text-indigo-500" />
            </div>
            <h1 className="text-6xl font-bold text-primary mb-3">
              QuestLearn
            </h1>
            <p className="text-2xl text-text">
              Embark on a Journey of Interactive Discovery
            </p>
          </div>
          <APIKeyInput onSubmit={handleApiKeySubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 animate-fadeIn">
          <div className="flex items-center gap-6">
            <div className="hidden sm:block relative">
              <Image
                src="/questlearn.png"
                alt="QuestLearn Logo"
                fill
                className="drop-shadow-lg object-contain" // Changed from object-center to object-contain
                priority
              />
            </div>
            <div>
              <h1 className="text-6xl font-extrabold text-primary">
                QuestLearn
              </h1>
              <p className="text-xl mt-2 text-text">
                Embark on a Journey of Interactive Discovery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleApiKeySubmit('')}
            className="px-6 py-3 text-sm font-medium bg-white hover:bg-blue-50 rounded-xl 
                     border border-blue-200 transition-all duration-300 hover:shadow-lg 
                     hover:scale-105 active:scale-95 text-primary"
          >
            Change API Key
          </button>
        </div>

        {/* Main content */}
        {!gameStarted ? (
          <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 animate-fadeIn
                         border border-blue-200">
            <h2 className="text-4xl font-bold mb-8 animate-slideIn text-primary">
              Choose Your Learning Path
            </h2>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              placeholder="e.g. French Revolution, Machine Learning, Ethics in AI..."
              className="w-full text-accent-700 p-5 border-2 border-accent-200 rounded-xl mb-8 
                       focus:border-accent-400 focus:ring-4 focus:ring-accent-100 transition-all duration-300
                       placeholder:text-accent-400 text-lg animate-slideIn [animation-delay:200ms]"
            />
            <button
              type="button"
              onClick={startNewStory}
              disabled={!selectedTopic.trim()}
              className="w-full p-5 bg-accent-700 text-white text-lg font-medium rounded-xl 
                       hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-300 hover:shadow-lg hover:shadow-accent-300/20
                       hover:scale-[1.02] active:scale-[0.98] animate-slideIn [animation-delay:400ms]"
            >
              Begin Your Adventure
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center p-16 animate-float">
            <LoadingSpinner label="Crafting your adventure..." />
          </div>
        ) : isComplete ? (
          <JourneySummaryCard 
            history={gameHistory}
            topic={selectedTopic}
            onRestart={resetGame}
            review={review!}
          />
        ) : (
          <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 animate-fadeIn
                         border border-blue-200">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-semibold text-accent-600">Topic: {selectedTopic}</span>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={finishGame}
                  className="px-6 py-3 text-accent-700 bg-accent-100 hover:bg-accent-200
                           rounded-xl font-medium transition-all duration-300
                           hover:shadow-lg hover:scale-105 active:scale-95
                           border border-accent-200"
                >
                  Complete Journey
                </button>
                <button
                  type="button"
                  onClick={resetGame}
                  className="px-6 py-3 text-red-600 bg-red-50 hover:bg-red-100
                           rounded-xl font-medium transition-all duration-300
                           hover:shadow-lg hover:scale-105 active:scale-95
                           border border-red-200"
                >
                  Start Over
                </button>
              </div>
            </div>
            
            <div className="prose max-w-none mb-10">
              <p className="text-accent-700 leading-relaxed text-xl animate-slideIn">{story}</p>
            </div>
            
            <div className="space-y-4">
              {choices.map((choice, index) => (
                <ChoiceButton
                  key={index}
                  choice={choice}
                  onClick={() => makeChoice(choice)}
                  delay={index * 100}
                />
              ))}
              
              {/* Add custom answer input */}
              <div className="mt-6 space-y-2">
                <p className="text-sm text-accent-600 font-medium">Or write your own response:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Enter your own answer..."
                    className="flex-1 p-4 text-accent-700 border-2 border-accent-200 rounded-xl
                             focus:border-accent-400 focus:ring-4 focus:ring-accent-100 
                             transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => makeChoice(customAnswer)}
                    disabled={!customAnswer.trim()}
                    className="px-6 py-3 bg-accent-600 text-white rounded-xl font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-accent-700 transition-all duration-300
                             hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdventureGame;