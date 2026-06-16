import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('tr') ? 'tr' : 'en';

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-border bg-white p-1"
      role="group"
      aria-label={t('language.switch')}
    >
      <Globe className="ml-2 h-4 w-4 text-muted" aria-hidden="true" />
      {['en', 'tr'].map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={currentLang === lang}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            currentLang === lang
              ? 'bg-primary-900 text-white shadow-sm'
              : 'text-muted hover:bg-surface hover:text-primary-900'
          }`}
        >
          {t(`language.${lang}`)}
        </button>
      ))}
    </div>
  );
}
