'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Search, Heart, MessageCircle, Download, Filter } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getApiUrl, getAuthHeaders } from '@/lib/api'
import Navigation from '@/components/Navigation'

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
}

export default function ExplorePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [classes] = useState<string[]>(['English', 'Math', 'Science', 'History'])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [likingNotes, setLikingNotes] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!loading && user) {
      fetchNotes()
    } else if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true)
    try {
      const apiUrl = getApiUrl('/api/notes/global')
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, { headers })
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoadingNotes(false)
    }
  }, [])

  const filterNotes = useCallback(() => {
    let filtered = notes

    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(note => note.class_name === selectedClass)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.description?.toLowerCase().includes(searchLower) ||
        note.class_name.toLowerCase().includes(searchLower) ||
        note.author_username.toLowerCase().includes(searchLower)
      )
    }

    setFilteredNotes(filtered)
  }, [notes, selectedClass, searchTerm])

  useEffect(() => {
    filterNotes()
  }, [filterNotes])

  const handleLike = async (noteId: number) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (likingNotes.has(noteId)) return

    setLikingNotes(prev => new Set(prev).add(noteId))

    try {
      const apiUrl = getApiUrl(`/api/notes/${noteId}/like`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
      })

      if (response.ok) {
        const result = await response.json()
        // Update local state immediately for better UX
        setNotes(prevNotes => 
          prevNotes.map(note => {
            if (note.id === noteId) {
              return {
                ...note,
                is_liked: result.liked,
                like_count: result.liked ? note.like_count + 1 : Math.max(0, note.like_count - 1)
              }
            }
            return note
          })
        )
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLikingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(noteId)
        return newSet
      })
    }
  }

  const downloadNote = async (note: Note) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const apiUrl = getApiUrl(`/api/notes/${note.id}/download`)
      const headers = getAuthHeaders()
      const response = await fetch(apiUrl, { headers })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
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
      }
    } catch (error) {
      console.error('Error downloading note:', error)
      alert('Error downloading note. Please try again.')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore All Notes</h1>
          <p className="text-gray-600">Discover and interact with notes from all students</p>
          
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes by title, description, class, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white min-w-[200px]"
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loadingNotes ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading notes...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredNotes.length} of {notes.length} notes
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.description || 'No description'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {note.class_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(note.id)}
                        disabled={likingNotes.has(note.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                          note.is_liked
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${note.is_liked ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{note.like_count}</span>
                      </button>
                      <Link
                        href={`/explore/${note.id}`}
                        className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{note.comment_count}</span>
                      </Link>
                    </div>
                    <button
                      onClick={() => downloadNote(note)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-400">
                      By: {note.author_username}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No notes found.</p>
                {searchTerm || selectedClass ? (
                  <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
                ) : (
                  <Link href="/upload" className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Upload First Note
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

