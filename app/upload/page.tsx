'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { getApiUrl, getAuthHeadersFormData } from '@/lib/api'
import Navigation from '@/components/Navigation'

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [className, setClassName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please select a file to upload')
      return
    }

    if (!title || !className) {
      setError('Please fill in all required fields')
      return
    }

    setUploading(true)

    try {
      const apiUrl = getApiUrl('/api/notes/upload')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('class_name', className)
      formData.append('description', description)

      const headers = getAuthHeadersFormData()
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Handle FastAPI validation errors which can be an array
        if (Array.isArray(data.detail)) {
          const errorMessages = data.detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'field'
            return `${field}: ${err.msg}`
          })
          setError(errorMessages.join('. '))
        } else if (typeof data.detail === 'string') {
          setError(data.detail)
        } else {
          setError('Upload failed. Please check your input and try again.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setUploading(false)
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Notes</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Note Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., Calculus Chapter 5 Notes"
              />
            </div>

            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select a subject</option>
                <option value="English">English</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Brief description of the notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File *
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-8 w-8 text-primary-600" />
                    <span className="text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isDragActive
                        ? 'Drop the file here...'
                        : 'Drag & drop a file here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports: PDF, DOC, DOCX, TXT, Images
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Notes'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

