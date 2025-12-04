# Installation Guide for Windows

You need to install Node.js and Python to run Pennwest Connect. Follow these steps:

## Step 1: Install Node.js

### Option A: Official Installer (Recommended)
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (Long Term Support)
3. Run the installer
4. Check "Automatically install the necessary tools" if prompted
5. Restart your terminal/PowerShell after installation

### Option B: Using Chocolatey (if you have it)
```powershell
choco install nodejs-lts
```

### Option C: Using Winget (Windows 10/11)
```powershell
winget install OpenJS.NodeJS.LTS
```

### Verify Installation
After installing, restart PowerShell and run:
```powershell
node --version
npm --version
```

You should see version numbers (e.g., `v20.10.0` and `10.2.3`)

## Step 2: Install Python

### Option A: Official Installer (Recommended)
1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Download Python 3.11 or 3.12 (latest stable)
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. Choose "Install Now" or "Customize installation"
5. Restart your terminal/PowerShell after installation

### Option B: Using Microsoft Store
1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Click "Install"
4. Restart PowerShell

### Option C: Using Winget
```powershell
winget install Python.Python.3.12
```

### Verify Installation
After installing, restart PowerShell and run:
```powershell
python --version
pip --version
```

You should see version numbers (e.g., `Python 3.12.0`)

## Step 3: Install Project Dependencies

Once both are installed:

### Install Frontend Dependencies
```powershell
npm install
```

### Install Backend Dependencies
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

## Step 4: Run the Application

### Terminal 1 - Backend
```powershell
cd backend
venv\Scripts\activate
python main.py
```

### Terminal 2 - Frontend
```powershell
npm run dev
```

## Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed
- **Restart PowerShell** after installing Node.js
- Check if Node.js is in PATH: `$env:PATH -split ';' | Select-String node`

### "python is not recognized"
- Make sure Python is installed
- **Restart PowerShell** after installing Python
- Reinstall Python and check "Add Python to PATH"
- Or manually add Python to PATH:
  1. Search "Environment Variables" in Windows
  2. Edit "Path" variable
  3. Add: `C:\Users\YourUsername\AppData\Local\Programs\Python\Python3XX`
  4. Add: `C:\Users\YourUsername\AppData\Local\Programs\Python\Python3XX\Scripts`

### "pip is not recognized"
- Python should include pip automatically
- Try: `python -m pip --version`
- If that works, use `python -m pip install` instead of `pip install`

### Virtual Environment Issues
- Make sure you're in the `backend` directory
- Use: `python -m venv venv` (not just `venv`)
- Activate with: `venv\Scripts\activate` (Windows) or `.\venv\Scripts\Activate.ps1`

## Alternative: Use Docker (If You Have Docker Desktop)

If you have Docker Desktop installed, you can skip Node.js/Python installation:

```powershell
docker-compose up
```

This will handle everything automatically!

## Quick Check Script

Run this to check what's installed:

```powershell
Write-Host "Node.js:" -NoNewline; node --version 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host " NOT INSTALLED" }
Write-Host "npm:" -NoNewline; npm --version 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host " NOT INSTALLED" }
Write-Host "Python:" -NoNewline; python --version 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host " NOT INSTALLED" }
Write-Host "pip:" -NoNewline; pip --version 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host " NOT INSTALLED" }
```

## Need Help?

- Node.js issues: [nodejs.org](https://nodejs.org/)
- Python issues: [python.org](https://www.python.org/)
- Project issues: Check the main README.md




