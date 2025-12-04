# Pennwest Connect

A full-stack platform for students to share class notes and study materials. Built with Next.js (TypeScript) and Python (FastAPI).

## Features

- 🔐 User authentication (register/login)
- 📤 Upload notes and documents (PDF, DOC, DOCX, TXT, Images)
- 🔍 Search and filter notes by class
- 📥 Download shared notes
- 🎨 Modern, responsive UI

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS**
- **React Dropzone** for file uploads

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** (ORM)
- **SQLite** (Database)
- **JWT** (Authentication)
- **Bcrypt** (Password hashing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

#### Option 1: Manual Setup

1. **Start the backend server:**
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the frontend development server (in a new terminal):**
   ```bash
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

#### Option 2: Using Docker (Recommended)

```bash
docker-compose up
```

This will start both frontend and backend services. Access the app at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the root directory (optional):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
pennwest-connect/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── upload/             # Upload notes page
│   └── layout.tsx          # Root layout
├── backend/                # Python backend
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
├── components/             # React components
├── hooks/                  # Custom React hooks
├── uploads/                # Uploaded files (created automatically)
└── package.json           # Node.js dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Notes
- `POST /api/notes/upload` - Upload a note
- `GET /api/notes` - Get all notes
- `GET /api/notes/recent` - Get recent notes
- `GET /api/notes/classes` - Get all class names
- `GET /api/notes/{id}/download` - Download a note

## Deployment

### Free Deployment Options

#### Frontend (Next.js)
- **Vercel** (recommended) - Free tier, automatic deployments from GitHub
- **Netlify** - Free tier available

#### Backend (FastAPI)
- **Railway** - Free tier available, easy PostgreSQL integration
- **Render** - Free tier available
- **Fly.io** - Free tier available
- **PythonAnywhere** - Free tier for Python apps

#### Database
- SQLite is included (file-based, no setup needed) - works for small deployments
- For production, consider PostgreSQL (free on Railway, Render, or Supabase)

### Deployment Steps

1. **Deploy Backend:**
   - Push code to GitHub
   - Connect to Railway/Render/Fly.io
   - Set environment variables
   - Deploy

2. **Deploy Frontend:**
   - Push code to GitHub
   - Connect to Vercel/Netlify
   - Set `NEXT_PUBLIC_API_URL` to your backend URL
   - Deploy

## Security Notes

⚠️ **Important:** Before deploying to production:
- Change `SECRET_KEY` in `backend/main.py`
- Use environment variables for sensitive data
- Consider using PostgreSQL instead of SQLite for production
- Add rate limiting
- Enable HTTPS

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

