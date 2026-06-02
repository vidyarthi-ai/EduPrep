import { useState, useEffect } from 'react';
import { secureStorage } from '../lib/storage';

const DEFAULT_CONFIG = {
  provider: 'gemini',
  geminiKey: '',
  openaiKey: '',
  claudeKey: '',
  ollamaUrl: 'http://localhost:11434',
  customUrl: 'https://api.groq.com/openai/v1/chat/completions',
  customKey: '',
  customModel: 'llama3-8b-8192',
  autoFallback: true
};

export function useAIConfig() {
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const saved = secureStorage.getItem('edu_ai_settings');
    if (saved) {
      setConfigState({ ...DEFAULT_CONFIG, ...saved });
    }
    setLoaded(true);
  }, []);

  const setConfig = (newConfig: any) => {
    setConfigState(newConfig);
    secureStorage.setItem('edu_ai_settings', newConfig);
  };

  return { config, setConfig, loaded };
}
