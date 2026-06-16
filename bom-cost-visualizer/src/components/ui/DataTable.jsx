import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import {
  formatCurrency,
  getCategoryLabel,
} from '../../utils/formatters';

/** @typedef {'componentName' | 'category' | 'unitCost' | 'quantity' | 'totalCost' | 'period'} SortKey */

const COLUMNS = [
  { key: 'componentName', labelKey: 'table.columns.componentName', align: 'left' },
  { key: 'category', labelKey: 'table.columns.category', align: 'left' },
  { key: 'unitCost', labelKey: 'table.columns.unitCost', align: 'right' },
  { key: 'quantity', labelKey: 'table.columns.quantity', align: 'right' },
  { key: 'totalCost', labelKey: 'table.columns.totalCost', align: 'right' },
  { key: 'period', labelKey: 'table.columns.period', align: 'left' },
];

/**
 * @param {{
 *   items: import('../../utils/excelParser').BomItem[],
 * }} props
 */
export default function DataTable({ items }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(/** @type {SortKey} */ ('totalCost'));
  const [sortDir, setSortDir] = useState(/** @type {'asc' | 'desc'} */ ('desc'));

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const categoryLabel = getCategoryLabel(item.category, t).toLowerCase();
      return (
        item.componentName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        categoryLabel.includes(query) ||
        (item.period?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [items, search, t]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === 'category') {
        const aLabel = getCategoryLabel(a.category, t);
        const bLabel = getCategoryLabel(b.category, t);
        return sortDir === 'asc'
          ? aLabel.localeCompare(bLabel)
          : bLabel.localeCompare(aLabel);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');
      return sortDir === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [filteredItems, sortKey, sortDir, t]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'componentName' || key === 'category' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted/50" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary-800" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary-800" />
    );
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="text-base font-semibold text-primary-900">
          {t('table.title')}
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted">
            {t('table.rows', { count: sortedItems.length })}
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('table.search')}
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-primary-900 outline-none transition-colors focus:border-primary-800 focus:ring-1 focus:ring-primary-800 sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {COLUMNS.map(({ key, labelKey, align }) => (
                <th
                  key={key}
                  className={`px-4 py-3 font-medium text-muted ${
                    align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className={`inline-flex items-center gap-1.5 transition-colors hover:text-primary-900 ${
                      align === 'right' ? 'ml-auto' : ''
                    }`}
                  >
                    {t(labelKey)}
                    <SortIcon column={key} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-border transition-colors hover:bg-surface ${
                  index % 2 === 0 ? 'bg-white' : 'bg-white'
                }`}
              >
                <td className="px-4 py-3 font-medium text-primary-900">
                  {item.componentName}
                </td>
                <td className="px-4 py-3 text-primary-900">
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium">
                    {getCategoryLabel(item.category, t)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-primary-900">
                  {formatCurrency(item.unitCost, locale)}
                </td>
                <td className="px-4 py-3 text-right text-primary-900">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right font-medium text-primary-900">
                  {formatCurrency(item.totalCost, locale)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {item.period ?? t('common.notAvailable')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
