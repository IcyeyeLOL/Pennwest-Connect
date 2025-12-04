# Database Setup on Railway

## Quick Setup Guide

### Step 1: Add PostgreSQL to Your Railway Project

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Log in and select your backend project

2. **Add PostgreSQL Service:**
   - Click **"+ New"** button
   - Select **"Database"** → **"Add PostgreSQL"**
   - Railway will automatically create a PostgreSQL database

3. **Get Database URL:**
   - Click on the PostgreSQL service
   - Go to **"Variables"** tab
   - Copy the `DATABASE_URL` value
   - It looks like: `postgresql://user:password@host:port/database`

### Step 2: Set Environment Variables

Railway automatically sets `DATABASE_URL` when you add PostgreSQL, but verify:

1. **Go to your Backend Service** (not the PostgreSQL service)
2. **Click "Variables" tab**
3. **Verify `DATABASE_URL` is set:**
   - Railway should have automatically added it
   - If not, click **"New Variable"**
   - Name: `DATABASE_URL`
   - Value: Copy from PostgreSQL service variables

### Step 3: Redeploy Backend

1. **Option A: Automatic**
   - Just push your code changes:
     ```bash
     git push
     ```

2. **Option B: Manual**
   - Go to Railway dashboard
   - Click on your backend service
   - Click **"Deployments"** → **"Redeploy"**

### Step 4: Verify Database Connection

After redeploying, test the database connection:

1. **Check Health Endpoint:**
   ```
   https://your-backend.railway.app/health/db
   ```

2. **Should return:**
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```

3. **If it shows "disconnected":**
   - Check Railway logs for database connection errors
   - Verify `DATABASE_URL` is set correctly
   - Make sure PostgreSQL service is running

## Troubleshooting

### Database Not Connecting

**Error:** `database: "disconnected"`

**Solutions:**
1. **Check `DATABASE_URL` is set:**
   - Backend service → Variables tab
   - Should have `DATABASE_URL` variable
   - Value should start with `postgresql://`

2. **Check PostgreSQL is running:**
   - Go to PostgreSQL service
   - Should show "Active" status
   - If not, restart it

3. **Check Railway logs:**
   - Backend service → Deployments → Latest → View Logs
   - Look for database connection errors

### Tables Not Created

The backend automatically creates tables on startup. If tables aren't created:

1. **Check backend logs** for initialization errors
2. **Verify database connection** using `/health/db` endpoint
3. **Manually trigger table creation** by restarting the backend service

### Using SQLite Instead (Not Recommended for Production)

If you want to use SQLite temporarily (files won't persist on Railway):

1. **Don't set `DATABASE_URL`** (or set it to empty)
2. Backend will fall back to SQLite
3. **⚠️ Warning:** SQLite files are ephemeral on Railway and will be lost on redeploy

## Required Environment Variables

For your backend service on Railway, you need:

```bash
DATABASE_URL=postgresql://... (auto-set by Railway when you add PostgreSQL)
FRONTEND_URL=https://your-frontend.vercel.app
SECRET_KEY=your-secret-key-here
```

## Next Steps

Once database is connected:
1. ✅ Test registration - should work now
2. ✅ Tables are created automatically
3. ✅ No manual schema setup needed

The code handles all table creation automatically using SQLAlchemy!

