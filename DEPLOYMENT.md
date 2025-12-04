# Deployment Guide

This guide will help you deploy Pennwest Connect to free hosting platforms.

## Quick Deploy to Vercel + Railway

### Backend Deployment (Railway)

1. **Create a Railway account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Python
   - Set the root directory to `backend`
   - Add environment variable: `SECRET_KEY` (generate a random string)
   - Railway will automatically deploy

3. **Get your backend URL:**
   - Railway will provide a URL like `https://your-app.railway.app`
   - Copy this URL

### Frontend Deployment (Vercel)

1. **Create a Vercel account:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend:**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL` = Your Railway backend URL
   - Click "Deploy"

3. **Update CORS in Backend:**
   - In `backend/main.py`, update the CORS origins:
   ```python
   allow_origins=["https://your-app.vercel.app", "http://localhost:3000"]
   ```
   - Redeploy backend

## Alternative: Render

### Backend on Render

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repo
4. Settings:
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3
5. Add environment variable: `SECRET_KEY`
6. Deploy

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## Using Docker

If you prefer Docker deployment:

```bash
# Build and push to Docker Hub
docker build -t yourusername/pennwest-backend -f Dockerfile .
docker build -t yourusername/pennwest-frontend -f Dockerfile.frontend .

# Deploy to any Docker-compatible platform
```

## Environment Variables

### Backend
- `SECRET_KEY` - Random string for JWT tokens (required)

### Frontend
- `NEXT_PUBLIC_API_URL` - Your backend API URL (required)

## Post-Deployment Checklist

- [ ] Update CORS origins in backend
- [ ] Set secure `SECRET_KEY` in backend
- [ ] Verify file uploads directory is writable
- [ ] Test user registration
- [ ] Test file upload
- [ ] Test file download
- [ ] Enable HTTPS (automatic on Vercel/Railway)

## Troubleshooting

### CORS Errors
- Make sure backend CORS includes your frontend URL
- Check that `NEXT_PUBLIC_API_URL` is set correctly

### File Upload Issues
- Ensure uploads directory exists and is writable
- Check file size limits (may need to increase in FastAPI)

### Database Issues
- SQLite works for small deployments
- For production, consider PostgreSQL
- Update database URL in `backend/main.py` if using PostgreSQL




