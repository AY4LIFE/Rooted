import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { BibleTranslation } from '@/services/bibleApi';
import { DEFAULT_TRANSLATION_ID } from '@/services/bibleApi';

const STORAGE_KEY = '@rooted/translation_id';

type TranslationContextValue = {
  translationId: string;
  translationName: string;
  setTranslation: (translation: BibleTranslation) => void;
  setTranslationId: (id: string, name: string) => void;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

const DEFAULT_NAME = 'Berean Standard Bible';

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [translationId, setTranslationIdState] = useState(DEFAULT_TRANSLATION_ID);
  const [translationName, setTranslationName] = useState(DEFAULT_NAME);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          try {
            const { id, name } = JSON.parse(stored);
            if (id) {
              setTranslationIdState(id);
              setTranslationName(name || id);
            }
          } catch {
            // ignore
          }
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const setTranslation = useCallback((t: BibleTranslation) => {
    const id = t.id;
    const name = t.englishName || t.name || t.shortName || id;
    setTranslationIdState(id);
    setTranslationName(name);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name })).catch(() => {});
  }, []);

  const setTranslationId = useCallback((id: string, name: string) => {
    setTranslationIdState(id);
    setTranslationName(name || id);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name: name || id })).catch(() => {});
  }, []);

  const value: TranslationContextValue = {
    translationId,
    translationName,
    setTranslation,
    setTranslationId,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    return {
      translationId: DEFAULT_TRANSLATION_ID,
      translationName: DEFAULT_NAME,
      setTranslation: () => {},
      setTranslationId: () => {},
    };
  }
  return ctx;
}
