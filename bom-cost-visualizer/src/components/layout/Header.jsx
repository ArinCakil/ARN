import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const SECTION_TITLE_KEYS = {
  dashboard: 'nav.dashboard',
  upload: 'nav.upload',
  dataTable: 'nav.dataTable',
};

/**
 * @param {{
 *   activeSection: string,
 *   onMenuClick: () => void,
 * }} props
 */
export default function Header({ activeSection, onMenuClick }) {
  const { t } = useTranslation();
  const titleKey = SECTION_TITLE_KEYS[activeSection] ?? 'nav.dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-border p-2 text-primary-900 transition-colors hover:bg-surface lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-primary-900 sm:text-xl">
              {t(titleKey)}
            </h1>
            <p className="hidden text-sm text-muted sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
