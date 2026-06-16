import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { useBom } from '../context/BomContext';
import KpiCards from '../components/ui/KpiCards';
import DataBanner from '../components/ui/DataBanner';
import ExportPdfButton from '../components/ui/ExportPdfButton';
import { DashboardCharts } from '../components/charts';
import LoadSampleButton from '../components/ui/LoadSampleButton';

/**
 * @param {{ onNavigate?: (section: string) => void }} props
 */
export default function DashboardPage({ onNavigate }) {
  const { t } = useTranslation();
  const { data, hasData } = useBom();
  const kpiRef = useRef(/** @type {HTMLElement | null} */ (null));
  const chartsRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-muted">{t('upload.empty')}</p>
          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
            <LoadSampleButton onSuccess={() => onNavigate?.('dashboard')} />
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('upload')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800"
              >
                <Upload className="h-4 w-4" />
                {t('nav.upload')}
              </button>
            )}
          </div>
        </div>
        <KpiCards summary={null} />
        <DashboardCharts aggregations={null} hasTimeSeries={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DataBanner />
        <ExportPdfButton kpiRef={kpiRef} chartsRef={chartsRef} />
      </div>
      <KpiCards summary={data.summary} exportRef={kpiRef} />
      <DashboardCharts
        aggregations={data.aggregations}
        hasTimeSeries={data.summary.hasTimeSeries}
        exportRef={chartsRef}
      />
    </div>
  );
}
