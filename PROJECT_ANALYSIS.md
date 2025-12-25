# Pennwest Connect - Complete Project Analysis

## 📋 Project Overview

**Pennwest Connect** is a full-stack web application that enables students to share class notes and study materials. It's built as a modern, scalable platform with separate frontend and backend services.

### Core Purpose
- Students can upload and share notes (PDFs, Word docs, text files, images)
- Browse and download notes from other students
- Interact with notes through likes and comments
- Organize notes by class/subject
- Search and filter notes

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API (AuthProvider)
- **File Upload**: React Dropzone
- **HTTP Client**: Fetch API with custom utilities
- **Icons**: Lucide React

#### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **File Storage**: 
  - Local filesystem (dev)
  - Cloudinary (production - recommended)
  - AWS S3 (production - alternative)

#### Deployment
- **Frontend**: Vercel (recommended) / Netlify
- **Backend**: Railway (recommended) / Render / Fly.io
- **Database**: PostgreSQL (Railway/Render/Neon)

---

## 📁 Project Structure

```
pennwest-connect/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage (landing page)
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── dashboard/                # User's own notes dashboard
│   │   └── page.tsx
│   ├── explore/                   # Browse all notes
│   │   ├── page.tsx              # Explore page (list view)
│   │   └── [id]/                 # Individual note detail page
│   │       └── page.tsx
│   ├── upload/                    # Upload notes page
│   │   └── page.tsx
│   ├── login/                     # Login page
│   │   └── page.tsx
│   ├── register/                  # Registration page
│   │   └── page.tsx
│   └── globals.css                # Global styles
│
├── backend/                      # Python FastAPI backend
│   ├── main.py                   # FastAPI app entry point
│   ├── config.py                 # Configuration & environment variables
│   ├── database.py               # Database setup & session management
│   ├── models.py                 # SQLAlchemy models (User, Note, Like, Comment)
│   ├── schemas.py                # Pydantic schemas for validation
│   ├── auth.py                   # Authentication utilities (JWT, password hashing)
│   ├── storage.py                # File storage abstraction (Local/Cloudinary/S3)
│   ├── routes/                    # API route handlers
│   │   ├── auth.py               # Authentication routes
│   │   └── notes.py              # Notes CRUD routes
│   └── requirements.txt           # Python dependencies
│
├── components/                    # React components
│   ├── AuthProvider.tsx          # Authentication context provider
│   └── Navigation.tsx            # Navigation bar component
│
├── hooks/                         # Custom React hooks
│   └── useAuth.ts                # Auth hook (re-exports from AuthProvider)
│
├── lib/                           # Utility libraries
│   ├── api.ts                    # API client utilities
│   └── validation.ts             # Frontend validation functions
│
└── Configuration files
    ├── package.json              # Node.js dependencies
    ├── next.config.js            # Next.js configuration
    ├── tailwind.config.ts        # Tailwind CSS configuration
    └── tsconfig.json             # TypeScript configuration
```

---

## 🔐 Authentication System

### Flow
1. **Registration**: User provides email, username, password
   - Password validated (min 6 chars)
   - Username validated (3-30 chars, alphanumeric + underscore/hyphen)
   - Email validated
   - Password hashed with bcrypt (handles >72 byte passwords via SHA256 pre-hash)
   - JWT token generated and returned
   - Token stored in HTTP-only cookie (7-day expiration)

2. **Login**: User provides email and password
   - Credentials verified
   - JWT token generated
   - Token stored in cookie

3. **Protected Routes**: All authenticated endpoints require JWT token
   - Token extracted from `Authorization: Bearer <token>` header
   - Token validated and user fetched from database
   - User object attached to request context

### Security Features
- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: 7-day expiration
- **Token Storage**: HTTP-only cookies (client-side)
- **Password Length Handling**: Automatically handles passwords >72 bytes (bcrypt limit) via SHA256 pre-hashing
- **CORS Protection**: Configurable allowed origins

---

## 📊 Database Schema

### Models

#### User
```python
- id: Integer (Primary Key)
- email: String (Unique, Indexed)
- username: String (Unique, Indexed)
- hashed_password: String
- created_at: DateTime
- notes: Relationship (One-to-Many with Note)
```

#### Note
```python
- id: Integer (Primary Key)
- title: String (Indexed)
- class_name: String (Indexed)
- description: String (Optional)
- file_path: String (Path to stored file)
- author_id: Integer (Foreign Key → User.id)
- created_at: DateTime
- author: Relationship (Many-to-One with User)
- likes: Relationship (One-to-Many with Like)
- comments: Relationship (One-to-Many with Comment)
```

#### Like
```python
- id: Integer (Primary Key)
- note_id: Integer (Foreign Key → Note.id)
- user_id: Integer (Foreign Key → User.id)
- created_at: DateTime
- Unique Constraint: (note_id, user_id) - One like per user per note
```

#### Comment
```python
- id: Integer (Primary Key)
- note_id: Integer (Foreign Key → Note.id)
- user_id: Integer (Foreign Key → User.id)
- content: String (Max 1000 chars)
- created_at: DateTime
```

### Relationships
- **User → Notes**: One-to-Many (cascade delete)
- **Note → Likes**: One-to-Many (cascade delete)
- **Note → Comments**: One-to-Many (cascade delete)
- **User → Likes**: One-to-Many
- **User → Comments**: One-to-Many

---

## 🛣️ API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
  - Request: `{ email, username, password }`
  - Response: `{ access_token, token_type }`
  
- `POST /api/auth/login` - Login user
  - Request: `{ email, password }`
  - Response: `{ access_token, token_type }`
  
- `GET /api/auth/me` - Get current user info (Protected)
  - Response: `{ id, email, username }`

### Notes (`/api/notes`)
- `POST /api/notes/upload` - Upload a note (Protected)
  - Form Data: `file, title, class_name, description`
  - Response: `NoteResponse`
  
- `GET /api/notes` - Get user's own notes (Protected, Paginated)
  - Query Params: `page`, `page_size`
  - Response: `List[NoteResponse]`
  
- `GET /api/notes/global` - Get all notes (Public, Paginated)
  - Query Params: `class_name?`, `page`, `page_size`
  - Response: `List[NoteResponse]`
  
- `GET /api/notes/global/{note_id}` - Get note details with comments (Protected)
  - Response: `NoteDetailResponse` (includes comments)
  
- `GET /api/notes/recent` - Get recent notes (Public)
  - Query Params: `limit?` (default: 6, max: 50)
  - Response: `List[NoteResponse]`
  
- `GET /api/notes/classes` - Get all unique class names (Public)
  - Response: `List[str]`
  
- `POST /api/notes/{note_id}/like` - Toggle like on note (Protected)
  - Response: `{ liked: bool, message: str }`
  
- `POST /api/notes/{note_id}/comments` - Add comment to note (Protected)
  - Request: `{ content: str }`
  - Response: `CommentResponse`
  
- `GET /api/notes/{note_id}/download` - Download note file (Protected)
  - Response: File download (binary)
  
- `DELETE /api/notes/{note_id}` - Delete note (Protected, Owner only)
  - Response: `{ message: str, deleted: bool }`

### Health Checks
- `GET /` - API info
- `GET /health` - Basic health check
- `GET /health/db` - Database connection check

---

## 🎨 Frontend Pages & Features

### Homepage (`/`)
- **Public**: Landing page with feature highlights
- **Authenticated**: Shows recent notes section
- Features:
  - Call-to-action buttons
  - Feature cards (Upload, Explore, Study Together)
  - Recent notes preview (if authenticated)

### Dashboard (`/dashboard`)
- **Protected**: User's own notes
- Features:
  - List all notes uploaded by current user
  - Search notes (title, description, class)
  - Filter by class name
  - Download notes
  - Delete own notes
  - Empty state with upload prompt

### Explore (`/explore`)
- **Protected**: Browse all notes from all users
- Features:
  - View all notes globally
  - Search notes (title, description, class, author)
  - Filter by class
  - Like/unlike notes
  - View comment count
  - Navigate to note detail page
  - Download notes

### Note Detail (`/explore/[id]`)
- **Protected**: Individual note view
- Features:
  - Full note information
  - Like/unlike functionality
  - View all comments
  - Add new comments
  - Download note
  - Back to explore navigation

### Upload (`/upload`)
- **Protected**: Upload new notes
- Features:
  - Drag-and-drop file upload
  - Click to select file
  - File types: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
  - Form fields:
    - Title (required)
    - Class/Subject (required, dropdown)
    - Description (optional)
  - File validation
  - Upload progress indication

### Login (`/login`)
- **Public**: User authentication
- Features:
  - Email and password login
  - Error handling with helpful messages
  - Link to registration
  - Network error detection with troubleshooting tips

### Register (`/register`)
- **Public**: User registration
- Features:
  - Username, email, password registration
  - Frontend validation
  - Error handling
  - Link to login
  - Network error detection

---

## 💾 File Storage System

### Storage Backend Abstraction
The system uses a pluggable storage backend that supports multiple providers:

#### Local Storage (Development)
- Files stored in `uploads/` directory
- Simple file system operations
- Not suitable for production (ephemeral in cloud)

#### Cloudinary (Recommended for Production)
- Cloud-based file storage
- Automatic file optimization
- CDN delivery
- Easy setup
- Environment variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

#### AWS S3 (Alternative for Production)
- Enterprise-grade storage
- Scalable and reliable
- Environment variables:
  - `S3_BUCKET_NAME`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`

### Storage Selection
- Controlled by `STORAGE_TYPE` environment variable
- Falls back to local storage if cloud credentials missing
- Automatic initialization on server start

---

## 🔄 Data Flow

### Upload Flow
1. User selects file and fills form on `/upload`
2. Frontend validates file type and form data
3. FormData sent to `POST /api/notes/upload` with JWT token
4. Backend validates:
   - File type (allowed extensions)
   - File size (max 10MB default)
   - User authentication
5. File saved to storage backend (local/cloud)
6. Note record created in database
7. Response returned with note details
8. User redirected to dashboard

### Download Flow
1. User clicks download on note card
2. Frontend calls `GET /api/notes/{id}/download` with JWT token
3. Backend:
   - Validates authentication
   - Checks note exists
   - Retrieves file from storage
   - Returns file as binary response
4. Frontend creates blob and triggers download

### Like Flow
1. User clicks like button
2. Frontend calls `POST /api/notes/{id}/like` with JWT token
3. Backend:
   - Checks if like exists
   - If exists: delete (unlike)
   - If not: create (like)
4. Response includes new like state
5. Frontend updates UI optimistically

### Comment Flow
1. User types comment and submits
2. Frontend calls `POST /api/notes/{id}/comments` with JWT token
3. Backend:
   - Validates comment content (1-1000 chars)
   - Creates comment record
   - Returns comment with author info
4. Frontend refreshes note data to show new comment

---

## 🎯 Key Features

### Implemented Features ✅
1. **User Authentication**
   - Registration with email, username, password
   - Login with email and password
   - JWT-based session management
   - Protected routes

2. **Note Management**
   - Upload notes (PDF, DOC, DOCX, TXT, Images)
   - View own notes (dashboard)
   - View all notes (explore)
   - Download notes
   - Delete own notes

3. **Social Features**
   - Like/unlike notes
   - Comment on notes
   - View like and comment counts

4. **Search & Filter**
   - Search by title, description, class, author
   - Filter by class name
   - Real-time filtering

5. **File Handling**
   - Multiple file type support
   - File size validation
   - Cloud storage support (Cloudinary/S3)
   - Secure file downloads

6. **User Experience**
   - Responsive design (mobile, tablet, desktop)
   - Loading states
   - Error handling
   - Empty states
   - Optimistic UI updates

### Future Enhancements (Not Yet Implemented) 🔮
- User profiles
- Note ratings/reviews
- Favorite/bookmark notes
- User avatars
- Email notifications
- Advanced search filters
- Note categories/tags
- File preview
- Bulk upload
- Note versioning
- Sharing links
- Note analytics

---

## 🔧 Configuration

### Environment Variables

#### Backend (Required)
- `SECRET_KEY` - JWT secret (CRITICAL - must be unique)
- `DATABASE_URL` - PostgreSQL connection string (production)
- `FRONTEND_URL` - Frontend URL for CORS
- `STORAGE_TYPE` - `local`, `cloudinary`, or `s3`

#### Backend (Optional)
- `HOST` - Server host (default: `0.0.0.0`)
- `PORT` - Server port (default: `8000`)
- `LOG_LEVEL` - Logging level (default: `INFO`)
- `MAX_FILE_SIZE` - Max file size in bytes (default: 10MB)
- `ALLOWED_EXTENSIONS` - Comma-separated file extensions
- `DEFAULT_PAGE_SIZE` - Pagination default (default: 20)
- `MAX_PAGE_SIZE` - Pagination max (default: 100)

#### Frontend (Required)
- `NEXT_PUBLIC_API_URL` - Backend API URL

#### Cloudinary (If using Cloudinary)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### AWS S3 (If using S3)
- `S3_BUCKET_NAME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

---

## 🚀 Deployment

### Backend Deployment (Railway)
1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy (auto-deploys on push)

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy (auto-deploys on push)

### Database Migration
- SQLAlchemy auto-creates tables on first run
- Migration script available (`migrate_username.py`) for schema updates

---

## 🔒 Security Considerations

### Implemented
- Password hashing (bcrypt)
- JWT token authentication
- CORS protection
- File type validation
- File size limits
- SQL injection protection (SQLAlchemy ORM)
- Input validation (Pydantic schemas)

### Recommendations for Production
- Change default `SECRET_KEY`
- Use HTTPS only
- Add rate limiting
- Implement file virus scanning
- Add request logging
- Set up monitoring/alerts
- Regular security audits
- Use environment variables for all secrets

---

## 📈 Scalability Features

### Current Optimizations
- Database connection pooling (PostgreSQL)
- Pagination for note lists
- Optimized queries (batch loading likes/comments)
- Cloud storage for files (scalable)
- CORS regex for preview deployments

### Future Scalability Improvements
- Redis caching layer
- CDN for static assets
- Database read replicas
- Background job processing
- Elasticsearch for search
- Microservices architecture (if needed)

---

## 🐛 Error Handling

### Backend
- Comprehensive error logging
- Structured error responses
- Database error handling
- File operation error handling
- Graceful fallbacks (e.g., storage backend)

### Frontend
- Network error detection
- User-friendly error messages
- Validation error display
- Loading states
- Retry mechanisms (manual)

---

## 📝 Code Quality

### Backend
- Type hints (Python)
- Pydantic validation
- SQLAlchemy ORM (type-safe)
- Logging throughout
- Error handling
- Configuration management

### Frontend
- TypeScript for type safety
- React best practices
- Component composition
- Custom hooks
- Centralized API utilities
- Form validation

---

## 🧪 Testing Considerations

### Current State
- No automated tests implemented
- Manual testing recommended

### Recommended Tests
- Unit tests for auth utilities
- Integration tests for API endpoints
- E2E tests for critical flows
- File upload/download tests
- Database migration tests

---

## 📚 Documentation Files

The project includes extensive documentation:
- `README.md` - Basic setup and overview
- `FUNCTIONALITY.md` - Feature documentation
- `ENV_VARIABLES.md` - Environment variable guide
- `DEPLOYMENT.md` - Deployment instructions
- Various troubleshooting guides

---

## 🎓 Learning Points

This project demonstrates:
- Full-stack development (Next.js + FastAPI)
- JWT authentication
- File upload/download
- Database design (SQLAlchemy)
- RESTful API design
- Cloud deployment
- Environment configuration
- Error handling
- Responsive UI design
- State management (React Context)

---

## 🔄 Development Workflow

1. **Local Development**
   - Start backend: `cd backend && python main.py`
   - Start frontend: `npm run dev`
   - Backend runs on `http://localhost:8000`
   - Frontend runs on `http://localhost:3000`

2. **Making Changes**
   - Backend changes: Restart Python server
   - Frontend changes: Hot reload (Next.js)
   - Database changes: Update models, restart server (auto-migration)

3. **Deployment**
   - Push to GitHub
   - Railway auto-deploys backend
   - Vercel auto-deploys frontend
   - Environment variables set in platform dashboards

---

## 💡 Key Design Decisions

1. **Separate Frontend/Backend**: Enables independent scaling and deployment
2. **JWT Authentication**: Stateless, scalable authentication
3. **Storage Abstraction**: Easy to switch between storage providers
4. **Pagination**: Prevents loading too much data at once
5. **Optimistic UI Updates**: Better user experience
6. **TypeScript**: Type safety and better developer experience
7. **Tailwind CSS**: Rapid UI development
8. **Next.js App Router**: Modern React patterns

---

This analysis provides a comprehensive overview of the Pennwest Connect project. The system is well-structured, follows best practices, and is ready for production deployment with proper environment configuration.


