import React from 'react';
import { useTranslation } from 'react-i18next';
import { syncLanguageWithAPI } from '../utils/languageApi';

const LanguageSelectorEnhanced: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng: string) => {
    try {
      // Change language in i18n
      await i18n.changeLanguage(lng);
      
      // Sync with backend API
      await syncLanguageWithAPI(lng);
      
      // Optional: Show success notification
      console.log(`Language changed to ${lng}`);
    } catch (error) {
      console.error('Error changing language:', error);
      // Optional: Show error notification
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 rounded-lg transition-all ${
          i18n.language === 'es'
            ? 'bg-blue-500 text-white shadow-lg scale-105'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="Español"
      >
        🇪🇸 ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-lg transition-all ${
          i18n.language === 'en'
            ? 'bg-blue-500 text-white shadow-lg scale-105'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="English"
      >
        🇺🇸 EN
      </button>
    </div>
  );
};

export default LanguageSelectorEnhanced;
