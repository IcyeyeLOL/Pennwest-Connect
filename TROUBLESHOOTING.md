# Troubleshooting Guide

## NetworkError: Failed to fetch / Cannot connect to server

This error means the frontend cannot reach the backend API. Here's how to fix it:

### Step 1: Check if Backend is Running

**Open a new terminal/PowerShell window and run:**

```powershell
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

If you see errors, check:
- Python is installed: `python --version`
- Dependencies are installed: `pip install -r requirements.txt`
- Virtual environment is activated (if using one)

### Step 2: Verify Backend is Accessible

**Open your browser and go to:**
```
http://localhost:8000
```

You should see:
```json
{"message": "Pennwest Connect API"}
```

If you see this, the backend is running correctly!

### Step 3: Check Frontend Configuration

**Make sure your frontend is using the correct API URL:**

1. Check if you have a `.env.local` file in the root directory
2. If not, create one with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Restart your Next.js dev server after creating/updating `.env.local`

### Step 4: Restart Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Step 5: Check for Port Conflicts

If port 8000 is already in use:

1. **Find what's using port 8000:**
   ```powershell
   netstat -ano | findstr :8000
   ```

2. **Or change the backend port:**
   - Edit `backend/main.py`
   - Change the last line from `port=8000` to `port=8001`
   - Update `.env.local` to `NEXT_PUBLIC_API_URL=http://localhost:8001`

### Common Issues

#### Issue: "Module not found" errors in backend
**Solution:**
```powershell
cd backend
pip install -r requirements.txt
```

#### Issue: "npm is not recognized"
**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

#### Issue: "python is not recognized"
**Solution:**
- Install Python from [python.org](https://www.python.org/downloads/)
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal after installation

#### Issue: CORS errors in browser console
**Solution:**
- Make sure backend CORS is configured correctly
- Check `backend/main.py` has:
  ```python
  allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
  ```

#### Issue: Database errors
**Solution:**
- The database file (`pennwest_connect.db`) will be created automatically
- Make sure the `backend` directory is writable
- Delete `pennwest_connect.db` if it's corrupted and restart the backend

### Quick Test

**Test the backend directly:**
```powershell
# In PowerShell
Invoke-WebRequest -Uri http://localhost:8000 -Method GET
```

**Or in browser:**
```
http://localhost:8000/api/auth/register
```
(Should return a method not allowed error, which means it's working!)

### Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check backend terminal** for Python errors
3. **Verify both servers are running** in separate terminals
4. **Try accessing the API directly** in your browser
5. **Check firewall/antivirus** isn't blocking localhost connections

### Need More Help?

- Check the main [README.md](README.md) for setup instructions
- Review [QUICKSTART.md](QUICKSTART.md) for step-by-step guide
- Make sure you've completed the installation steps in [INSTALLATION.md](INSTALLATION.md)


