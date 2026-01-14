# build-extension.ps1
# Chrome Web Store ZIP Builder für FBA Finder

Write-Host "📦 FBA Finder - Chrome Web Store Package Builder" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Pfade definieren
$projectRoot = $PSScriptRoot
$buildDir = Join-Path $projectRoot "build"
$zipFile = Join-Path $projectRoot "fba-finder-chrome-store.zip"

# Dateien, die NICHT ins ZIP sollen
$excludePatterns = @(
    ".git",
    ".github",
    "ralph",
    "node_modules",
    ".prettierrc",
    ".prettierignore",
    "generate-icons.html",
    "build-extension.ps1",
    "*.zip",
    "*.md~",
    ".DS_Store",
    "Thumbs.db",
    "build"
)

# Dateien, die ins ZIP MÜSSEN
$requiredFiles = @(
    "manifest.json",
    "content.js",
    "background.js",
    "popup.html",
    "popup.js",
    "options.html",
    "options.js",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png"
)

Write-Host "🔍 Checking required files..." -ForegroundColor Yellow

# Prüfe, ob alle notwendigen Dateien existieren
$missingFiles = @()
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $projectRoot $file
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ ERROR: Missing required files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "💡 Tip: Run generate-icons.html to create PNG icons" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All required files found" -ForegroundColor Green
Write-Host ""

# Alte Build-Dateien löschen
if (Test-Path $zipFile) {
    Write-Host "🗑️  Removing old ZIP file..." -ForegroundColor Yellow
    Remove-Item $zipFile -Force
}

if (Test-Path $buildDir) {
    Write-Host "🗑️  Cleaning build directory..." -ForegroundColor Yellow
    Remove-Item $buildDir -Recurse -Force
}

# Build-Verzeichnis erstellen
Write-Host "📁 Creating build directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

# Dateien kopieren (mit Ausnahme der Exclude-Patterns)
Write-Host "📋 Copying extension files..." -ForegroundColor Yellow

Get-ChildItem -Path $projectRoot -Recurse | Where-Object {
    # Prüfe, ob der Pfad NICHT in den Exclude-Patterns ist
    $relativePath = $_.FullName.Substring($projectRoot.Length + 1)
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
} | ForEach-Object {
    if (-not $_.PSIsContainer) {
        $relativePath = $_.FullName.Substring($projectRoot.Length + 1)
        $targetPath = Join-Path $buildDir $relativePath
        $targetDir = Split-Path $targetPath -Parent
        
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        
        Copy-Item $_.FullName -Destination $targetPath
        Write-Host "   ✓ $relativePath" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🗜️  Creating ZIP archive..." -ForegroundColor Yellow

# ZIP erstellen
Compress-Archive -Path "$buildDir\*" -DestinationPath $zipFile -CompressionLevel Optimal

# Build-Verzeichnis aufräumen
Remove-Item $buildDir -Recurse -Force

# Dateigröße anzeigen
$zipSize = (Get-Item $zipFile).Length / 1KB
Write-Host ""
Write-Host "✅ SUCCESS! Chrome Web Store package created:" -ForegroundColor Green
Write-Host "   📦 File: $zipFile" -ForegroundColor Cyan
Write-Host "   📊 Size: $([math]::Round($zipSize, 2)) KB" -ForegroundColor Cyan
Write-Host ""
Write-Host "📤 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://chrome.google.com/webstore/devconsole" -ForegroundColor White
Write-Host "   2. Click 'New Item'" -ForegroundColor White
Write-Host "   3. Upload: fba-finder-chrome-store.zip" -ForegroundColor White
Write-Host "   4. Fill in store listing details from STORE_LISTING.md" -ForegroundColor White
Write-Host ""
