import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonES from './locales/es/common.json';
import authES from './locales/es/auth.json';
import homeES from './locales/es/home.json';
import sportsES from './locales/es/sports.json';
import roomsES from './locales/es/rooms.json';
import aboutES from './locales/es/about.json';
import settingsES from './locales/es/settings.json';
import legalES from './locales/es/legal.json';
import donateES from './locales/es/donate.json';

import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import homeEN from './locales/en/home.json';
import sportsEN from './locales/en/sports.json';
import roomsEN from './locales/en/rooms.json';
import aboutEN from './locales/en/about.json';
import settingsEN from './locales/en/settings.json';
import legalEN from './locales/en/legal.json';
import donateEN from './locales/en/donate.json';

const resources = {
  es: {
    common: commonES,
    auth: authES,
    home: homeES,
    sports: sportsES,
    rooms: roomsES,
    about: aboutES,
    settings: settingsES,
    legal: legalES,
    donate: donateES,
  },
  en: {
    common: commonEN,
    auth: authEN,
    home: homeEN,
    sports: sportsEN,
    rooms: roomsEN,
    about: aboutEN,
    settings: settingsEN,
    legal: legalEN,
    donate: donateEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'home', 'sports', 'rooms', 'about', 'settings', 'legal', 'donate'],

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense mode for better compatibility
    },
  });

export default i18n;
