import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from 'lucide-react';
import { useBom } from '../../context/BomContext';

/**
 * @param {{
 *   onSuccess?: () => void,
 * }} props
 */
export default function FileUploadZone({ onSuccess }) {
  const { t } = useTranslation();
  const { data, isLoading, errorKey, uploadFile, clearData, hasData } =
    useBom();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file || isLoading) return;

      try {
        await uploadFile(file);
        onSuccess?.();
      } catch {
        // errorKey set in context
      }
    },
    [isLoading, onSuccess, uploadFile],
  );

  const onInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onClick={() => !isLoading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? 'border-primary-800 bg-primary-800/5'
            : 'border-border bg-surface hover:border-primary-800/40 hover:bg-white'
        } ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onInputChange}
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary-800" />
          ) : isDragging ? (
            <FileSpreadsheet className="h-6 w-6 text-primary-800" />
          ) : (
            <Upload className="h-6 w-6 text-primary-800" />
          )}
        </div>

        <h2 className="mt-4 text-lg font-semibold text-primary-900">
          {isDragging ? t('upload.dropHere') : t('upload.title')}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {isLoading ? t('upload.processing') : t('upload.subtitle')}
        </p>
        <p className="mt-4 text-xs text-muted">{t('upload.supported')}</p>

        {!isLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-6 rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800"
          >
            {t('upload.browse')}
          </button>
        )}
      </div>

      {errorKey && (
        <div className="flex items-start gap-3 rounded-lg border border-accent-orange/30 bg-accent-orange/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-orange" />
          <p className="text-sm text-primary-900">{t(errorKey)}</p>
        </div>
      )}

      {hasData && data && !isLoading && (
        <div className="flex flex-col gap-3 rounded-lg border border-accent-green/30 bg-accent-green/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-green" />
            <div>
              <p className="text-sm font-medium text-primary-900">
                {t('upload.success')}
              </p>
              <p className="text-sm text-muted">
                {t('upload.loadedFile', { fileName: data.meta.fileName })}
              </p>
              <p className="text-xs text-muted">
                {t('upload.rowsParsed', { count: data.meta.rowCount })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearData}
            className="self-start rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-primary-900 sm:self-center"
          >
            {t('common.clear')}
          </button>
        </div>
      )}
    </div>
  );
}
