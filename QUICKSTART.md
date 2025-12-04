# Quick Start Guide

Get Pennwest Connect running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Python 3.9+ installed (`python --version`)
- ✅ npm installed (`npm --version`)

## Step 1: Install Dependencies

### Frontend
```bash
npm install
```

### Backend
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

## Step 2: Start the Backend

In one terminal:
```bash
cd backend
# Make sure venv is activated
python main.py
```

You should see: `Uvicorn running on http://0.0.0.0:8000`

## Step 3: Start the Frontend

In another terminal:
```bash
npm run dev
```

You should see: `Ready on http://localhost:3000`

## Step 4: Open the App

1. Open your browser to `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Upload your first note!

## Troubleshooting

### Port Already in Use
- Backend: Change port in `backend/main.py` (line 273)
- Frontend: Next.js will automatically use the next available port

### Python Module Not Found
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

### npm install fails
- Try `npm install --legacy-peer-deps`
- Or update Node.js to the latest version

## Next Steps

- Read the full [README.md](README.md) for more details
- Check [DEPLOYMENT.md](DEPLOYMENT.md) to deploy online
- Customize the app for your school!

## Need Help?

- Check the console for error messages
- Make sure both servers are running
- Verify the API URL in `.env.local` (optional, defaults to localhost:8000)




