"use client";
import { useState } from 'react';
import { AIProvider } from '../types/ai';

interface APIKeyInputProps {
  onSubmit: (config: { provider: AIProvider; apiKey: string }) => void;
  initialConfig?: { provider: AIProvider; apiKey: string };
}

export function APIKeyInput({ onSubmit, initialConfig }: APIKeyInputProps) {
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [provider, setProvider] = useState<AIProvider>(initialConfig?.provider || 'gemini');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ provider, apiKey });
  };

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-10 animate-fadeIn
                    border border-accent-200 hover:border-accent-300 transition-colors duration-500">
      <h2 className="text-4xl font-extrabold text-accent-700 mb-8 text-center animate-slideIn">
        Begin Your Learning Journey
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AIProvider)}
            className="w-full p-4 border-2 border-accent-200 rounded-xl"
          >
            <option value="gemini">Google Gemini</option>
            <option value="groq">Groq</option>
          </select>
          
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'Groq'} API key`}
            className="w-full text-accent-700 p-4 pl-5 border-2 border-accent-200 rounded-xl"
          />
        </div>
        
        <button
          type="submit"
          disabled={!apiKey.trim()}
          className="w-full p-4 bg-accent-700 text-white font-medium rounded-xl"
        >
          Start Adventure
        </button>
      </form>
    </div>
  );
}
