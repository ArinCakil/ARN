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
import { CHART_THEME } from '../../constants/chartColors';
import { formatCurrency, truncateLabel } from '../../utils/formatters';
import ChartCard from '../ui/ChartCard';
import EmptyChartState from './EmptyChartState';

/**
 * @param {import('recharts').TooltipProps<number, string>} props
 */
function DriversTooltip({ active, payload }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-primary-800 bg-primary-900 px-3 py-2 text-xs text-white shadow-lg">
      <p className="max-w-48 font-semibold">{item.componentName}</p>
      <p className="mt-1 text-white/80">
        {t('charts.tooltip.cost')}: {formatCurrency(item.totalCost, locale)}
      </p>
      <p className="text-white/80">
        {t('charts.tooltip.unitCost')}: {formatCurrency(item.unitCost, locale)}
      </p>
      <p className="text-white/80">
        {t('charts.tooltip.quantity')}: {item.quantity}
      </p>
      <p className="text-white/60">
        {t('charts.tooltip.category')}: {item.categoryLabel}
      </p>
    </div>
  );
}

/**
 * @param {{
 *   data: import('../../utils/excelParser').CostDriver[],
 *   selectedCategory?: string | null,
 *   onItemSelect?: (name: string | null) => void,
 *   selectedItem?: string | null,
 * }} props
 */
export default function TopCostDriversChart({
  data,
  selectedCategory,
  onItemSelect,
  selectedItem,
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  const chartData = useMemo(() => {
    const filtered = selectedCategory
      ? data.filter((item) => item.category === selectedCategory)
      : data;

    return filtered.map((item) => ({
      ...item,
      shortName: truncateLabel(item.componentName, 28),
    }));
  }, [data, selectedCategory]);

  if (!chartData.length) {
    return (
      <ChartCard
        data-pdf-chart="top-cost-drivers"
        title={t('charts.topCostDrivers.title')}
        subtitle={t('charts.topCostDrivers.subtitle')}
      >
        <EmptyChartState message={t('upload.empty')} />
      </ChartCard>
    );
  }

  const chartHeight = Math.max(280, chartData.length * 36);

  return (
    <ChartCard
      data-pdf-chart="top-cost-drivers"
      title={t('charts.topCostDrivers.title')}
      subtitle={t('charts.topCostDrivers.subtitle')}
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            tickFormatter={(v) => formatCurrency(v, locale)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={120}
            tick={{ fill: CHART_THEME.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<DriversTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar
            dataKey="totalCost"
            radius={[0, 4, 4, 0]}
            barSize={18}
            onClick={(entry) => {
              const next =
                selectedItem === entry.componentName
                  ? null
                  : entry.componentName;
              onItemSelect?.(next);
            }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.componentName}
                fill={selectedItem === entry.componentName ? '#0f172a' : '#1e3a8a'}
                className="cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
