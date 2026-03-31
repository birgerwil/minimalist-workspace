import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, ArrowRight, ExternalLink } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface ApiKeyOnboardingProps {
  user: FirebaseUser;
  onSave: (key: string) => void;
  onLogout: () => void;
}

export function ApiKeyOnboarding({ user, onSave, onLogout }: ApiKeyOnboardingProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-neutral-200 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 mb-6 mx-auto">
          <Key size={24} />
        </div>
        
        <h2 className="text-2xl font-light tracking-tight text-center text-neutral-900 mb-2">
          Hjertet i din Workbench
        </h2>
        <p className="text-sm text-neutral-500 text-center mb-8">
          AI Tuner kræver adgang til Google Gemini for at drive arkitektur-agenterne.
          Din nøgle gemmes kun lokalt i din browser.
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSave(inputValue);
          }}
          className="space-y-4"
        >
          <div>
            <input
              type="password"
              placeholder="Indsæt din Gemini API Nøgle..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:outline-none focus:border-neutral-400 transition-colors text-neutral-900 font-mono"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full py-4 bg-neutral-900 text-neutral-50 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            Fortsæt
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-1 transition-colors"
          >
            Hent en gratis nøgle i Google AI Studio <ExternalLink size={12} />
          </a>
          
          <button 
            onClick={onLogout}
            className="text-sm text-neutral-400 hover:text-red-600 transition-colors mt-4"
          >
            Log ud af {user.email || 'konto'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
