'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '@/locales/en.json';
import viTranslations from '@/locales/vi.json';

type Locale = 'en' | 'vi';

type Translations = typeof enTranslations;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  vi: viTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved locale from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('task-reminder-locale') as Locale;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
        setLocaleState(savedLocale);
      }
      setIsLoaded(true);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('task-reminder-locale', newLocale);
    }
  };

  // Translation function with nested key support and interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Handle pluralization
    if (params && 'count' in params) {
      const count = params.count;
      const pluralKey = `${key}_plural`;
      const pluralKeys = pluralKey.split('.');
      let pluralValue: any = translations[locale];

      for (const k of pluralKeys) {
        if (pluralValue && typeof pluralValue === 'object') {
          pluralValue = pluralValue[k];
        } else {
          pluralValue = null;
          break;
        }
      }

      if (typeof count === 'number' && count !== 1 && typeof pluralValue === 'string') {
        value = pluralValue;
      }
    }

    // Interpolate parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }

    return value;
  };

  // Prevent flash of wrong language
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
