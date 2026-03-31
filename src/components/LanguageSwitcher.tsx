import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 ml-2">
      <Globe size={14} className="text-neutral-400 mx-1" />
      <button
        onClick={() => setLanguage('da')}
        className={cn(
          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
          language === 'da' 
            ? "bg-white text-neutral-900 shadow-sm" 
            : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        DA
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
          language === 'en' 
            ? "bg-white text-neutral-900 shadow-sm" 
            : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        EN
      </button>
    </div>
  );
};
