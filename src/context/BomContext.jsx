import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { parseExcelFile } from '../utils/excelParser';

/** @type {import('react').Context<null | {
 *   data: import('../utils/excelParser').ParsedBomData | null,
 *   isLoading: boolean,
 *   errorKey: string | null,
 *   uploadFile: (file: File) => Promise<import('../utils/excelParser').ParsedBomData>,
 *   clearData: () => void,
 *   loadParsedData: (parsed: import('../utils/excelParser').ParsedBomData) => void,
 *   hasData: boolean,
 * }>} */
const BomContext = createContext(null);

const ERROR_KEY_MAP = {
  UNSUPPORTED_FORMAT: 'upload.errors.unsupported',
  MISSING_REQUIRED_COLUMNS: 'upload.errors.missingColumns',
  EMPTY_WORKBOOK: 'upload.errors.emptySheet',
  EMPTY_SHEET: 'upload.errors.emptySheet',
  NO_VALID_ROWS: 'upload.errors.noValidRows',
};

/**
 * @param {{ message: string }} error
 * @returns {string}
 */
function resolveErrorKey(error) {
  return ERROR_KEY_MAP[error.message] ?? 'upload.errors.generic';
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function BomProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  const uploadFile = useCallback(async (file) => {
    setIsLoading(true);
    setErrorKey(null);

    try {
      const parsed = await parseExcelFile(file);
      setData(parsed);
      return parsed;
    } catch (err) {
      const key = resolveErrorKey(
        err instanceof Error ? err : { message: 'generic' },
      );
      setErrorKey(key);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setErrorKey(null);
  }, []);

  const loadParsedData = useCallback((parsed) => {
    setData(parsed);
    setErrorKey(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      errorKey,
      uploadFile,
      clearData,
      loadParsedData,
      hasData: Boolean(data?.items?.length),
    }),
    [data, isLoading, errorKey, uploadFile, clearData, loadParsedData],
  );

  return <BomContext.Provider value={value}>{children}</BomContext.Provider>;
}

export function useBom() {
  const context = useContext(BomContext);
  if (!context) {
    throw new Error('useBom must be used within BomProvider');
  }
  return context;
}
