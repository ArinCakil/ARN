import * as XLSX from 'xlsx';

/** @typedef {'componentName' | 'category' | 'unitCost' | 'quantity' | 'totalCost' | 'period' | 'budget'} ColumnKey */

/**
 * @typedef {Object} BomItem
 * @property {string} id
 * @property {string} componentName
 * @property {string} category
 * @property {string} categoryLabel
 * @property {number} unitCost
 * @property {number} quantity
 * @property {number} totalCost
 * @property {string | null} period
 * @property {number | null} budget
 */

/**
 * @typedef {Object} CategoryAggregation
 * @property {string} category
 * @property {string} label
 * @property {number} cost
 * @property {number} percentage
 * @property {number} count
 */

/**
 * @typedef {Object} CostDriver
 * @property {string} componentName
 * @property {string} category
 * @property {string} categoryLabel
 * @property {number} totalCost
 * @property {number} quantity
 * @property {number} unitCost
 */

/**
 * @typedef {Object} TrendPoint
 * @property {string} period
 * @property {number} cost
 * @property {number} itemCount
 */

/**
 * @typedef {Object} ParseSummary
 * @property {number} totalCost
 * @property {number} itemCount
 * @property {number} avgUnitCost
 * @property {{ name: string, category: string, cost: number, percentage: number } | null} topCategory
 * @property {number | null} totalBudget
 * @property {number | null} budgetVariance
 * @property {number | null} budgetVariancePercent
 * @property {boolean} hasTimeSeries
 */

/**
 * @typedef {Object} ParsedBomData
 * @property {BomItem[]} items
 * @property {ParseSummary} summary
 * @property {Object} aggregations
 * @property {CategoryAggregation[]} aggregations.byCategory
 * @property {CostDriver[]} aggregations.topCostDrivers
 * @property {TrendPoint[]} aggregations.costTrend
 * @property {Object} meta
 * @property {string} meta.fileName
 * @property {string} meta.sheetName
 * @property {number} meta.rowCount
 * @property {string} meta.parsedAt
 */

/** @type {Record<ColumnKey, string[]>} */
export const COLUMN_ALIASES = {
  componentName: [
    'component name',
    'component',
    'bileşen adı',
    'bilesen adi',
    'part name',
    'part',
    'item name',
    'item',
    'description',
    'name',
    'material name',
    'ürün adı',
    'urun adi',
  ],
  category: [
    'category',
    'kategori',
    'type',
    'discipline',
    'group',
    'grup',
    'class',
    'sınıf',
    'sinif',
    'department',
  ],
  unitCost: [
    'unit cost',
    'birim maliyet',
    'unit price',
    'price',
    'cost per unit',
    'birim fiyat',
    'unit',
  ],
  quantity: [
    'quantity',
    'miktar',
    'qty',
    'amount',
    'count',
    'adet',
    'units',
  ],
  totalCost: [
    'total cost',
    'toplam maliyet',
    'extended cost',
    'line total',
    'total',
    'toplam',
    'amount total',
    'grand total',
  ],
  period: [
    'period',
    'dönem',
    'donem',
    'quarter',
    'çeyrek',
    'ceyrek',
    'q1',
    'q2',
    'q3',
    'q4',
    'date',
    'month',
    'year',
    'time',
    'fiscal period',
  ],
  budget: [
    'budget',
    'bütçe',
    'butce',
    'target',
    'planned',
    'planlanan',
    'budgeted',
  ],
};

/** @type {Record<string, string>} */
export const CATEGORY_MAP = {
  mechanical: 'mechanical',
  mekanik: 'mechanical',
  electronics: 'electronics',
  elektronik: 'electronics',
  electronic: 'electronics',
  structural: 'structural',
  yapısal: 'structural',
  yapisal: 'structural',
  sensors: 'sensors',
  sensor: 'sensors',
  sensör: 'sensors',
  sensorler: 'sensors',
  processors: 'processors',
  processor: 'processors',
  işlemci: 'processors',
  islemci: 'processors',
  işlemciler: 'processors',
  materials: 'materials',
  material: 'materials',
  malzeme: 'materials',
  malzemeler: 'materials',
  assembly: 'assembly',
  montaj: 'assembly',
  labor: 'labor',
  işçilik: 'labor',
  iscilik: 'labor',
  workforce: 'labor',
  labour: 'labor',
  interfaces: 'interfaces',
  interface: 'interfaces',
  arayüz: 'interfaces',
  arayuz: 'interfaces',
  arayüzler: 'interfaces',
};

const TOP_DRIVERS_LIMIT = 10;

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\-./]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * @param {unknown} value
 * @returns {number}
 */
export function parseNumericValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const raw = String(value ?? '').trim();
  if (!raw) return 0;

  const cleaned = raw
    .replace(/[^\d.,\-()]/g, '')
    .replace(/\((.*)\)/, '-$1');

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let normalized = cleaned;

  if (hasComma && hasDot) {
    normalized =
      cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeCategory(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 'other';

  const key = raw.toLowerCase().replace(/\s+/g, ' ');
  return CATEGORY_MAP[key] ?? 'other';
}

/**
 * @param {string[]} headers
 * @returns {Partial<Record<ColumnKey, number>>}
 */
export function mapColumns(headers) {
  /** @type {Partial<Record<ColumnKey, number>>} */
  const mapping = {};

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    if (!normalized) return;

    for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (mapping[key] !== undefined) continue;

      const matched = aliases.some(
        (alias) =>
          normalized === alias ||
          normalized.includes(alias) ||
          alias.includes(normalized),
      );

      if (matched) {
        mapping[key] = index;
      }
    }
  });

  return mapping;
}

/**
 * @param {unknown[][]} rows
 * @returns {{ headerRowIndex: number, columnMap: Partial<Record<ColumnKey, number>> }}
 */
export function detectHeaderRow(rows) {
  let bestIndex = 0;
  let bestScore = 0;
  /** @type {Partial<Record<ColumnKey, number>>} */
  let bestMap = {};

  const scanLimit = Math.min(rows.length, 20);

  for (let i = 0; i < scanLimit; i += 1) {
    const row = rows[i] ?? [];
    const headers = row.map((cell) => String(cell ?? ''));
    const columnMap = mapColumns(headers);
    const score = Object.keys(columnMap).length;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
      bestMap = columnMap;
    }
  }

  if (!bestMap.componentName && !bestMap.totalCost) {
    throw new Error('MISSING_REQUIRED_COLUMNS');
  }

  return { headerRowIndex: bestIndex, columnMap: bestMap };
}

/**
 * @param {unknown[]} row
 * @param {Partial<Record<ColumnKey, number>>} columnMap
 * @returns {BomItem | null}
 */
export function rowToBomItem(row, columnMap) {
  const getValue = (key) => {
    const index = columnMap[key];
    return index === undefined ? undefined : row[index];
  };

  const componentName = String(getValue('componentName') ?? '').trim();
  const categoryRaw = getValue('category');
  const unitCost = parseNumericValue(getValue('unitCost'));
  const quantity = parseNumericValue(getValue('quantity')) || 1;
  let totalCost = parseNumericValue(getValue('totalCost'));
  const periodValue = getValue('period');
  const budgetValue = getValue('budget');

  if (!componentName && totalCost === 0 && unitCost === 0) {
    return null;
  }

  if (totalCost === 0 && unitCost > 0) {
    totalCost = unitCost * quantity;
  }

  const category = normalizeCategory(categoryRaw);
  const period = periodValue ? String(periodValue).trim() : null;
  const budget =
    budgetValue !== undefined && budgetValue !== ''
      ? parseNumericValue(budgetValue)
      : null;

  return {
    id: crypto.randomUUID(),
    componentName: componentName || 'Unnamed Component',
    category,
    categoryLabel: String(categoryRaw ?? category).trim() || category,
    unitCost,
    quantity,
    totalCost,
    period,
    budget,
  };
}

/**
 * @param {BomItem[]} items
 * @returns {CategoryAggregation[]}
 */
export function aggregateByCategory(items) {
  const totals = new Map();

  items.forEach((item) => {
    const existing = totals.get(item.category) ?? {
      category: item.category,
      label: item.categoryLabel,
      cost: 0,
      count: 0,
    };

    existing.cost += item.totalCost;
    existing.count += 1;
    totals.set(item.category, existing);
  });

  const grandTotal = items.reduce((sum, item) => sum + item.totalCost, 0);

  return Array.from(totals.values())
    .map((entry) => ({
      ...entry,
      percentage: grandTotal > 0 ? (entry.cost / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost);
}

/**
 * @param {BomItem[]} items
 * @param {number} [limit]
 * @returns {CostDriver[]}
 */
export function getTopCostDrivers(items, limit = TOP_DRIVERS_LIMIT) {
  return [...items]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, limit)
    .map((item) => ({
      componentName: item.componentName,
      category: item.category,
      categoryLabel: item.categoryLabel,
      totalCost: item.totalCost,
      quantity: item.quantity,
      unitCost: item.unitCost,
    }));
}

/**
 * @param {BomItem[]} items
 * @returns {TrendPoint[]}
 */
export function aggregateCostTrend(items) {
  const periods = new Map();

  items.forEach((item) => {
    if (!item.period) return;

    const existing = periods.get(item.period) ?? {
      period: item.period,
      cost: 0,
      itemCount: 0,
    };

    existing.cost += item.totalCost;
    existing.itemCount += 1;
    periods.set(item.period, existing);
  });

  return Array.from(periods.values()).sort((a, b) =>
    a.period.localeCompare(b.period, undefined, { numeric: true }),
  );
}

/**
 * @param {BomItem[]} items
 * @returns {ParseSummary}
 */
export function buildSummary(items) {
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  const itemCount = items.length;
  const avgUnitCost =
    itemCount > 0
      ? items.reduce((sum, item) => sum + item.unitCost, 0) / itemCount
      : 0;

  const byCategory = aggregateByCategory(items);
  const top = byCategory[0] ?? null;

  const budgetRows = items.filter((item) => item.budget !== null);
  const totalBudget =
    budgetRows.length > 0
      ? budgetRows.reduce((sum, item) => sum + (item.budget ?? 0), 0)
      : null;

  const budgetVariance =
    totalBudget !== null ? totalCost - totalBudget : null;

  const budgetVariancePercent =
    totalBudget !== null && totalBudget !== 0
      ? ((totalCost - totalBudget) / totalBudget) * 100
      : null;

  const hasTimeSeries = items.some((item) => Boolean(item.period));

  return {
    totalCost,
    itemCount,
    avgUnitCost,
    topCategory: top
      ? {
          name: top.label,
          category: top.category,
          cost: top.cost,
          percentage: top.percentage,
        }
      : null,
    totalBudget,
    budgetVariance,
    budgetVariancePercent,
    hasTimeSeries,
  };
}

/**
 * @param {unknown[][]} rows
 * @param {Partial<Record<ColumnKey, number>>} columnMap
 * @param {number} headerRowIndex
 * @returns {BomItem[]}
 */
export function parseRows(rows, columnMap, headerRowIndex) {
  const items = [];

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || row.every((cell) => cell === undefined || cell === '')) {
      continue;
    }

    const item = rowToBomItem(row, columnMap);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * @param {ArrayBuffer} buffer
 * @param {{ fileName?: string, sheetName?: string }} [options]
 * @returns {ParsedBomData}
 */
export function parseWorkbookBuffer(buffer, options = {}) {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = options.sheetName ?? workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('EMPTY_WORKBOOK');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (!rows.length) {
    throw new Error('EMPTY_SHEET');
  }

  const { headerRowIndex, columnMap } = detectHeaderRow(rows);
  const items = parseRows(rows, columnMap, headerRowIndex);

  if (!items.length) {
    throw new Error('NO_VALID_ROWS');
  }

  const byCategory = aggregateByCategory(items);
  const topCostDrivers = getTopCostDrivers(items);
  const costTrend = aggregateCostTrend(items);
  const summary = buildSummary(items);

  return {
    items,
    summary,
    aggregations: {
      byCategory,
      topCostDrivers,
      costTrend,
    },
    meta: {
      fileName: options.fileName ?? 'unknown.xlsx',
      sheetName,
      rowCount: items.length,
      parsedAt: new Date().toISOString(),
    },
  };
}

/**
 * @param {File} file
 * @returns {Promise<ParsedBomData>}
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('NO_FILE'));
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension ?? '')) {
      reject(new Error('UNSUPPORTED_FORMAT'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          reject(new Error('READ_ERROR'));
          return;
        }

        const result = parseWorkbookBuffer(buffer, { fileName: file.name });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('READ_ERROR'));
    reader.readAsArrayBuffer(file);
  });
}
