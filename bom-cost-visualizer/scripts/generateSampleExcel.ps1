# Regenerates public/samples/ornek-bom-verisi.xlsx and .csv
$csv = @"
Bileşen Adı,Kategori,Çeyrek,Birim Maliyet,Adet,Toplam Maliyet
Lidar Sensör Modülü,Sensors,Q1,450,4,1800
Ultrasonik Mesafe Sensörü,Sensors,Q1,25,20,500
Ana Kontrol İşlemcisi,Processors,Q1,120,5,600
Alüminyum Şasi,Materials,Q1,300,2,600
HMI Dokunmatik Ekran,Interfaces,Q2,150,3,450
SCADA Kontrol Yazılımı,Interfaces,Q2,500,1,500
Montaj İşçiliği,Labor,Q2,40,100,4000
Endüstriyel Görüş Kamerası,Sensors,Q2,200,6,1200
Gömülü Mikrodenetleyici,Processors,Q3,15,50,750
Çelik Montaj Braketleri,Materials,Q3,5,200,1000
Kablo Gruplaması,Electronics,Q3,80,10,800
Sistem Test İşçiliği,Labor,Q4,50,80,4000
Sıcaklık ve Nem Sensörü,Sensors,Q4,30,15,450
Güç Kaynağı Ünitesi,Electronics,Q4,90,8,720
Veri İletim Modülü,Interfaces,Q4,110,5,550
"@

$dir = Join-Path $PSScriptRoot "..\public\samples"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$utf8Bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText((Join-Path $dir "ornek-bom-verisi.csv"), $csv.Trim(), $utf8Bom)

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
$rows = $csv.Trim() -split "`n"
for ($r = 0; $r -lt $rows.Length; $r++) {
  $cols = $rows[$r] -split ","
  for ($c = 0; $c -lt $cols.Length; $c++) {
    $ws.Cells.Item($r + 1, $c + 1) = $cols[$c]
  }
}
$xlsxPath = Join-Path $dir "ornek-bom-verisi.xlsx"
if (Test-Path $xlsxPath) { Remove-Item $xlsxPath -Force }
$wb.SaveAs($xlsxPath, 51)
$wb.Close($false)
$excel.Quit()
Write-Host "Generated: $xlsxPath"
