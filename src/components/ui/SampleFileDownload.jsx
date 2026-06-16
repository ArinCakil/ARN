import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet } from 'lucide-react';
import { SAMPLE_FILE_PATH } from '../../utils/sampleData';

export default function SampleFileDownload() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
            <FileSpreadsheet className="h-5 w-5 text-primary-800" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-900">
              {t('upload.downloadSample')}
            </p>
            <p className="mt-0.5 text-xs text-muted">{t('upload.sampleHint')}</p>
          </div>
        </div>

        <a
          href={SAMPLE_FILE_PATH}
          download="ornek-bom-verisi.xlsx"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-800 bg-white px-4 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-surface"
        >
          <Download className="h-4 w-4" />
          {t('upload.downloadSample')}
        </a>
      </div>
    </div>
  );
}
