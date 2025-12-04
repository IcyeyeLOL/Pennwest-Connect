'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, FileText, Download, Trash2, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getApiUrl, getAuthHeaders, getAuthHeadersFormData } from '@/lib/api'
import Navigation from '@/components/Navigation'

interface Note {
  id: number
  title: string
  class_name: string
  description: string
  file_path: string
  author_email: string
  author_username: string
  created_at: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [classes, setClasses] = useState<string[]>([])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [deletingNotes, setDeletingNotes] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchNotes()
    }
  }, [user, loading, router])

  const fetchNotes = async () => {
    setLoadingNotes(true)
    try {
      const apiUrl = getApiUrl('/api/notes')
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, { headers })
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else if (response.status === 401) {
        // Token expired or invalid
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoadingNotes(false)
    }
  }

  // Derive classes dynamically from user's notes
  useEffect(() => {
    const uniqueClasses = Array.from(new Set(notes.map(note => note.class_name).filter(Boolean)))
    setClasses(uniqueClasses.sort())
  }, [notes])

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !selectedClass || note.class_name === selectedClass
    return matchesSearch && matchesClass
  })

  const downloadNote = async (note: Note) => {
    try {
      const apiUrl = getApiUrl(`/api/notes/${note.id}/download`)
      const headers = getAuthHeadersFormData()
      const response = await fetch(apiUrl, { headers })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        // Get file extension from original filename if available
        const contentDisposition = response.headers.get('content-disposition')
        let filename = note.title
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
          if (filenameMatch) filename = filenameMatch[1]
        }
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download note. Please try again.')
      }
    } catch (error) {
      console.error('Error downloading note:', error)
      alert('Error downloading note. Please try again.')
    }
  }

  const deleteNote = async (note: Note) => {
    // Double-check if user owns the note (backend will also verify)
    if (!user || note.author_email !== user.email) {
      alert('You can only delete your own notes.')
      return
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
      return
    }

    if (deletingNotes.has(note.id)) return

    setDeletingNotes(prev => new Set(prev).add(note.id))

    try {
      const apiUrl = getApiUrl(`/api/notes/${note.id}`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
      })

      if (response.ok) {
        // Remove note from local state immediately for better UX
        setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id))
      } else {
        const data = await response.json().catch(() => ({ detail: 'Failed to delete note' }))
        // Handle FastAPI validation errors which can be an array
        let errorMessage = 'Failed to delete note. Please try again.'
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg || 'Validation error').join('. ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        }
        alert(errorMessage)
        // Refresh notes if deletion failed
        fetchNotes()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Network error. Please check your connection and try again.')
      // Refresh notes on error
      fetchNotes()
    } finally {
      setDeletingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note.id)
        return newSet
      })
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Dashboard</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">All Classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingNotes ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading notes...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="h-8 w-8 text-primary-600" />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadNote(note)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note)}
                    disabled={deletingNotes.has(note.id) || !user}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{note.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  {note.class_name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">By: {note.author_username}</p>
            </div>
            ))}
          </div>
        )}

        {!loadingNotes && filteredNotes.length === 0 && notes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No notes found. Be the first to upload!</p>
            <Link href="/upload" className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Upload Notes
            </Link>
          </div>
        )}
        {!loadingNotes && filteredNotes.length === 0 && notes.length > 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No notes match your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedClass('')
              }}
              className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}


