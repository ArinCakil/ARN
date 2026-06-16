import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const samplesDir = join(root, 'public', 'samples');

function csvToRows(csvText) {
  return csvText
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(','));
}

function writeWorkbook(rows, fileName) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, join(samplesDir, fileName));
}

const trCsv = readFileSync(join(samplesDir, 'ornek-bom-verisi.csv'), 'utf8');
const enCsv = readFileSync(join(samplesDir, 'sample-bom-data.csv'), 'utf8');

writeWorkbook(csvToRows(trCsv), 'ornek-bom-verisi.xlsx');
writeWorkbook(csvToRows(enCsv), 'sample-bom-data.xlsx');

console.log('Generated ornek-bom-verisi.xlsx and sample-bom-data.xlsx');
