"use client";
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './Spinner';
import { APIKeyInput } from './APIKeyInput';
import Image from 'next/image';
import { Brain } from 'lucide-react'; // Remove BookOpen import
import { APIKeyManager } from './components/APIKeyManager';
import { AIProvider } from '../types/ai';

// Updated interfaces
interface GameChoice {
  text: string;
  expectedOutcome: string;
}

// Update interface at the top of the file
interface GameHistory {
    story: string;
    choice: {
        text: string;
        expectedOutcome: string;
        timestamp: Date;
    };
    metrics: {
        comprehensionScore: number;
        timeSpent: number;
        topicsCovered: string[];
    };
}

interface EnhancedReview {
  rating: number;
  overallReview: string;
  choiceAnalysis: ChoiceAnalysis[];
  suggestedTopics: string[];
}

interface ChoiceAnalysis {
  explanation: string;
}

// Remove ChoiceButtonProps interface

interface JourneySummaryCardProps {
  history: GameHistory[];
  topic: string;
  onRestart: () => void;  // Fixed syntax for function type
  review: EnhancedReview;
}

// New component for enhanced choice button
const EnhancedChoiceButton: React.FC<{
  choice: GameChoice;
  onClick: () => void;
  delay: number;
}> = ({ choice, onClick, delay }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative w-full p-6 bg-white/50 backdrop-blur-sm rounded-2xl border-2 
                border-indigo-100 hover:border-indigo-300 hover:bg-white/80 transition-all 
                duration-300 animate-delay-${delay}`}
  >
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-start gap-2">
        <p className="text-lg text-gray-700">{choice.text}</p>
      </div>
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
            <span key={i} className={`text-2xl ${i < (review?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="text-black leading-relaxed">{review?.overallReview || 'No review available.'}</p>
    </div>

    <div className="space-y-8">
      {history.map((item, index) => {
        const analysis = review?.choiceAnalysis?.[index];
        return (
          <div key={index} className="border-l-4 border-blue-500 pl-6 py-2">
            <p className="text-black leading-relaxed mb-3">{item.story}</p>
            <p className="text-blue-700 font-medium mb-2">Your choice: {item.choice.text}</p>
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
        {(review?.suggestedTopics || []).map((topic, index) => (
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
  const [provider, setProvider] = useState<AIProvider>('gemini'); // Add provider state
  const [story, setStory] = useState<string>('');
  const [choices, setChoices] = useState<GameChoice[]>([]); // Ensure it's initialized as empty array
  const [loading, setLoading] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [review, setReview] = useState<EnhancedReview | null>(null);
  const [customAnswer, setCustomAnswer] = useState<string>(''); // Add new state for custom answer
  const [gameMetrics, setGameMetrics] = useState<{
    comprehensionLevel: number;
    topicsCovered: string[];
    suggestedFocus: string;
  }>({
    comprehensionLevel: 0,
    topicsCovered: [],
    suggestedFocus: '',
  });
  const [apiKeys, setApiKeys] = useState<{ gemini?: string; groq?: string }>({});
  const [showKeyAlert, setShowKeyAlert] = useState(false);

  // Update useEffect for loading keys and provider
  useEffect(() => {
    const savedKeys = localStorage.getItem('aiKeys');
    const savedProvider = localStorage.getItem('aiProvider') as AIProvider;
    
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      setApiKeys(keys);
      
      // Set the current provider's key if available
      if (savedProvider && keys[savedProvider]) {
        setApiKey(keys[savedProvider]);
        setProvider(savedProvider);
      } else if (keys.gemini) {
        // Default to gemini if available
        setApiKey(keys.gemini);
        setProvider('gemini');
      } else if (keys.groq) {
        // Fall back to groq if available
        setApiKey(keys.groq);
        setProvider('groq');
      }
    }
  }, []);

  const handleApiKeySubmit = (config: { provider: AIProvider; apiKey: string }) => {
    localStorage.setItem('aiApiKey', config.apiKey);
    localStorage.setItem('aiProvider', config.provider);
    setApiKey(config.apiKey);
    setProvider(config.provider);
  };

  // Update handler for API key changes
  const handleUpdateApiKeys = (newKeys: { gemini?: string; groq?: string }) => {
    setApiKeys(newKeys);
    if (newKeys[provider]) {
      setApiKey(newKeys[provider]!);
      setShowKeyAlert(false);
    }
    localStorage.setItem('aiKeys', JSON.stringify(newKeys));
  };

  // Update handler for provider changes
  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    if (apiKeys[newProvider]) {
      setApiKey(apiKeys[newProvider]!);
      setShowKeyAlert(false);
    } else {
      setApiKey('');
      setShowKeyAlert(true);
    }
    localStorage.setItem('aiProvider', newProvider);
  };

  const startNewStory = async () => {
    if (!selectedTopic) return;
    if (!apiKeys[provider]) {
      setShowKeyAlert(true);
      return;
    }
    setLoading(true);
    setGameStarted(true);
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: 'Start a new story', 
          topic: selectedTopic,
          apiKey,
          provider // Add provider to request
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

  const makeChoice = async (choiceText: string) => {
    if (!choiceText.trim()) return;
    setLoading(true);
    
    const newHistoryEntry = {
      story,
      choice: {
        text: choiceText,
        expectedOutcome: choices.find(c => c.text === choiceText)?.expectedOutcome || 'continue learning',
        timestamp: new Date()
      },
      metrics: {
        comprehensionScore: gameMetrics.comprehensionLevel,
        timeSpent: 0, // Calculate time spent
        topicsCovered: gameMetrics.topicsCovered
      }
    };
    const updatedHistory = [...gameHistory, newHistoryEntry];
    
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: choiceText, 
          topic: selectedTopic,
          apiKey,
          provider, // Add provider to request
          history: updatedHistory // Send the updated history
        }),
      });
      const data = await response.json();
      
      setGameHistory(updatedHistory);
      setStory(data.story);
      setChoices(data.choices);
      setCustomAnswer('');
      if (data.metrics) {
        setGameMetrics(data.metrics);
      }
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
          apiKey,
          provider // Add provider to request
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

  const renderChoices = () => (
    <div className="space-y-4">
      {Array.isArray(choices) && choices.map((choice, index) => (
        <EnhancedChoiceButton
          key={index}
          choice={choice}
          onClick={() => makeChoice(choice.text)}
          delay={index * 100}
        />
      ))}
    </div>
  );

  // Memoize the LoadingSpinner usage
  const MemoizedLoadingSpinner = React.memo(LoadingSpinner);

  const getLoadingText = () => {
    if (!gameStarted) {
      return "Brewing a potent mix of knowledge and adventure...";
    }
    if (isComplete) {
      return "Consulting the Council of Wise AI for your review...";
    }
    return [
      "Channeling the wisdom of the digital sages...",
      "Plotting your next intellectual twist...",
      "Consulting the ancient scrolls of data...",
      "Rolling the dice of knowledge...",
    ][Math.floor(Math.random() * 4)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <APIKeyManager
        onUpdateKeys={handleUpdateApiKeys}
        onProviderChange={handleProviderChange}
        initialKeys={apiKeys}
        currentProvider={provider}
        className="transition-transform duration-300"
        showAlert={showKeyAlert}
      />
      <div className="max-w-5xl mx-auto pl-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 animate-fadeIn">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-6xl font-extrabold text-primary">
                QuestLearn
              </h1>
              <p className="text-xl mt-2 text-text">
                Embark on a Journey of Interactive Discovery
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        {!gameStarted ? (
          <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 animate-fadeIn
                         border border-blue-200">
            <h2 className="text-4xl font-bold mb-8 animate-slideIn text-primary">
              Configure Your Learning Journey
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="w-full p-4 text-lg border-2 border-accent-200 rounded-xl 
                           focus:border-accent-400 focus:ring-4 focus:ring-accent-100
                           transition-all duration-300"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="groq">Groq</option>
                </select>
                {showKeyAlert && (
                  <p className="mt-2 text-sm text-yellow-600">
                    Please configure the API key for this provider in the sidebar
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Topic
                </label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="e.g. French Revolution, Machine Learning, Ethics in AI..."
                  className="w-full text-accent-700 p-4 border-2 border-accent-200 rounded-xl 
                           focus:border-accent-400 focus:ring-4 focus:ring-accent-100
                           transition-all duration-300 text-lg"
                />
              </div>

              <button
                type="button"
                onClick={startNewStory}
                disabled={!selectedTopic.trim()}
                className="w-full p-5 bg-accent-700 text-white text-lg font-medium rounded-xl 
                         hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-300 hover:shadow-lg hover:shadow-accent-300/20
                         hover:scale-[1.02] active:scale-[0.98]"
              >
                Begin Your Adventure
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center p-16 animate-float">
            <MemoizedLoadingSpinner label={getLoadingText()} />
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
            
            {renderChoices()}
              
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
        )}
      </div>
    </div>
  );
}

export default AdventureGame;