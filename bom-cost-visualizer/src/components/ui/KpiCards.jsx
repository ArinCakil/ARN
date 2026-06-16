import { useTranslation } from 'react-i18next';
import { Award, DollarSign, Layers, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent, getCategoryLabel } from '../../utils/formatters';
import KpiCard from './KpiCard';

/**
 * @param {{
 *   summary: import('../../utils/excelParser').ParseSummary | null,
 *   exportRef?: import('react').Ref<HTMLElement>,
 * }} props
 */
export default function KpiCards({ summary, exportRef }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  if (!summary) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { titleKey: 'kpi.totalCost', icon: DollarSign },
          { titleKey: 'kpi.budgetVariance', icon: TrendingUp },
          { titleKey: 'kpi.topCategory', icon: Award },
          { titleKey: 'kpi.itemCount', icon: Layers },
        ].map(({ titleKey, icon }) => (
          <KpiCard
            key={titleKey}
            title={t(titleKey)}
            value="—"
            icon={icon}
          />
        ))}
      </section>
    );
  }

  const varianceVariant =
    summary.budgetVariance === null
      ? 'neutral'
      : summary.budgetVariance > 0
        ? 'negative'
        : summary.budgetVariance < 0
          ? 'positive'
          : 'neutral';

  const varianceSubtitle =
    summary.budgetVariance === null
      ? t('common.notAvailable')
      : summary.budgetVariance > 0
        ? t('kpi.overBudget')
        : summary.budgetVariance < 0
          ? t('kpi.underBudget')
          : t('kpi.onBudget');

  const topCategoryValue = summary.topCategory
    ? getCategoryLabel(summary.topCategory.category, t)
    : '—';

  const topCategorySubtitle = summary.topCategory
    ? `${formatCurrency(summary.topCategory.cost, locale)} (${formatPercent(summary.topCategory.percentage)})`
    : undefined;

  return (
    <section
      ref={exportRef}
      data-pdf-section="kpi"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <KpiCard
        title={t('kpi.totalCost')}
        value={formatCurrency(summary.totalCost, locale)}
        subtitle={t('table.rows', { count: summary.itemCount })}
        icon={DollarSign}
      />
      <KpiCard
        title={t('kpi.budgetVariance')}
        value={
          summary.budgetVariance !== null
            ? formatCurrency(summary.budgetVariance, locale)
            : '—'
        }
        subtitle={
          summary.budgetVariancePercent !== null
            ? `${varianceSubtitle} · ${formatPercent(summary.budgetVariancePercent)}`
            : varianceSubtitle
        }
        icon={TrendingUp}
        variant={varianceVariant}
      />
      <KpiCard
        title={t('kpi.topCategory')}
        value={topCategoryValue}
        subtitle={topCategorySubtitle}
        icon={Award}
        variant="neutral"
      />
      <KpiCard
        title={t('kpi.itemCount')}
        value={String(summary.itemCount)}
        subtitle={`${t('kpi.avgUnitCost')}: ${formatCurrency(summary.avgUnitCost, locale)}`}
        icon={Layers}
      />
    </section>
  );
}
