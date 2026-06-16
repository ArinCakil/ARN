# Regenerates public/samples/ornek-bom-verisi.xlsx from CSV
$csvPath = Join-Path $PSScriptRoot "..\public\samples\ornek-bom-verisi.csv"
$dir = Join-Path $PSScriptRoot "..\public\samples"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

Push-Location (Join-Path $PSScriptRoot "..")
try {
  node scripts/generateSampleExcel.mjs
} finally {
  Pop-Location
}

Write-Host "Generated sample files from $csvPath"
