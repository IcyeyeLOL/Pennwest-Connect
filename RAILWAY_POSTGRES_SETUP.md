# Setting Up PostgreSQL on Railway - Step by Step

## The Problem
Your backend is running on Railway, but PostgreSQL database isn't connected. Railway doesn't automatically create a database - you need to add it as a separate service.

## Solution: Add PostgreSQL Service

### Step 1: Go to Your Railway Project
1. Visit [railway.app](https://railway.app)
2. Log in to your account
3. Click on your **backend project** (the one running your FastAPI app)

### Step 2: Add PostgreSQL Database
1. In your project dashboard, click the **"+ New"** button (usually top right or in the services list)
2. Select **"Database"** from the dropdown menu
3. Choose **"Add PostgreSQL"**
4. Railway will automatically:
   - Create a new PostgreSQL service
   - Generate a database
   - Create connection credentials
   - Set up the `DATABASE_URL` variable

### Step 3: Connect Database to Your Backend Service
Railway should automatically:
- Create a `DATABASE_URL` variable in your backend service
- Link the PostgreSQL service to your backend

**To verify:**
1. Click on your **backend service** (the FastAPI one)
2. Go to the **"Variables"** tab
3. Look for `DATABASE_URL` - it should be there automatically
4. The value should look like: `postgresql://user:password@host:port/database`

### Step 4: Check PostgreSQL Service Variables
1. Click on the **PostgreSQL service** (the one you just added)
2. Go to **"Variables"** tab
3. You should see:
   - `DATABASE_URL` - Internal connection string
   - `DATABASE_PUBLIC_URL` - Public connection string (if needed)
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual connection details

### Step 5: Verify Backend Service Has DATABASE_URL
1. Go back to your **backend service**
2. Click **"Variables"** tab
3. **If `DATABASE_URL` is NOT there:**
   - Click **"New Variable"**
   - **Name:** `DATABASE_URL`
   - **Value:** Click **"Reference Variable"** or use the autocomplete
   - Select: `${{ PostgreSQL.DATABASE_URL }}` (replace "PostgreSQL" with your actual PostgreSQL service name)
   - Or manually copy the `DATABASE_URL` from the PostgreSQL service

### Step 6: Deploy/Trigger Redeploy
After adding the database:
1. Railway should automatically redeploy your backend
2. If not, go to your backend service → **"Deployments"** → Click **"Redeploy"**
3. Wait 1-2 minutes for deployment to complete

### Step 7: Test Database Connection
After deployment, test if database is connected:

1. **Test health endpoint:**
   ```
   https://your-backend.railway.app/health/db
   ```
   Should return: `{"status": "healthy", "database": "connected"}`

2. **Check Railway logs:**
   - Go to backend service → **"Deployments"** → Latest deployment → **"View Logs"**
   - Look for: `"Database initialized successfully"`

## Troubleshooting

### Issue: DATABASE_URL not showing in backend service
**Solution:**
1. Make sure PostgreSQL service is in the same **Project** as your backend
2. Manually add `DATABASE_URL` as a reference variable:
   - In backend service → Variables → New Variable
   - Name: `DATABASE_URL`
   - Value: `${{ PostgreSQL.DATABASE_URL }}` (use your PostgreSQL service name)

### Issue: Database connection fails
**Check:**
1. PostgreSQL service is **"Active"** (green status)
2. `DATABASE_URL` format is correct (starts with `postgresql://`)
3. Backend service has been redeployed after adding database
4. Check logs for connection errors

### Issue: Tables not created
**Solution:**
- Tables are created automatically on first startup
- Check backend logs for: `"Database initialized successfully"`
- If you see errors, check the logs for specific database errors

### Issue: Can't find "Add PostgreSQL" option
**Solution:**
- Make sure you're in a **Project** (not just a service)
- Click **"+ New"** at the project level (not service level)
- If you don't see Database option, try:
  - Refresh the page
  - Make sure you're on the free tier (PostgreSQL is available on free tier)

## Quick Checklist

- [ ] Added PostgreSQL service to Railway project
- [ ] PostgreSQL service shows "Active" status
- [ ] Backend service has `DATABASE_URL` variable set
- [ ] `DATABASE_URL` value starts with `postgresql://`
- [ ] Backend service has been redeployed
- [ ] `/health/db` endpoint returns `{"status": "healthy", "database": "connected"}`
- [ ] Backend logs show "Database initialized successfully"

## What Happens After Setup

Once PostgreSQL is connected:
1. ✅ Backend will automatically create all tables on startup
2. ✅ Registration will work (users stored in database)
3. ✅ Notes will be saved to database
4. ✅ All data persists across deployments

## Important Notes

- **PostgreSQL is a separate service** - it's not automatically included
- **DATABASE_URL is automatically shared** between services in the same project
- **Data persists** even if you redeploy your backend
- **Free tier includes** PostgreSQL with reasonable limits

## Still Having Issues?

1. **Check Railway Status:** [status.railway.app](https://status.railway.app)
2. **Check Backend Logs:** Look for database connection errors
3. **Verify Variables:** Make sure `DATABASE_URL` is set correctly
4. **Test Connection:** Use `/health/db` endpoint to verify

Once PostgreSQL is connected, your registration and all database operations will work!




