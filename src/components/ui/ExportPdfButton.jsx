import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, FileDown, Loader2 } from 'lucide-react';
import { useBom } from '../../context/BomContext';
import { exportDashboardPdf } from '../../utils/pdfExport';

/**
 * @param {{
 *   kpiRef?: import('react').RefObject<HTMLElement | null>,
 *   chartsRef?: import('react').RefObject<HTMLElement | null>,
 * }} props
 */
export default function ExportPdfButton({ kpiRef, chartsRef }) {
  const { t, i18n } = useTranslation();
  const { data, hasData } = useBom();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(false);

  if (!hasData || !data) return null;

  const handleExport = async () => {
    if (exporting) return;

    setExporting(true);
    setError(false);

    try {
      const chartElements = chartsRef?.current
        ? Array.from(chartsRef.current.querySelectorAll('[data-pdf-chart]'))
        : [];

      await exportDashboardPdf({
        data,
        t,
        locale: i18n.language === 'tr' ? 'tr-TR' : 'en-US',
        kpiElement: kpiRef?.current ?? null,
        chartElements,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:opacity-60"
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {exporting ? t('export.generating') : t('export.downloadPdf')}
      </button>

      {error && (
        <p className="flex items-center gap-1 text-xs text-accent-orange">
          <AlertCircle className="h-3.5 w-3.5" />
          {t('export.error')}
        </p>
      )}
    </div>
  );
}
