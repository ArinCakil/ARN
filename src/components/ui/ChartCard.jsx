/**
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   children: import('react').ReactNode,
 *   action?: import('react').ReactNode,
 *   className?: string,
 *   'data-pdf-chart'?: string,
 * }} props
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = '',
  ...rest
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-white p-5 shadow-sm ${className}`}
      {...rest}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-primary-900">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
