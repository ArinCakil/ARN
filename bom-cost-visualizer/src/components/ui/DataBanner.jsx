import { useTranslation } from 'react-i18next';
import { FileSpreadsheet } from 'lucide-react';
import { useBom } from '../../context/BomContext';

export default function DataBanner() {
  const { t } = useTranslation();
  const { data, hasData } = useBom();

  if (!hasData || !data) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary-800" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-primary-900">
          {t('upload.loadedFile', { fileName: data.meta.fileName })}
        </p>
        <p className="text-xs text-muted">
          {t('upload.rowsParsed', { count: data.meta.rowCount })}
        </p>
      </div>
    </div>
  );
}
