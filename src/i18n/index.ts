import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';

export const supportedLngs = ['en', 'hi', 'mr', 'gu', 'kn', 'te', 'ta', 'bn', 'or'] as const;
export type SupportedLng = (typeof supportedLngs)[number];

const localeLoaders: Record<Exclude<SupportedLng, 'en'>, () => Promise<{ default: Record<string, string> }>> = {
  hi: () => import('./locales/hi.json'),
  mr: () => import('./locales/mr.json'),
  gu: () => import('./locales/gu.json'),
  kn: () => import('./locales/kn.json'),
  te: () => import('./locales/te.json'),
  ta: () => import('./locales/ta.json'),
  bn: () => import('./locales/bn.json'),
  or: () => import('./locales/or.json'),
};

const loadedLanguages = new Set<string>(['en']);
const loadingPromises = new Map<string, Promise<void>>();

export function normalizeLanguageCode(lng?: string | null): SupportedLng {
  const code = (lng || 'en').split('-')[0];
  return (supportedLngs.includes(code as SupportedLng) ? code : 'en') as SupportedLng;
}

export async function loadLanguage(lng: string): Promise<void> {
  const code = normalizeLanguageCode(lng);
  if (code === 'en' || loadedLanguages.has(code)) return;

  const pending = loadingPromises.get(code);
  if (pending) return pending;

  const loader = localeLoaders[code as Exclude<SupportedLng, 'en'>];
  if (!loader) return;

  const promise = loader()
    .then((mod) => {
      i18n.addResourceBundle(code, 'translation', mod.default, true, true);
      loadedLanguages.add(code);
    })
    .finally(() => {
      loadingPromises.delete(code);
    });

  loadingPromises.set(code, promise);
  return promise;
}

export async function changeAppLanguage(lng: string): Promise<void> {
  const code = normalizeLanguageCode(lng);
  await loadLanguage(code);
  await i18n.changeLanguage(code);
  localStorage.setItem('abgp-language', code);
  document.documentElement.lang = code;
}

export async function ensureInitialLanguage(): Promise<void> {
  const stored = localStorage.getItem('abgp-language');
  const fromDetector = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
  const initial = stored ? normalizeLanguageCode(stored) : fromDetector;
  if (initial === 'en') return;
  await changeAppLanguage(initial);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: [...supportedLngs],
    load: 'languageOnly',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'abgp-language',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
