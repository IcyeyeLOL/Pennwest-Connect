"""Notes routes."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
import logging

from database import get_db
from schemas import NoteResponse, NoteDetailResponse, CommentCreate, CommentResponse
from auth import get_current_user
from config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from storage import storage
from content_filter import validate_content

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/notes", tags=["notes"])

@router.post("/upload", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    class_name: str = Form(...),
    description: str = Form(""),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new note."""
    from models import Note
    
    try:
        # Validate file
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Validate content for inappropriate language
        title_valid, title_error = validate_content(title, "title")
        if not title_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=title_error
            )
        
        if description:
            desc_valid, desc_error = validate_content(description, "description")
            if not desc_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=desc_error
                )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Read file content
        file_content = await file.read()
        
        # Save file using storage backend
        file_path = storage.save_file(file_content, unique_filename)
        
        # Create note record
        db_note = Note(
            title=title,
            class_name=class_name,
            description=description,
            file_path=file_path,
            author_id=current_user.id
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        
        logger.info(f"Note uploaded: {db_note.id} by user {current_user.email}")
        
        return NoteResponse(
            id=db_note.id,
            title=db_note.title,
            class_name=db_note.class_name,
            description=db_note.description,
            file_path=db_note.file_path,
            author_email=current_user.email,
            author_username=current_user.username,
            created_at=db_note.created_at,
            like_count=0,
            is_liked=False,
            comment_count=0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        logger.error(f"Error uploading note: {error_msg}", exc_info=True)
        # Return more specific error messages for common issues
        if "storage" in error_msg.lower() or "file" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"File storage error: {error_msg}"
            )
        elif "database" in error_msg.lower() or "sql" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error. Please try again."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Upload failed: {error_msg}"
            )

@router.get("", response_model=List[NoteResponse])
async def get_notes(
    current_user = Depends(get_current_user),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """Get all notes for the authenticated user (their own notes) with pagination."""
    from models import Note, Like, Comment
    from sqlalchemy import func
    from config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
    
    # Validate pagination
    page_size = min(max(1, page_size), MAX_PAGE_SIZE)
    page = max(1, page)
    offset = (page - 1) * page_size
    
    # Get paginated notes with author info
    notes = db.query(Note).filter(
        Note.author_id == current_user.id
    ).order_by(Note.created_at.desc()).offset(offset).limit(page_size).all()
    
    if not notes:
        return []
    
    # Get all note IDs
    note_ids = [note.id for note in notes]
    
    # Get like counts for all notes in one query
    like_counts = db.query(
        Like.note_id,
        func.count(Like.id).label('count')
    ).filter(Like.note_id.in_(note_ids)).group_by(Like.note_id).all()
    like_counts_dict = {note_id: count for note_id, count in like_counts}
    
    # Get user's likes for all notes in one query
    user_likes = db.query(Like.note_id).filter(
        Like.note_id.in_(note_ids),
        Like.user_id == current_user.id
    ).all()
    user_liked_note_ids = {like.note_id for like in user_likes}
    
    # Get comment counts for all notes in one query
    comment_counts = db.query(
        Comment.note_id,
        func.count(Comment.id).label('count')
    ).filter(Comment.note_id.in_(note_ids)).group_by(Comment.note_id).all()
    comment_counts_dict = {note_id: count for note_id, count in comment_counts}
    
    # Build response
    result = []
    for note in notes:
        result.append(NoteResponse(
            id=note.id,
            title=note.title,
            class_name=note.class_name,
            description=note.description,
            file_path=note.file_path,
            author_email=note.author.email,
            author_username=note.author.username,
            created_at=note.created_at,
            like_count=like_counts_dict.get(note.id, 0),
            is_liked=note.id in user_liked_note_ids,
            comment_count=comment_counts_dict.get(note.id, 0)
        ))
    
    return result

@router.get("/global", response_model=List[NoteResponse])
async def get_global_notes(
    class_name: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """Get all notes globally (public endpoint with optional class filter and pagination)."""
    from models import Note, Like, Comment
    from sqlalchemy import func
    from config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
    
    # Validate pagination
    page_size = min(max(1, page_size), MAX_PAGE_SIZE)
    page = max(1, page)
    offset = (page - 1) * page_size
    
    query = db.query(Note)
    
    # Filter by class if provided
    if class_name:
        query = query.filter(Note.class_name == class_name)
    
    # Get total count for pagination
    total = query.count()
    
    # Get paginated notes
    notes = query.order_by(Note.created_at.desc()).offset(offset).limit(page_size).all()
    
    if not notes:
        return []
    
    # Get all note IDs
    note_ids = [note.id for note in notes]
    
    # Get like counts for all notes in one query (optimized)
    like_counts = db.query(
        Like.note_id,
        func.count(Like.id).label('count')
    ).filter(Like.note_id.in_(note_ids)).group_by(Like.note_id).all()
    like_counts_dict = {note_id: count for note_id, count in like_counts}
    
    # Get comment counts for all notes in one query (optimized)
    comment_counts = db.query(
        Comment.note_id,
        func.count(Comment.id).label('count')
    ).filter(Comment.note_id.in_(note_ids)).group_by(Comment.note_id).all()
    comment_counts_dict = {note_id: count for note_id, count in comment_counts}
    
    # Build response
    result = []
    for note in notes:
        result.append(NoteResponse(
            id=note.id,
            title=note.title,
            class_name=note.class_name,
            description=note.description,
            file_path=note.file_path,
            author_email=note.author.email,
            author_username=note.author.username,
            created_at=note.created_at,
            like_count=like_counts_dict.get(note.id, 0),
            is_liked=False,  # Will be updated on frontend if user is authenticated
            comment_count=comment_counts_dict.get(note.id, 0)
        ))
    
    return result

@router.get("/{note_id}/preview")
async def preview_note(
    note_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Preview a note file (inline viewing)."""
    from models import Note
    from fastapi.responses import Response
    
    logger.info(f"Preview endpoint called for note_id: {note_id}, user: {current_user.email}")
    
    try:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            logger.warning(f"Preview requested for non-existent note ID: {note_id} by user {current_user.email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        
        logger.info(f"Preview requested for note {note_id}, file_path: {note.file_path}")
        
        # Check if file exists using storage backend
        try:
            file_exists = storage.file_exists(note.file_path)
            if not file_exists:
                logger.warning(f"File not found for note {note_id}: {note.file_path}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"File not found: {note.file_path}"
                )
        except Exception as e:
            logger.error(f"Error checking file existence for note {note_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error accessing file: {str(e)}"
            )
        
        # Get file content from storage
        try:
            file_content = storage.get_file(note.file_path)
            if not file_content:
                logger.warning(f"File content is empty for note {note_id}: {note.file_path}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File is empty"
                )
        except FileNotFoundError:
            logger.error(f"File not found when reading: {note.file_path}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        except Exception as e:
            logger.error(f"Error reading file for note {note_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading file: {str(e)}"
            )
        
        # Get file extension to determine media type
        _, ext = os.path.splitext(note.file_path)
        ext_lower = ext.lower()
        
        # Map file extensions to media types
        media_type_map = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        
        # Default to octet-stream if type not recognized
        media_type = media_type_map.get(ext_lower, 'application/octet-stream')
        
        logger.info(f"Serving preview for note {note_id} with media type: {media_type}")
        
        # Return file content for inline viewing
        return Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'inline; filename="{note.title}{ext}"',
                "X-Content-Type-Options": "nosniff"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in preview endpoint for note {note_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading preview: {str(e)}"
        )

@router.get("/global/{note_id}", response_model=NoteDetailResponse)
async def get_global_note_detail(
    note_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed note with comments (for authenticated users)."""
    from models import Note, Like, Comment
    
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Count likes
    like_count = db.query(Like).filter(Like.note_id == note.id).count()
    
    # Check if current user liked this note
    is_liked = db.query(Like).filter(
        Like.note_id == note.id,
        Like.user_id == current_user.id
    ).first() is not None
    
    # Get comments
    comments = db.query(Comment).filter(Comment.note_id == note.id).order_by(Comment.created_at.asc()).all()
    
    return NoteDetailResponse(
        id=note.id,
        title=note.title,
        class_name=note.class_name,
        description=note.description,
        file_path=note.file_path,
        author_email=note.author.email,
        author_username=note.author.username,
        created_at=note.created_at,
        like_count=like_count,
        is_liked=is_liked,
        comment_count=len(comments),
        comments=[
            CommentResponse(
                id=comment.id,
                content=comment.content,
                author_email=comment.user.email,
                author_username=comment.user.username,
                created_at=comment.created_at
            )
            for comment in comments
        ]
    )

@router.get("/recent", response_model=List[NoteResponse])
async def get_recent_notes(
    limit: int = 6,
    db: Session = Depends(get_db)
):
    """Get recent notes (public endpoint) with optimized queries."""
    from models import Note, Like, Comment
    from sqlalchemy import func
    
    # Validate limit
    limit = min(max(1, limit), 50)  # Max 50 recent notes
    
    # Get recent notes
    notes = db.query(Note).order_by(Note.created_at.desc()).limit(limit).all()
    
    if not notes:
        return []
    
    # Get all note IDs
    note_ids = [note.id for note in notes]
    
    # Get like counts for all notes in one query (optimized)
    like_counts = db.query(
        Like.note_id,
        func.count(Like.id).label('count')
    ).filter(Like.note_id.in_(note_ids)).group_by(Like.note_id).all()
    like_counts_dict = {note_id: count for note_id, count in like_counts}
    
    # Get comment counts for all notes in one query (optimized)
    comment_counts = db.query(
        Comment.note_id,
        func.count(Comment.id).label('count')
    ).filter(Comment.note_id.in_(note_ids)).group_by(Comment.note_id).all()
    comment_counts_dict = {note_id: count for note_id, count in comment_counts}
    
    # Build response
    result = []
    for note in notes:
        result.append(NoteResponse(
            id=note.id,
            title=note.title,
            class_name=note.class_name,
            description=note.description,
            file_path=note.file_path,
            author_email=note.author.email,
            author_username=note.author.username,
            created_at=note.created_at,
            like_count=like_counts_dict.get(note.id, 0),
            is_liked=False,
            comment_count=comment_counts_dict.get(note.id, 0)
        ))
    
    return result

@router.get("/classes")
async def get_classes(db: Session = Depends(get_db)):
    """Get all unique class names."""
    from models import Note
    classes = db.query(Note.class_name).distinct().all()
    return [cls[0] for cls in classes if cls[0]]

@router.post("/{note_id}/like", status_code=status.HTTP_200_OK)
async def toggle_like(
    note_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a note."""
    from models import Note, Like
    
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check if user already liked this note
    existing_like = db.query(Like).filter(
        Like.note_id == note_id,
        Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike: remove the like
        db.delete(existing_like)
        db.commit()
        return {"liked": False, "message": "Note unliked"}
    else:
        # Like: create new like
        new_like = Like(
            note_id=note_id,
            user_id=current_user.id
        )
        db.add(new_like)
        db.commit()
        return {"liked": True, "message": "Note liked"}

@router.post("/{note_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    note_id: int,
    comment_data: CommentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a note."""
    from models import Note, Comment
    
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Validate comment content for inappropriate language
    content_valid, content_error = validate_content(comment_data.content, "comment")
    if not content_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=content_error
        )
    
    comment = Comment(
        note_id=note_id,
        user_id=current_user.id,
        content=comment_data.content
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    logger.info(f"Comment added to note {note_id} by user {current_user.email}")
    
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author_email=current_user.email,
        author_username=current_user.username,
        created_at=comment.created_at
    )

@router.delete("/{note_id}", status_code=status.HTTP_200_OK)
async def delete_note(
    note_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a note (only by the owner)."""
    from models import Note
    
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check if user owns the note
    if note.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own notes"
        )
    
    try:
        # Store file path before deletion
        file_path = note.file_path
        
        # Delete the note from database first (cascade will handle likes and comments)
        db.delete(note)
        db.commit()
        
        # Delete the file from storage after successful DB deletion
        try:
            if storage.delete_file(file_path):
                logger.info(f"Deleted file: {file_path}")
            else:
                logger.warning(f"File {file_path} not found in storage")
        except Exception as e:
            logger.warning(f"Could not delete file {file_path}: {str(e)}")
            # File deletion failure is not critical if DB deletion succeeded
        
        logger.info(f"Note deleted: {note_id} by user {current_user.email}")
        
        return {"message": "Note deleted successfully", "deleted": True}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting note: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the note"
        )

@router.get("/{note_id}/download")
async def download_note(
    note_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a note file."""
    from models import Note
    
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check if file exists using storage backend
    if not storage.file_exists(note.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Get file content from storage
    file_content = storage.get_file(note.file_path)
    
    # Get file extension from stored file path
    _, ext = os.path.splitext(note.file_path)
    filename = f"{note.title}{ext}" if not note.title.endswith(ext) else note.title
    
    # Return file content as response
    from fastapi.responses import Response
    return Response(
        content=file_content,
        media_type='application/octet-stream',
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
