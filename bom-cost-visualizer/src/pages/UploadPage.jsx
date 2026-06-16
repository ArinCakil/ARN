import { useTranslation } from 'react-i18next';
import { LayoutDashboard } from 'lucide-react';
import FileUploadZone from '../components/ui/FileUploadZone';
import SampleFileDownload from '../components/ui/SampleFileDownload';
import LoadSampleButton from '../components/ui/LoadSampleButton';

/**
 * @param {{ onNavigate?: (section: string) => void }} props
 */
export default function UploadPage({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SampleFileDownload />
      <LoadSampleButton onSuccess={() => onNavigate?.('dashboard')} />
      <FileUploadZone onSuccess={() => onNavigate?.('dashboard')} />

      {onNavigate && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-800 transition-colors hover:text-primary-900"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('upload.goToDashboard')}
          </button>
        </div>
      )}
    </div>
  );
}
