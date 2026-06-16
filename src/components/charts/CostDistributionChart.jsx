import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getChartColor } from '../../constants/chartColors';
import {
  formatCurrency,
  formatPercent,
  getCategoryLabel,
} from '../../utils/formatters';
import ChartCard from '../ui/ChartCard';
import EmptyChartState from './EmptyChartState';

/**
 * @param {import('recharts').TooltipProps<number, string>} props
 */
function DistributionTooltip({ active, payload }) {
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
        {t('charts.tooltip.percentage')}: {formatPercent(item.percentage)}
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
export default function CostDistributionChart({
  data,
  selectedCategory,
  onCategorySelect,
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        label: getCategoryLabel(item.category, t),
        fill: getChartColor(index),
      })),
    [data, t],
  );

  const totalCost = useMemo(
    () => chartData.reduce((sum, item) => sum + item.cost, 0),
    [chartData],
  );

  const selectedItem = chartData.find((d) => d.category === selectedCategory);

  if (!chartData.length) {
    return (
      <ChartCard
        data-pdf-chart="cost-distribution"
        title={t('charts.costDistribution.title')}
        subtitle={t('charts.costDistribution.subtitle')}
      >
        <EmptyChartState message={t('upload.empty')} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      data-pdf-chart="cost-distribution"
      title={t('charts.costDistribution.title')}
      subtitle={t('charts.costDistribution.subtitle')}
      action={
        selectedCategory && (
          <button
            type="button"
            onClick={() => onCategorySelect?.(null)}
            className="text-xs font-medium text-primary-800 hover:underline"
          >
            {t('common.clear')}
          </button>
        )
      }
    >
      <div className="relative h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="cost"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(entry) => {
                const next =
                  selectedCategory === entry.category ? null : entry.category;
                onCategorySelect?.(next);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={entry.fill}
                  opacity={
                    selectedCategory && selectedCategory !== entry.category
                      ? 0.35
                      : activeIndex === null || activeIndex === index
                        ? 1
                        : 0.65
                  }
                  stroke={selectedCategory === entry.category ? '#0f172a' : 'none'}
                  strokeWidth={selectedCategory === entry.category ? 2 : 0}
                  className="cursor-pointer outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<DistributionTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {selectedItem ? (
            <>
              <p className="text-xs text-muted">{selectedItem.label}</p>
              <p className="text-lg font-semibold text-primary-900">
                {formatCurrency(selectedItem.cost, locale)}
              </p>
              <p className="text-xs text-muted">
                {formatPercent(selectedItem.percentage)}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted">{t('kpi.totalCost')}</p>
              <p className="text-lg font-semibold text-primary-900">
                {formatCurrency(totalCost, locale)}
              </p>
            </>
          )}
        </div>
      </div>
    </ChartCard>
  );
}
