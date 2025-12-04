# How to Restart the Server

## Important: You MUST restart the server after code changes!

The backend server needs to be restarted to load the new code changes.

## Steps to Restart:

1. **Stop the current server:**
   - In the terminal where the server is running
   - Press `Ctrl+C` to stop it
   - Wait for it to fully stop

2. **Start the server again:**
   ```powershell
   cd backend
   python main.py
   ```

3. **Verify it's running:**
   You should see:
   ```
   INFO:     Database initialized
   INFO:     Starting server on 0.0.0.0:8000
   INFO:     Uvicorn running on http://0.0.0.0:8000
   INFO:     Application startup complete.
   ```

## Why Restart?

Python loads modules when the server starts. If you change code files, the server won't see those changes until you restart it.

## Quick Check:

After restarting, try registering again. The password length issue should now be fixed!

