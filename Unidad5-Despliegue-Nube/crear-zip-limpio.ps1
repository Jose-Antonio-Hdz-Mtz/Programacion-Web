# ============================================================
# crear-zip-limpio.ps1
# Genera un ZIP del proyecto SIN node_modules ni .env
#
# Uso:
#   Abre PowerShell en la raíz del proyecto y ejecuta:
#   .\crear-zip-limpio.ps1
# ============================================================

$proyecto   = "Unidad4-Servidor-IA"
$destino    = "..\${proyecto}-entrega.zip"
$excluidos  = @(
    "*\node_modules\*",
    "*\.env",
    "*\.vercel\*",
    "*\npm-debug.log*"
)

Write-Host "`n🗜️  Creando ZIP limpio de $proyecto..." -ForegroundColor Cyan

# Recopilar todos los archivos excepto los excluidos
$archivos = Get-ChildItem -Recurse -File | Where-Object {
    $ruta = $_.FullName
    $excluido = $false
    foreach ($patron in $excluidos) {
        if ($ruta -like $patron) { $excluido = $true; break }
    }
    -not $excluido
}

Write-Host "📁 Archivos a incluir: $($archivos.Count)" -ForegroundColor Green

# Eliminar ZIP anterior si existe
if (Test-Path $destino) { Remove-Item $destino }

# Crear el ZIP
Compress-Archive -Path $archivos.FullName -DestinationPath $destino -ErrorAction Stop 2>$null

# Alternativa más fiable: comprimir la carpeta y luego limpiar
# (comentada porque el método anterior es más selectivo)

Write-Host "✅ ZIP creado en: $destino" -ForegroundColor Green
Write-Host "📊 Tamaño: $([math]::Round((Get-Item $destino).Length / 1KB, 1)) KB`n" -ForegroundColor Cyan
