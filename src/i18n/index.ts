import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import ru from '../locales/ru.json'

const LOCALE_STORAGE_KEY = 'cursor-fit:locale'

function getInitialLanguage(): string {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return 'en'
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'en' || saved === 'ru') return saved
    const browser = typeof navigator !== 'undefined' ? navigator.language : ''
    if (browser.startsWith('ru')) return 'ru'
  } catch {
    // e.g. test env before localStorage mock is ready
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru } },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'ru'],
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng)
  } catch {
    // ignore
  }
})

export default i18n
export { LOCALE_STORAGE_KEY }
