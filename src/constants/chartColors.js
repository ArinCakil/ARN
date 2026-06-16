export const CHART_COLORS = [
  '#1e3a8a',
  '#0d9488',
  '#059669',
  '#ea580c',
  '#0284c7',
  '#6366f1',
  '#0f766e',
  '#c2410c',
  '#1d4ed8',
  '#64748b',
];

/**
 * @param {number} index
 * @returns {string}
 */
export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export const CHART_THEME = {
  grid: '#e2e8f0',
  axis: '#64748b',
  tooltipBg: '#0f172a',
  tooltipBorder: '#1e3a8a',
};
