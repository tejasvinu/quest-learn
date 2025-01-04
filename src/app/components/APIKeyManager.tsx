"use client";
import React, { useState, useEffect } from 'react';
import { AIProvider } from '../../types/ai';

interface APIKeys {
  gemini?: string;
  groq?: string;
}

interface APIKeyManagerProps {
  onUpdateKeys: (keys: APIKeys) => void;
  onProviderChange: (provider: AIProvider) => void;
  initialKeys: APIKeys;
  currentProvider: AIProvider;
  className?: string;
  showAlert?: boolean;
}

export function APIKeyManager({ 
  onUpdateKeys, 
  onProviderChange,
  initialKeys, 
  currentProvider,
  className = '',
  showAlert = false,
}: APIKeyManagerProps) {
  const [keys, setKeys] = useState<APIKeys>(initialKeys);
  const [isExpanded, setIsExpanded] = useState(false);

  // Add effect to load keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('aiKeys');
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys);
      setKeys(parsedKeys);
      onUpdateKeys(parsedKeys);
    }
  }, []);

  const handleKeyUpdate = (provider: AIProvider, key: string) => {
    const newKeys = { ...keys, [provider]: key };
    setKeys(newKeys);
    onUpdateKeys(newKeys);
    localStorage.setItem('aiKeys', JSON.stringify(newKeys));
  };

  const handleProviderSelect = (provider: AIProvider) => {
    onProviderChange(provider);
    localStorage.setItem('aiProvider', provider);
  };

  return (
    <div className={`fixed left-0 top-0 h-full transition-all duration-300 z-50 
                    ${isExpanded ? 'w-80' : 'w-12'} 
                    ${className}
                    bg-white/80 backdrop-blur-md shadow-xl border-r border-accent-200`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute -right-3 top-8 bg-white rounded-full p-2 shadow-md 
                   hover:shadow-lg transition-all duration-300
                   ${showAlert ? 'animate-pulse ring-2 ring-red-400' : ''}`}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className={`p-6 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
                      transition-opacity duration-300`}>
        <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
        
        {showAlert && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-pulse">
            Please configure your API key to continue
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Active Provider
            </label>
            <select
              value={currentProvider}
              onChange={(e) => handleProviderSelect(e.target.value as AIProvider)}
              className="w-full p-2 border rounded-md text-sm bg-white
                       focus:ring-2 focus:ring-accent-400 focus:border-accent-400
                       transition-all duration-300"
            >
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq</option>
            </select>
          </div>

          <div className="space-y-4">
            {(['gemini', 'groq'] as AIProvider[]).map((provider) => (
              <div key={provider} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {provider === 'gemini' ? 'Gemini' : 'Groq'} API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={keys[provider] || ''}
                    onChange={(e) => handleKeyUpdate(provider, e.target.value)}
                    className={`w-full p-2 pr-8 border rounded-md text-sm
                             focus:ring-2 focus:ring-accent-400 focus:border-accent-400
                             transition-all duration-300
                             ${currentProvider === provider ? 'border-accent-400 bg-accent-50' : ''}`}
                    placeholder={`Enter ${provider} API key`}
                  />
                  {keys[provider] && (
                    <button
                      onClick={() => handleKeyUpdate(provider, '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear API key"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {isExpanded && (
            <div className="pt-4 border-t border-accent-200">
              <p className="text-xs text-gray-500">
                Your API keys are stored securely in your browser's local storage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
