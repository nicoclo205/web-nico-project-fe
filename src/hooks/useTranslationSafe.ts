import { useTranslation } from 'react-i18next';

export const useTranslationSafe = (namespaces?: string | string[]) => {
  const { t, i18n, ready } = useTranslation(namespaces);
  
  const safeTrans = (key: string, fallback?: string, options?: any) => {
    try {
      const translation = t(key, options);
      
      // If translation is the same as key, it means it wasn't found
      if (translation === key && fallback) {
        return fallback;
      }
      
      return translation;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return fallback || key;
    }
  };
  
  return {
    t: safeTrans,
    i18n,
    ready,
    currentLanguage: i18n.language,
    isSpanish: i18n.language === 'es',
    isEnglish: i18n.language === 'en',
  };
};
