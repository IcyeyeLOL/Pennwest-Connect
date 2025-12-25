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
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Maximum file size: 10MB (matches backend default)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files (wrong type, too many files, etc.)
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload PDF, DOC, DOCX, TXT, or image files.')
      } else if (rejection.errors.some((e: any) => e.code === 'too-many-files')) {
        setError('Please upload only one file at a time.')
      } else {
        setError('File rejected. Please try a different file.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      
      // Check file size on frontend
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
        return
      }

      setFile(selectedFile)
      setError('')
      setUploadProgress(0)
    }
  }, [MAX_FILE_SIZE])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  // Handle file rejections from dropzone
  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0]
      if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload PDF, DOC, DOCX, TXT, or image files.')
      } else if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
      } else if (rejection.errors.some((e) => e.code === 'too-many-files')) {
        setError('Please upload only one file at a time.')
      } else {
        setError('File rejected. Please try a different file.')
      }
    }
  }, [fileRejections, MAX_FILE_SIZE])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUploadProgress(0)

    // Validation
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    // Double-check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
      return
    }

    if (!title || !title.trim()) {
      setError('Please enter a note title')
      return
    }

    if (!className || !className.trim()) {
      setError('Please select a subject')
      return
    }

    setUploading(true)
    setUploadProgress(10) // Show initial progress

    try {
      const apiUrl = getApiUrl('/api/notes/upload')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('class_name', className.trim())
      formData.append('description', description.trim())

      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      const headers = getAuthHeadersFormData()
      
      setUploadProgress(30)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers, // Authorization header only, let browser set Content-Type
        body: formData,
      })

      setUploadProgress(70)

      // Try to parse response as JSON
      let data: any
      const contentType = response.headers.get('content-type')
      
      try {
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          // If not JSON, read as text
          const text = await response.text()
          throw new Error(`Unexpected response format: ${text.substring(0, 100)}`)
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        setError('Server returned an invalid response. Please try again.')
        return
      }

      setUploadProgress(90)

      if (response.ok) {
        setUploadProgress(100)
        // Small delay to show completion
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        // Handle FastAPI validation errors which can be an array
        let errorMessage = 'Upload failed. Please check your input and try again.'
        if (data) {
          if (Array.isArray(data.detail)) {
            const errorMessages = data.detail.map((err: any) => {
              const field = err.loc ? err.loc[err.loc.length - 1] : 'field'
              return `${field}: ${err.msg}`
            })
            errorMessage = errorMessages.join('. ')
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail
          }
        }
        setError(errorMessage)
        setUploadProgress(0)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      let errorMessage = 'An error occurred during upload. Please try again.'
      if (err.message?.includes('fetch') || err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setUploadProgress(0)
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
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} disabled={uploading} />
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-8 w-8 text-primary-600" />
                      <div className="text-left">
                        <span className="text-gray-700 block">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {!uploading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFile(null)
                            setError('')
                          }}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    {uploading && uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
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
                      Supports: PDF, DOC, DOCX, TXT, Images (Max {MAX_FILE_SIZE / 1024 / 1024}MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading || !file}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    {uploadProgress > 0 && <span className="text-sm">({uploadProgress}%)</span>}
                  </>
                ) : (
                  'Upload Notes'
                )}
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

