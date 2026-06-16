import { useState } from 'react';
import CostDistributionChart from './CostDistributionChart';
import TopCostDriversChart from './TopCostDriversChart';
import CategoryComparisonChart from './CategoryComparisonChart';
import CostTrendChart from './CostTrendChart';

/**
 * @param {{
 *   aggregations: import('../../utils/excelParser').ParsedBomData['aggregations'] | null,
 *   hasTimeSeries?: boolean,
 *   exportRef?: import('react').Ref<HTMLDivElement>,
 * }} props
 */
export default function DashboardCharts({ aggregations, hasTimeSeries = false, exportRef }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const byCategory = aggregations?.byCategory ?? [];
  const topCostDrivers = aggregations?.topCostDrivers ?? [];
  const costTrend = aggregations?.costTrend ?? [];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
  };

  return (
    <div ref={exportRef} className="grid gap-4 md:grid-cols-2">
      <CostDistributionChart
        data={byCategory}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      <TopCostDriversChart
        data={topCostDrivers}
        selectedCategory={selectedCategory}
        selectedItem={selectedItem}
        onItemSelect={setSelectedItem}
      />
      <CategoryComparisonChart
        data={byCategory}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
      <CostTrendChart data={costTrend} hasTimeSeries={hasTimeSeries} />
    </div>
  );
}
