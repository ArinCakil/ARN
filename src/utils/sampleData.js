import {
  aggregateByCategory,
  aggregateCostTrend,
  buildSummary,
  getTopCostDrivers,
} from './excelParser';

/** @type {import('./excelParser').BomItem[]} */
const SAMPLE_ITEMS = [
  { id: '1', componentName: 'Lidar Sensör Modülü', category: 'sensors', categoryLabel: 'Sensors', unitCost: 450, quantity: 4, totalCost: 1800, period: 'Q1', budget: 2000 },
  { id: '2', componentName: 'Ultrasonik Mesafe Sensörü', category: 'sensors', categoryLabel: 'Sensors', unitCost: 25, quantity: 20, totalCost: 500, period: 'Q1', budget: 550 },
  { id: '3', componentName: 'Ana Kontrol İşlemcisi', category: 'processors', categoryLabel: 'Processors', unitCost: 120, quantity: 5, totalCost: 600, period: 'Q1', budget: 650 },
  { id: '4', componentName: 'Alüminyum Şasi', category: 'materials', categoryLabel: 'Materials', unitCost: 300, quantity: 2, totalCost: 600, period: 'Q1', budget: 700 },
  { id: '5', componentName: 'HMI Dokunmatik Ekran', category: 'interfaces', categoryLabel: 'Interfaces', unitCost: 150, quantity: 3, totalCost: 450, period: 'Q2', budget: 500 },
  { id: '6', componentName: 'SCADA Kontrol Yazılımı', category: 'interfaces', categoryLabel: 'Interfaces', unitCost: 500, quantity: 1, totalCost: 500, period: 'Q2', budget: 480 },
  { id: '7', componentName: 'Montaj İşçiliği', category: 'labor', categoryLabel: 'Labor', unitCost: 40, quantity: 100, totalCost: 4000, period: 'Q2', budget: 3800 },
  { id: '8', componentName: 'Endüstriyel Görüş Kamerası', category: 'sensors', categoryLabel: 'Sensors', unitCost: 200, quantity: 6, totalCost: 1200, period: 'Q2', budget: 1300 },
  { id: '9', componentName: 'Gömülü Mikrodenetleyici', category: 'processors', categoryLabel: 'Processors', unitCost: 15, quantity: 50, totalCost: 750, period: 'Q3', budget: 800 },
  { id: '10', componentName: 'Çelik Montaj Braketleri', category: 'materials', categoryLabel: 'Materials', unitCost: 5, quantity: 200, totalCost: 1000, period: 'Q3', budget: 1100 },
  { id: '11', componentName: 'Kablo Gruplaması', category: 'electronics', categoryLabel: 'Electronics', unitCost: 80, quantity: 10, totalCost: 800, period: 'Q3', budget: 850 },
  { id: '12', componentName: 'Sistem Test İşçiliği', category: 'labor', categoryLabel: 'Labor', unitCost: 50, quantity: 80, totalCost: 4000, period: 'Q4', budget: 4200 },
  { id: '13', componentName: 'Sıcaklık ve Nem Sensörü', category: 'sensors', categoryLabel: 'Sensors', unitCost: 30, quantity: 15, totalCost: 450, period: 'Q4', budget: 500 },
  { id: '14', componentName: 'Güç Kaynağı Ünitesi', category: 'electronics', categoryLabel: 'Electronics', unitCost: 90, quantity: 8, totalCost: 720, period: 'Q4', budget: 750 },
  { id: '15', componentName: 'Veri İletim Modülü', category: 'interfaces', categoryLabel: 'Interfaces', unitCost: 110, quantity: 5, totalCost: 550, period: 'Q4', budget: 600 },
];

/** @type {import('./excelParser').ParsedBomData} */
export const SAMPLE_BOM_DATA = {
  items: SAMPLE_ITEMS,
  summary: buildSummary(SAMPLE_ITEMS),
  aggregations: {
    byCategory: aggregateByCategory(SAMPLE_ITEMS),
    topCostDrivers: getTopCostDrivers(SAMPLE_ITEMS),
    costTrend: aggregateCostTrend(SAMPLE_ITEMS),
  },
  meta: {
    fileName: 'ornek-bom-verisi.xlsx',
    sheetName: 'Sheet1',
    rowCount: SAMPLE_ITEMS.length,
    parsedAt: new Date().toISOString(),
  },
};

export const SAMPLE_FILE_PATH = '/samples/ornek-bom-verisi.xlsx';
export const SAMPLE_FILE_PATH_EN = '/samples/sample-bom-data.xlsx';

/**
 * @param {string} language
 * @returns {string}
 */
export function getSampleFilePath(language) {
  return language === 'tr' ? SAMPLE_FILE_PATH : SAMPLE_FILE_PATH_EN;
}

/**
 * @param {string} language
 * @returns {string}
 */
export function getSampleFileName(language) {
  return language === 'tr' ? 'ornek-bom-verisi.xlsx' : 'sample-bom-data.xlsx';
}
