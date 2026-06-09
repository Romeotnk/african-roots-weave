import fs from 'node:fs';
import path from 'node:path';
import i18next from 'i18next';

const loadLocale = (language: string) => {
  const file = path.resolve(process.cwd(), 'locales', `${language}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
};

export const initI18n = async () => {
  await i18next.init({
    lng: 'fr',
    fallbackLng: 'fr',
    resources: {
      fr: { translation: loadLocale('fr') },
      en: { translation: loadLocale('en') },
      ar: { translation: loadLocale('ar') },
    },
  });
};

export { i18next };
