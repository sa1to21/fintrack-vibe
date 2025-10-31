import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonRu from './locales/ru/common.json';
import commonEn from './locales/en/common.json';
import dashboardRu from './locales/ru/dashboard.json';
import dashboardEn from './locales/en/dashboard.json';
import transactionsRu from './locales/ru/transactions.json';
import transactionsEn from './locales/en/transactions.json';
import accountsRu from './locales/ru/accounts.json';
import accountsEn from './locales/en/accounts.json';
import categoriesRu from './locales/ru/categories.json';
import categoriesEn from './locales/en/categories.json';
import analyticsRu from './locales/ru/analytics.json';
import analyticsEn from './locales/en/analytics.json';
import settingsRu from './locales/ru/settings.json';
import settingsEn from './locales/en/settings.json';
import educationRu from './locales/ru/education.json';
import educationEn from './locales/en/education.json';

const resources = {
  ru: {
    common: commonRu,
    dashboard: dashboardRu,
    transactions: transactionsRu,
    accounts: accountsRu,
    categories: categoriesRu,
    analytics: analyticsRu,
    settings: settingsRu,
    education: educationRu,
  },
  en: {
    common: commonEn,
    dashboard: dashboardEn,
    transactions: transactionsEn,
    accounts: accountsEn,
    categories: categoriesEn,
    analytics: analyticsEn,
    settings: settingsEn,
    education: educationEn,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en', // fallback if translation is missing
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
