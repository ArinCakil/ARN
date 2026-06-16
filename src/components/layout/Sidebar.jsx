import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  LayoutDashboard,
  Table2,
  Upload,
  X,
} from 'lucide-react';

/** @type {{ id: string, icon: import('react').ComponentType<{ className?: string }>, labelKey: string }[]} */
const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { id: 'upload', icon: Upload, labelKey: 'nav.upload' },
  { id: 'dataTable', icon: Table2, labelKey: 'nav.dataTable' },
];

/**
 * @param {{
 *   activeSection: string,
 *   onNavigate: (section: string) => void,
 *   isOpen: boolean,
 *   onClose: () => void,
 * }} props
 */
export default function Sidebar({ activeSection, onNavigate, isOpen, onClose }) {
  const { t } = useTranslation();

  const handleNavigate = (section) => {
    onNavigate(section);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-primary-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-900 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-primary-900">
                {t('app.title')}
              </p>
              <p className="truncate text-xs text-muted">{t('app.tagline')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => {
            const isActive = activeSection === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-900 text-white shadow-sm'
                    : 'text-primary-900 hover:bg-surface'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-primary-800'
                  }`}
                />
                {t(labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-xs leading-relaxed text-muted">
            {t('app.description')}
          </p>
        </div>
      </aside>
    </>
  );
}
