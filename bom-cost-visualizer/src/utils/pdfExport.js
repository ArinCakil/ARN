import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  formatCurrency,
  formatPercent,
  getCategoryLabel,
} from './formatters';

const MARGIN = 14;
const FONT_URL = '/fonts/NotoSans-Regular.ttf';

/** @type {string | null} */
let cachedFontBase64 = null;

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * @param {jsPDF} doc
 * @returns {Promise<string>}
 */
async function ensureTurkishFont(doc) {
  try {
    if (!cachedFontBase64) {
      const response = await fetch(FONT_URL);
      if (!response.ok) throw new Error('font fetch failed');
      cachedFontBase64 = arrayBufferToBase64(await response.arrayBuffer());
    }

    doc.addFileToVFS('NotoSans-Regular.ttf', cachedFontBase64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans', 'normal');
    return 'NotoSans';
  } catch {
    doc.setFont('helvetica', 'normal');
    return 'helvetica';
  }
}

/**
 * @param {HTMLElement} root
 */
function applyExportStyles(root) {
  const colorMap = {
    'bg-primary-900': '#0f172a',
    'bg-primary-800': '#1e3a8a',
    'bg-accent-green': '#059669',
    'bg-accent-orange': '#ea580c',
    'bg-surface': '#f8fafc',
    'bg-white': '#ffffff',
    'bg-background': '#ffffff',
    'text-primary-900': '#0f172a',
    'text-primary-800': '#1e3a8a',
    'text-muted': '#64748b',
    'text-white': '#ffffff',
    'border-border': '#e2e8f0',
  };

  const walk = (el) => {
    if (!(el instanceof HTMLElement)) return;

    el.style.fontFamily = 'Arial, sans-serif';
    el.style.boxSizing = 'border-box';

    if (el.className && typeof el.className === 'string') {
      Object.entries(colorMap).forEach(([cls, color]) => {
        if (el.classList.contains(cls)) {
          if (cls.startsWith('bg-')) el.style.backgroundColor = color;
          if (cls.startsWith('text-')) el.style.color = color;
          if (cls.startsWith('border-')) el.style.borderColor = color;
        }
      });
    }

    if (el.tagName === 'svg' || el.closest('svg')) {
      el.querySelectorAll?.('[fill]').forEach((node) => {
        const fill = node.getAttribute('fill');
        if (fill && (fill.includes('lab') || fill.includes('oklch'))) {
          node.setAttribute('fill', '#1e3a8a');
        }
      });
    }

    Array.from(el.children).forEach(walk);
  };

  walk(root);
}

/**
 * @param {HTMLElement} element
 * @returns {Promise<HTMLCanvasElement>}
 */
async function captureElement(element) {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: false,
    onclone: (clonedDoc, clonedElement) => {
      clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        node.remove();
      });
      applyExportStyles(clonedElement);
    },
  });
}

/**
 * @param {jsPDF} doc
 * @param {HTMLCanvasElement} canvas
 * @param {number} startY
 * @returns {number}
 */
function addCanvasToPdf(doc, canvas, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  const ratio = contentWidth / canvas.width;
  const imgHeight = canvas.height * ratio;

  let offsetY = 0;
  let y = startY;

  while (offsetY < imgHeight) {
    const available = pageHeight - y - MARGIN;
    if (available <= 10) {
      doc.addPage();
      y = MARGIN;
      continue;
    }

    const sliceHeight = Math.min(available, imgHeight - offsetY);
    const srcHeight = sliceHeight / ratio;

    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = srcHeight;
    const ctx = slice.getContext('2d');
    if (!ctx) break;

    ctx.drawImage(
      canvas,
      0,
      offsetY / ratio,
      canvas.width,
      srcHeight,
      0,
      0,
      canvas.width,
      srcHeight,
    );

    doc.addImage(
      slice.toDataURL('image/png'),
      'PNG',
      MARGIN,
      y,
      contentWidth,
      sliceHeight,
    );

    offsetY += sliceHeight;
    y += sliceHeight;

    if (offsetY < imgHeight) {
      doc.addPage();
      y = MARGIN;
    }
  }

  return y + 6;
}

/**
 * @param {jsPDF} doc
 * @param {number} y
 * @param {string} title
 */
function addSectionTitle(doc, y, title) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y > pageHeight - 30) {
    doc.addPage();
    y = MARGIN;
  }

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(title, MARGIN, y);
  return y + 8;
}

/**
 * @param {{
 *   data: import('./excelParser').ParsedBomData,
 *   t: (key: string, opts?: object) => string,
 *   locale: string,
 *   kpiElement?: HTMLElement | null,
 *   chartElements?: HTMLElement[],
 * }} options
 */
export async function exportDashboardPdf({
  data,
  t,
  locale,
  kpiElement,
  chartElements = [],
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const fontName = await ensureTurkishFont(doc);

  let y = MARGIN;

  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(t('export.reportTitle'), MARGIN, y);
  y += 9;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(t('app.tagline'), MARGIN, y);
  y += 7;

  doc.text(
    `${t('export.generatedAt')}: ${new Date().toLocaleString(locale)}`,
    MARGIN,
    y,
  );
  y += 5;
  doc.text(
    t('upload.loadedFile', { fileName: data.meta.fileName }),
    MARGIN,
    y,
  );
  y += 5;
  doc.text(
    t('upload.rowsParsed', { count: data.meta.rowCount }),
    MARGIN,
    y,
  );
  y += 10;

  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, doc.internal.pageSize.getWidth() - MARGIN, y);
  y += 8;

  y = addSectionTitle(doc, y, t('export.summary'));

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const { summary } = data;
  const summaryLines = [
    `${t('kpi.totalCost')}: ${formatCurrency(summary.totalCost, locale)}`,
    `${t('kpi.itemCount')}: ${summary.itemCount}`,
    `${t('kpi.avgUnitCost')}: ${formatCurrency(summary.avgUnitCost, locale)}`,
    summary.topCategory
      ? `${t('kpi.topCategory')}: ${getCategoryLabel(summary.topCategory.category, t)} (${formatPercent(summary.topCategory.percentage)})`
      : `${t('kpi.topCategory')}: ${t('common.notAvailable')}`,
    summary.budgetVariance !== null
      ? `${t('kpi.budgetVariance')}: ${formatCurrency(summary.budgetVariance, locale)}`
      : `${t('kpi.budgetVariance')}: ${t('common.notAvailable')}`,
  ];

  summaryLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 5;
  });
  y += 4;

  if (kpiElement) {
    try {
      y = addSectionTitle(doc, y, t('export.kpiCards'));
      const kpiCanvas = await captureElement(kpiElement);
      y = addCanvasToPdf(doc, kpiCanvas, y);
    } catch (err) {
      console.warn('KPI capture skipped:', err);
    }
  }

  if (chartElements.length) {
    y = addSectionTitle(doc, y, t('export.charts'));
    for (const chartEl of chartElements) {
      try {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y > pageHeight - 80) {
          doc.addPage();
          y = MARGIN;
        }
        const canvas = await captureElement(chartEl);
        y = addCanvasToPdf(doc, canvas, y);
      } catch (err) {
        console.warn('Chart capture skipped:', err);
      }
    }
  }

  doc.addPage();
  y = MARGIN;
  y = addSectionTitle(doc, y, t('table.title'));

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      t('table.columns.componentName'),
      t('table.columns.category'),
      t('table.columns.unitCost'),
      t('table.columns.quantity'),
      t('table.columns.totalCost'),
      t('table.columns.period'),
    ]],
    body: data.items.map((item) => [
      item.componentName,
      getCategoryLabel(item.category, t),
      formatCurrency(item.unitCost, locale),
      String(item.quantity),
      formatCurrency(item.totalCost, locale),
      item.period ?? t('common.notAvailable'),
    ]),
    styles: {
      font: fontName,
      fontSize: 8,
      cellPadding: 2,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'normal',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: 'grid',
  });

  const fileName = `bom-report-${data.meta.fileName.replace(/\.[^.]+$/, '')}.pdf`;
  doc.save(fileName);
}
