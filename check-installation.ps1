# Quick installation checker for Pennwest Connect
Write-Host "=== Pennwest Connect Installation Check ===" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host " ✓ FOUND ($nodeVersion)" -ForegroundColor Green
    } else {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        Write-Host "   Install from: https://nodejs.org/" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "   Install from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host " ✓ FOUND ($npmVersion)" -ForegroundColor Green
    } else {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    $allGood = $false
}

# Check Python
Write-Host "Checking Python..." -NoNewline
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host " ✓ FOUND ($pythonVersion)" -ForegroundColor Green
    } else {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        Write-Host "   Install from: https://www.python.org/downloads/" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    Write-Host "   Install from: https://www.python.org/downloads/" -ForegroundColor Yellow
    $allGood = $false
}

# Check pip
Write-Host "Checking pip..." -NoNewline
try {
    $pipVersion = pip --version 2>$null
    if ($pipVersion) {
        Write-Host " ✓ FOUND" -ForegroundColor Green
    } else {
        Write-Host " ✗ NOT FOUND" -ForegroundColor Red
        Write-Host "   Try: python -m pip --version" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ✗ NOT FOUND" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "✓ All requirements are installed! You can proceed with setup." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. npm install" -ForegroundColor White
    Write-Host "  2. cd backend" -ForegroundColor White
    Write-Host "  3. python -m venv venv" -ForegroundColor White
    Write-Host "  4. venv\Scripts\activate" -ForegroundColor White
    Write-Host "  5. pip install -r requirements.txt" -ForegroundColor White
} else {
    Write-Host "✗ Some requirements are missing. Please install them first." -ForegroundColor Red
    Write-Host ""
    Write-Host "See INSTALLATION.md for detailed instructions." -ForegroundColor Yellow
}



