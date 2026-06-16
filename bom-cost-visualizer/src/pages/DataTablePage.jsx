import { useTranslation } from 'react-i18next';
import { Table2, Upload } from 'lucide-react';
import { useBom } from '../context/BomContext';
import DataTable from '../components/ui/DataTable';

/**
 * @param {{ onNavigate?: (section: string) => void }} props
 */
export default function DataTablePage({ onNavigate }) {
  const { t } = useTranslation();
  const { data, hasData } = useBom();

  if (!hasData || !data) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <Table2 className="mx-auto h-10 w-10 text-primary-800" />
        <h2 className="mt-4 text-lg font-semibold text-primary-900">
          {t('table.title')}
        </h2>
        <p className="mt-2 text-sm text-muted">{t('table.noData')}</p>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800"
          >
            <Upload className="h-4 w-4" />
            {t('nav.upload')}
          </button>
        )}
      </div>
    );
  }

  return <DataTable items={data.items} />;
}
