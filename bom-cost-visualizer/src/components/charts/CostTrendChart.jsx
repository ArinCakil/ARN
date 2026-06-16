import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_THEME } from '../../constants/chartColors';
import { formatCurrency } from '../../utils/formatters';
import ChartCard from '../ui/ChartCard';
import EmptyChartState from './EmptyChartState';

/**
 * @param {import('recharts').TooltipProps<number, string>} props
 */
function TrendTooltip({ active, payload, label }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-lg border border-primary-800 bg-primary-900 px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">
        {t('charts.tooltip.period')}: {label}
      </p>
      <p className="mt-1 text-white/80">
        {t('charts.tooltip.cost')}: {formatCurrency(item?.cost ?? 0, locale)}
      </p>
      <p className="text-white/60">
        {item?.itemCount} {t('kpi.itemCount').toLowerCase()}
      </p>
    </div>
  );
}

/**
 * @param {{
 *   data: import('../../utils/excelParser').TrendPoint[],
 *   hasTimeSeries?: boolean,
 * }} props
 */
export default function CostTrendChart({ data, hasTimeSeries = false }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  if (!hasTimeSeries || !data?.length) {
    return (
      <ChartCard
        data-pdf-chart="cost-trend"
        title={t('charts.costTrend.title')}
        subtitle={t('charts.costTrend.subtitle')}
      >
        <EmptyChartState message={t('charts.costTrend.noData')} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      data-pdf-chart="cost-trend"
      title={t('charts.costTrend.title')}
      subtitle={t('charts.costTrend.subtitle')}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            tickFormatter={(v) => formatCurrency(v, locale)}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<TrendTooltip />} />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={{ fill: '#0d9488', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#0f172a', stroke: '#0d9488', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
