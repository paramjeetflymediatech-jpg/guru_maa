import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import hi from '../locales/hi.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const language = await AsyncStorage.getItem('user-language');
      if (language) {
        return callback(language);
      }
      return callback('en');
    } catch (error) {
      console.log('Error fetching language', error);
      return callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
