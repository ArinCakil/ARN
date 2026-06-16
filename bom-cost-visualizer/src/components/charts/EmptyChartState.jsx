import { BarChart3 } from 'lucide-react';

/**
 * @param {{ message: string }} props
 */
export default function EmptyChartState({ message }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg bg-surface px-4 py-8 text-center">
      <BarChart3 className="mb-3 h-8 w-8 text-primary-800/40" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
