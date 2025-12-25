'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Heart, MessageCircle, Download, ArrowLeft, Send, Eye } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getApiUrl, getAuthHeaders } from '@/lib/api'
import Navigation from '@/components/Navigation'
import NotePreview from '@/components/NotePreview'

interface Comment {
  id: number
  content: string
  author_email: string
  author_username: string
  created_at: string
}

interface Note {
  id: number
  title: string
  class_name: string
  description: string
  author_email: string
  author_username: string
  created_at: string
  like_count: number
  is_liked: boolean
  comment_count: number
  comments: Comment[]
}

export default function NoteDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const noteId = parseInt(params.id as string)
  
  const [note, setNote] = useState<Note | null>(null)
  const [loadingNote, setLoadingNote] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liking, setLiking] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const fetchNote = useCallback(async () => {
    setLoadingNote(true)
    try {
      const apiUrl = getApiUrl(`/api/notes/global/${noteId}`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, { headers })
      if (response.ok) {
        const data = await response.json()
        setNote(data)
      } else if (response.status === 404) {
        router.push('/explore')
      }
    } catch (error) {
      console.error('Error fetching note:', error)
    } finally {
      setLoadingNote(false)
    }
  }, [noteId])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchNote()
    }
  }, [user, loading, router, fetchNote])

  const handleLike = async () => {
    if (!user || liking) return

    setLiking(true)
    try {
      const apiUrl = getApiUrl(`/api/notes/${noteId}/like`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
      })

      if (response.ok) {
        fetchNote() // Refresh note data
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || submittingComment) return

    setSubmittingComment(true)
    try {
      const apiUrl = getApiUrl(`/api/notes/${noteId}/comments`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText.trim() }),
      })

      if (response.ok) {
        setCommentText('')
        fetchNote() // Refresh note data
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const downloadNote = async () => {
    if (!note || !user) return

    try {
      const apiUrl = getApiUrl(`/api/notes/${note.id}/download`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, { headers })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = note.title
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading note:', error)
    }
  }

  if (loading || loadingNote) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !note) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/explore"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explore
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded">
                  {note.class_name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              {note.description && (
                <p className="text-gray-700 mb-4">{note.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(true)}
                className="p-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye className="h-6 w-6" />
              </button>
              <button
                onClick={downloadNote}
                className="p-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 mb-6 pb-6 border-b">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                note.is_liked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${note.is_liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{note.like_count} {note.like_count === 1 ? 'Like' : 'Likes'}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{note.comment_count} {note.comment_count === 1 ? 'Comment' : 'Comments'}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              By: <span className="font-medium text-gray-700">{note.author_username}</span>
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Post</span>
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {note.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                note.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{comment.author_username}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {note && showPreview && (
        <NotePreview
          noteId={note.id}
          noteTitle={note.title}
          filePath={note.file_path || ''}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={downloadNote}
        />
      )}
    </div>
  )
}

