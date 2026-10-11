import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import bgTranslations from '../locales/bg.json';

const resources = {
  en: {
    translation: enTranslations
  },
  bg: {
    translation: bgTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bg',
    supportedLngs: ['bg', 'en'],
    nonExplicitSupportedLngs: true, // bg-BG → bg, en-US → en
    load: 'languageOnly',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      // Components compare i18n.language === 'bg', so never expose 'bg-BG'
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    }
  });

export default i18n;
const syncHtmlLang = (lng?: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = (lng || 'bg').slice(0, 2);
};
syncHtmlLang(i18n.resolvedLanguage);
i18n.on('languageChanged', syncHtmlLang);
