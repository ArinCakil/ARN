import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_THEME, getChartColor } from '../../constants/chartColors';
import { formatCurrency, getCategoryLabel } from '../../utils/formatters';
import ChartCard from '../ui/ChartCard';
import EmptyChartState from './EmptyChartState';

/**
 * @param {import('recharts').TooltipProps<number, string>} props
 */
function CategoryTooltip({ active, payload }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-primary-800 bg-primary-900 px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-semibold">{item.label}</p>
      <p className="mt-1 text-white/80">
        {t('charts.tooltip.cost')}: {formatCurrency(item.cost, locale)}
      </p>
      <p className="text-white/80">
        {t('charts.tooltip.percentage')}: {item.percentage.toFixed(1)}%
      </p>
      <p className="text-white/60">
        {item.count} {t('kpi.itemCount').toLowerCase()}
      </p>
    </div>
  );
}

/**
 * @param {{
 *   data: import('../../utils/excelParser').CategoryAggregation[],
 *   selectedCategory?: string | null,
 *   onCategorySelect?: (category: string | null) => void,
 * }} props
 */
export default function CategoryComparisonChart({
  data,
  selectedCategory,
  onCategorySelect,
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        label: getCategoryLabel(item.category, t),
        color: getChartColor(index),
      })),
    [data, t],
  );

  if (!chartData.length) {
    return (
      <ChartCard
        data-pdf-chart="category-comparison"
        title={t('charts.categoryComparison.title')}
        subtitle={t('charts.categoryComparison.subtitle')}
      >
        <EmptyChartState message={t('upload.empty')} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      data-pdf-chart="category-comparison"
      title={t('charts.categoryComparison.title')}
      subtitle={t('charts.categoryComparison.subtitle')}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={chartData.length > 5 ? -25 : 0}
            textAnchor={chartData.length > 5 ? 'end' : 'middle'}
            height={chartData.length > 5 ? 60 : 30}
          />
          <YAxis
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            tickFormatter={(v) => formatCurrency(v, locale)}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<CategoryTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar
            dataKey="cost"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            onClick={(entry) => {
              const next =
                selectedCategory === entry.category ? null : entry.category;
              onCategorySelect?.(next);
            }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.category}
                fill={entry.color}
                opacity={
                  selectedCategory && selectedCategory !== entry.category
                    ? 0.35
                    : 1
                }
                stroke={selectedCategory === entry.category ? '#0f172a' : 'none'}
                strokeWidth={selectedCategory === entry.category ? 2 : 0}
                className="cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
