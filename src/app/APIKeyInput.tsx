"use client";
import { useState } from 'react';

interface APIKeyInputProps {
  onSubmit: (apiKey: string) => void;
  initialKey?: string;
}

export function APIKeyInput({ onSubmit, initialKey }: APIKeyInputProps) {
  const [apiKey, setApiKey] = useState(initialKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(apiKey);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 animate-fadeIn
                    border border-accent-200 hover:border-accent-300 transition-colors duration-500">
      <h2 className="text-4xl font-extrabold text-accent-700 mb-8 text-center animate-slideIn">
        Begin Your Learning Journey
      </h2>
      <p className="text-accent-500 text-center mb-8 animate-slideIn [animation-delay:200ms]">
        Enter your API key to unlock personalized educational adventures
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group animate-slideIn [animation-delay:400ms]">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full text-accent-700 p-4 pl-5 border-2 border-accent-200 bg-white rounded-xl 
                     focus:border-accent-400 focus:ring-4 focus:ring-accent-100 transition-all duration-300
                     placeholder:text-accent-400"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-200 to-accent-300 opacity-0 
                        group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
        </div>
        <button
          type="submit"
          disabled={!apiKey.trim()}
          className="w-full p-4 bg-accent-700 text-white font-medium rounded-xl
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                   hover:bg-accent-600 active:bg-accent-800 animate-slideIn [animation-delay:600ms]
                   hover:shadow-lg hover:shadow-accent-300/20"
        >
          Start Adventure
        </button>
      </form>
    </div>
  );
}
