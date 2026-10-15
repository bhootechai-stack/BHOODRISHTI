import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  TranslationKey,
} from '../utils/translations';
import {
  SpokenDialect,
  SPOKEN_DIALECTS,
  getDialectById,
  getDefaultDialectForState,
} from '../utils/dialectDefinitions';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  spokenDialect: string;
  setSpokenDialect: (dialectId: string) => void;
  spokenDialectObj: SpokenDialect;
  dialects: SpokenDialect[];
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Screen Written Interface Language (English, Hindi, Punjabi, etc.)
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('bhootech_language') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'en';
  });

  // Spoken Regional Dialect for AI Speech & Voice Companion (Haryanvi, Bhojpuri, Awadhi, etc.)
  const [spokenDialect, setSpokenDialectState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bhootech_spoken_dialect');
      if (saved && SPOKEN_DIALECTS.some((d) => d.id === saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'haryanvi'; // Default to authentic Haryanvi
  });

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('bhootech_language', newLang);
      localStorage.setItem('bhootech_lang', newLang);
    } catch (e) {
      // ignore
    }
  };

  const setSpokenDialect = (dialectId: string) => {
    setSpokenDialectState(dialectId);
    try {
      localStorage.setItem('bhootech_spoken_dialect', dialectId);
    } catch (e) {
      // ignore
    }
  };

  const spokenDialectObj = getDialectById(spokenDialect);

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = langDict[key] || TRANSLATIONS.en[key] || key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        spokenDialect,
        setSpokenDialect,
        spokenDialectObj,
        dialects: SPOKEN_DIALECTS,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

