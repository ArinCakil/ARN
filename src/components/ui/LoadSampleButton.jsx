import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles } from 'lucide-react';
import { useBom } from '../../context/BomContext';
import { SAMPLE_BOM_DATA } from '../../utils/sampleData';

/**
 * @param {{ onSuccess?: () => void }} props
 */
export default function LoadSampleButton({ onSuccess }) {
  const { t } = useTranslation();
  const { uploadFile, loadParsedData, isLoading, hasData } = useBom();
  const [loading, setLoading] = useState(false);

  const loadSample = async () => {
    if (isLoading || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/samples/ornek-bom-verisi.xlsx');
      if (!response.ok) throw new Error('fetch failed');

      const buffer = await response.arrayBuffer();
      const file = new File([buffer], 'ornek-bom-verisi.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      await uploadFile(file);
    } catch {
      loadParsedData({
        ...SAMPLE_BOM_DATA,
        meta: {
          ...SAMPLE_BOM_DATA.meta,
          parsedAt: new Date().toISOString(),
        },
      });
    } finally {
      setLoading(false);
      onSuccess?.();
    }
  };

  if (hasData) return null;

  return (
    <button
      type="button"
      onClick={loadSample}
      disabled={isLoading || loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary-800/40 bg-primary-800/5 px-4 py-3 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-800/10 disabled:opacity-60"
    >
      {(isLoading || loading) ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {t('upload.loadSample')}
    </button>
  );
}
