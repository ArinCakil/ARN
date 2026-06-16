/**
 * @param {{
 *   title: string,
 *   value: string,
 *   subtitle?: string,
 *   icon: import('react').ComponentType<{ className?: string }>,
 *   variant?: 'default' | 'positive' | 'negative' | 'neutral',
 * }} props
 */
export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) {
  const accentClasses = {
    default: 'bg-primary-900',
    positive: 'bg-accent-green',
    negative: 'bg-accent-orange',
    neutral: 'bg-primary-800',
  };

  return (
    <div
      className={`rounded-xl p-5 text-white shadow-sm ${accentClasses[variant]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/75">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-white/65">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
