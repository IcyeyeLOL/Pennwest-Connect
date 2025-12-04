# Global Deployment Guide for Pennwest Connect

This guide will help you deploy Pennwest Connect globally with production-ready configuration.

## 🎯 Overview

For global deployment, you need:
1. **PostgreSQL Database** (instead of SQLite) - for shared, persistent data
2. **Cloud File Storage** (S3/Cloudinary) - for globally accessible files
3. **Environment Variables** - for configuration
4. **Proper CORS Setup** - for cross-origin requests

## 📋 Pre-Deployment Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure cloud file storage (S3 recommended)
- [ ] Generate secure SECRET_KEY
- [ ] Set up environment variables
- [ ] Update CORS origins
- [ ] Test locally with production settings

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL (Recommended - Free Tier)

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL service
4. Copy the connection string
5. Set as `DATABASE_URL` environment variable

### Option 2: Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Option 3: Neon (Free Tier)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL`

### Database Migration

After setting up PostgreSQL, the tables will be created automatically on first run. If you have existing SQLite data:

```bash
# Export from SQLite (if needed)
sqlite3 pennwest_connect.db .dump > backup.sql

# Import to PostgreSQL (adjust as needed)
psql $DATABASE_URL < backup.sql
```

## 📁 File Storage Setup

### Option 1: Cloudinary (Recommended - Much Easier!)

1. **Sign up for Cloudinary:**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Click "Sign Up for Free"
   - No credit card required!

2. **Get Your Credentials:**
   - After signup, go to Dashboard
   - You'll see:
     - **Cloud Name** (e.g., `dxyz123abc`)
     - **API Key** (e.g., `123456789012345`)
     - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

3. **Environment Variables:**
   ```
   STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

**Free Tier:** 25 GB storage, 25 GB bandwidth/month - Perfect for a school platform!

### Option 2: AWS S3 (Alternative)

1. **Create S3 Bucket:**
   - Go to AWS Console > S3
   - Create a new bucket
   - Enable public read access (or use presigned URLs)
   - Note the bucket name and region

2. **Set up IAM User:**
   - Create IAM user with S3 access
   - Generate access keys
   - Set permissions for your bucket

3. **Environment Variables:**
   ```
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   ```

### Option 3: Local Storage (Development Only)

For development, you can use local storage:
```
STORAGE_TYPE=local
UPLOAD_DIR=uploads
```

**Note:** Local storage won't work in serverless environments (Vercel, etc.)

## 🚀 Deployment Steps

### Backend Deployment (Railway)

1. **Create Railway Project:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   ```

2. **Set Environment Variables:**
   ```bash
   railway variables set SECRET_KEY=your-secret-key-here
   railway variables set DATABASE_URL=postgresql://...
   railway variables set FRONTEND_URL=https://your-app.vercel.app
   railway variables set STORAGE_TYPE=s3
   railway variables set AWS_ACCESS_KEY_ID=your-key
   railway variables set AWS_SECRET_ACCESS_KEY=your-secret
   railway variables set AWS_REGION=us-east-1
   railway variables set S3_BUCKET_NAME=your-bucket
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

4. **Get Backend URL:**
   - Railway will provide: `https://your-app.railway.app`
   - Copy this URL

### Frontend Deployment (Vercel)

1. **Create Vercel Project:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Set Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL
   - Example: `https://your-app.railway.app`

3. **Deploy:**
   - Vercel will auto-detect Next.js
   - Click "Deploy"

4. **Update Backend CORS:**
   - Add your Vercel URL to `FRONTEND_URL` in Railway
   - Redeploy backend

## 🔐 Security Configuration

### Generate SECRET_KEY

```python
# Python
import secrets
print(secrets.token_urlsafe(32))

# Or use openssl
openssl rand -hex 32
```

### Environment Variables Summary

**Backend:**
- `SECRET_KEY` - Random string for JWT (REQUIRED)
- `DATABASE_URL` - PostgreSQL connection string (REQUIRED for production)
- `FRONTEND_URL` - Your frontend URL (REQUIRED)
- `STORAGE_TYPE` - "local" or "s3" (REQUIRED)
- `S3_BUCKET_NAME` - S3 bucket name (if using S3)
- `AWS_ACCESS_KEY_ID` - AWS access key (if using S3)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (if using S3)
- `AWS_REGION` - AWS region (if using S3)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL (REQUIRED)

## 📊 Database Schema

The application uses the following tables:
- `users` - User accounts (email, username, password)
- `notes` - Uploaded notes (title, class, file_path, author)
- `likes` - Note likes (user_id, note_id)
- `comments` - Note comments (user_id, note_id, content)

All tables are created automatically on first run via SQLAlchemy.

## 🔄 Migration from Local to Global

1. **Export Local Data:**
   ```bash
   # Export users, notes, etc. from SQLite
   sqlite3 pennwest_connect.db .dump > local_backup.sql
   ```

2. **Set up Production Database:**
   - Create PostgreSQL database
   - Set `DATABASE_URL` environment variable

3. **Set up Cloud Storage:**
   - Create S3 bucket
   - Upload existing files (if any)
   - Set `STORAGE_TYPE=s3`

4. **Deploy:**
   - Deploy backend with new environment variables
   - Deploy frontend with `NEXT_PUBLIC_API_URL`

5. **Verify:**
   - Test registration
   - Test file upload
   - Test file download
   - Verify data persistence

## 🧪 Testing Production Setup Locally

1. **Set up local PostgreSQL:**
   ```bash
   # Using Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

2. **Set environment variables:**
   ```bash
   export DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
   export STORAGE_TYPE=s3
   export S3_BUCKET_NAME=your-bucket
   # ... other variables
   ```

3. **Run backend:**
   ```bash
   cd backend
   python main.py
   ```

4. **Test:**
   - Register a user
   - Upload a file
   - Verify it's in S3
   - Download the file

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`
- Check database is accessible from your deployment platform
- Ensure SSL is configured if required

### File Upload Issues
- Verify S3 credentials are correct
- Check bucket permissions
- Ensure bucket exists and is accessible
- Check file size limits

### CORS Errors
- Verify `FRONTEND_URL` matches your deployed frontend
- Check backend CORS middleware configuration
- Ensure credentials are allowed

### Environment Variables Not Loading
- Verify variable names are correct
- Check for typos
- Ensure variables are set in deployment platform
- Restart services after setting variables

## 📝 Notes

- **SQLite is NOT suitable for production** - Use PostgreSQL
- **Local file storage won't work in serverless** - Use S3 or similar
- **Always use HTTPS in production** - Most platforms provide this automatically
- **Keep SECRET_KEY secure** - Never commit to git
- **Regular backups** - Set up automated backups for PostgreSQL

## 🎉 Success!

Once deployed, your application will be:
- ✅ Globally accessible
- ✅ Using shared database (PostgreSQL)
- ✅ Using cloud file storage (S3)
- ✅ Scalable and production-ready

