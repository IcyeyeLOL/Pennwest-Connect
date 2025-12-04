# Functionality Guide

This document describes all the working features in Pennwest Connect.

## ✅ Implemented Features

### 1. User Authentication

#### Registration (`/register`)
- ✅ User can create an account with:
  - Full Name
  - Email address
  - Password (minimum 6 characters)
- ✅ Email validation
- ✅ Password hashing (bcrypt)
- ✅ Duplicate email prevention
- ✅ Automatic login after registration
- ✅ JWT token stored in cookies (7-day expiration)

#### Login (`/login`)
- ✅ Email and password authentication
- ✅ JWT token generation
- ✅ Error handling for invalid credentials
- ✅ Automatic redirect to dashboard on success
- ✅ Token stored in secure cookies

#### Logout
- ✅ Clears authentication token
- ✅ Redirects to homepage
- ✅ Available from navigation bar

### 2. Note Management

#### Upload Notes (`/upload`)
- ✅ Drag-and-drop file upload
- ✅ Click to select file
- ✅ Supported file types:
  - PDF (.pdf)
  - Word Documents (.doc, .docx)
  - Text Files (.txt)
  - Images (.png, .jpg, .jpeg)
- ✅ Required fields:
  - Note Title
  - Class Name
- ✅ Optional field:
  - Description
- ✅ File validation
- ✅ Progress indication during upload
- ✅ Error handling
- ✅ Automatic redirect to dashboard after upload

#### View Notes (`/dashboard`)
- ✅ Display all uploaded notes
- ✅ Note cards showing:
  - Title
  - Description
  - Class name (with badge)
  - Author email
  - Upload date
- ✅ Loading state while fetching
- ✅ Empty state when no notes exist

#### Search & Filter
- ✅ Real-time search by:
  - Note title
  - Description
  - Class name
- ✅ Filter by class name
- ✅ Dropdown with all available classes
- ✅ Combined search and filter functionality

#### Download Notes
- ✅ Download button on each note card
- ✅ Preserves original file format
- ✅ Proper filename handling
- ✅ Error handling for failed downloads

### 3. Homepage (`/`)

#### Public View
- ✅ Landing page with:
  - Platform description
  - Feature highlights
  - Call-to-action buttons
  - Recent notes (if any exist)

#### Authenticated View
- ✅ Shows user email in navigation
- ✅ Quick access to dashboard and upload
- ✅ Logout button
- ✅ Recent notes section

### 4. API Integration

#### Backend Endpoints
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `GET /api/auth/me` - Get current user info
- ✅ `POST /api/notes/upload` - Upload a note
- ✅ `GET /api/notes` - Get all notes (authenticated)
- ✅ `GET /api/notes/recent` - Get recent notes (public)
- ✅ `GET /api/notes/classes` - Get all class names
- ✅ `GET /api/notes/{id}/download` - Download a note

#### Frontend API Utilities
- ✅ Centralized API URL management
- ✅ Automatic token injection
- ✅ Error handling
- ✅ Type-safe API calls

### 5. User Experience

#### Navigation
- ✅ Consistent navigation bar across all pages
- ✅ Logo and branding
- ✅ User email display
- ✅ Quick access buttons

#### Loading States
- ✅ Loading indicators during:
  - Authentication
  - File uploads
  - Data fetching
  - Page navigation

#### Error Handling
- ✅ Form validation errors
- ✅ Network error messages
- ✅ Authentication error handling
- ✅ File upload error messages
- ✅ User-friendly error displays

#### Responsive Design
- ✅ Mobile-friendly layout
- ✅ Tablet optimization
- ✅ Desktop experience
- ✅ Touch-friendly interactions

### 6. Security Features

#### Authentication
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Token expiration (7 days)
- ✅ Protected routes
- ✅ Automatic token validation

#### File Handling
- ✅ Secure file storage
- ✅ Unique filename generation
- ✅ File type validation
- ✅ Access control (authenticated users only)

## 🔧 Technical Implementation

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **File Upload**: React Dropzone
- **HTTP Client**: Fetch API with custom utilities

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **File Storage**: Local filesystem

### Data Flow
1. User registers/logs in → JWT token generated
2. Token stored in HTTP-only cookie
3. All authenticated requests include token
4. Backend validates token on each request
5. Files stored in `uploads/` directory
6. Database tracks all notes and users

## 🚀 How to Use

### For Students

1. **Create Account**
   - Go to homepage
   - Click "Sign Up"
   - Fill in your details
   - Click "Create Account"

2. **Upload Notes**
   - Click "Upload Notes" in navigation
   - Fill in note details
   - Drag and drop or select a file
   - Click "Upload Notes"

3. **Browse Notes**
   - Go to Dashboard
   - Use search bar to find specific notes
   - Filter by class using dropdown
   - Click download button to get a note

4. **Download Notes**
   - Find the note you want
   - Click the download icon
   - File will download to your device

## 📝 Notes

- All uploaded files are stored locally in the `uploads/` directory
- Database is SQLite (file-based, no setup needed)
- JWT tokens expire after 7 days (users need to log in again)
- File size limits depend on server configuration
- Supported file types can be extended in the code

## 🔄 Future Enhancements (Not Yet Implemented)

- User profiles
- Note ratings/reviews
- Comments on notes
- Favorite/bookmark notes
- User avatars
- Email notifications
- Advanced search filters
- Note categories/tags
- File preview
- Bulk upload


