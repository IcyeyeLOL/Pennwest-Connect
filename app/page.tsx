'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Upload, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Navigation from '@/components/Navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [recentNotes, setRecentNotes] = useState<any[]>([])

  useEffect(() => {
    if (!loading && user) {
      fetchRecentNotes()
    }
  }, [user, loading])

  const fetchRecentNotes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/notes/recent`)
      if (response.ok) {
        const data = await response.json()
        setRecentNotes(data)
      }
    } catch (error) {
      console.error('Error fetching recent notes:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Share Knowledge, Grow Together
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Connect with your classmates and share study materials for all your courses
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4">
              <Link href="/register" className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-center">
                Get Started
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 font-semibold text-center">
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link 
            href={user ? "/upload" : "/login"}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
          >
            <Upload className="h-12 w-12 text-primary-600 mb-4 group-hover:text-primary-700 transition-colors" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Upload Notes</h3>
            <p className="text-gray-600">Share your class notes, study guides, and documents with fellow students</p>
          </Link>
          <Link 
            href={user ? "/explore" : "/login"}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
          >
            <Search className="h-12 w-12 text-primary-600 mb-4 group-hover:text-primary-700 transition-colors" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Find Resources</h3>
            <p className="text-gray-600">Search and browse notes by class, subject, or topic</p>
          </Link>
          <Link 
            href={user ? "/explore" : "/login"}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
          >
            <BookOpen className="h-12 w-12 text-primary-600 mb-4 group-hover:text-primary-700 transition-colors" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Study Together</h3>
            <p className="text-gray-600">Collaborate and learn from your peers&apos; study materials</p>
          </Link>
        </div>

        {user && recentNotes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Notes</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recentNotes.map((note) => (
                <Link 
                  key={note.id} 
                  href={user ? `/explore/${note.id}` : "/login"}
                  className="border rounded-lg p-4 hover:shadow-md transition-all hover:scale-105 cursor-pointer block"
                >
                  <h3 className="font-semibold text-lg mb-2 hover:text-primary-600 transition-colors">{note.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Class: {note.class_name}</p>
                  <p className="text-xs text-gray-500">By: {note.author_username}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


