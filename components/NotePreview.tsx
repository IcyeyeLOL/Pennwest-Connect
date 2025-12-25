'use client'

import { useEffect, useState } from 'react'
import { X, Download, FileText, Image as ImageIcon, File } from 'lucide-react'
import { getApiUrl, getAuthHeaders } from '@/lib/api'

interface NotePreviewProps {
  noteId: number
  noteTitle: string
  filePath: string
  isOpen: boolean
  onClose: () => void
  onDownload?: () => void
}

export default function NotePreview({
  noteId,
  noteTitle,
  filePath,
  isOpen,
  onClose,
  onDownload
}: NotePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'text' | 'unsupported' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)

  // Determine file type from extension
  const getFileType = (path: string): 'pdf' | 'image' | 'text' | 'unsupported' => {
    const ext = path.toLowerCase().split('.').pop() || ''
    if (ext === 'pdf') return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
    if (ext === 'txt') return 'text'
    return 'unsupported'
  }

  useEffect(() => {
    if (!isOpen || !noteId) {
      // Cleanup when closing
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    setLoading(true)
    setError(null)
    setTextContent(null)
    
    const fileType = getFileType(filePath)
    setPreviewType(fileType)

    const fetchPreview = async () => {
      try {
        const apiUrl = getApiUrl(`/api/notes/${noteId}/preview`)
        const headers = getAuthHeaders()
        const response = await fetch(apiUrl, { headers })

        if (!response.ok) {
          let errorMessage = 'Failed to load preview'
          try {
            const errorData = await response.json()
            if (errorData.detail) {
              errorMessage = errorData.detail
            } else if (typeof errorData === 'string') {
              errorMessage = errorData
            }
          } catch {
            // If response is not JSON, try to get text
            const text = await response.text().catch(() => '')
            if (text) {
              try {
                const parsed = JSON.parse(text)
                errorMessage = parsed.detail || errorMessage
              } catch {
                errorMessage = text || errorMessage
              }
            }
          }
          throw new Error(errorMessage)
        }

        if (fileType === 'text') {
          // For text files, read as text
          const text = await response.text()
          setTextContent(text)
        } else if (fileType === 'pdf' || fileType === 'image') {
          // For PDFs and images, create blob URL
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
        }
      } catch (err: any) {
        console.error('Error loading preview:', err)
        setError(err.message || 'Failed to load preview. Please try downloading the file instead.')
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()

    // Cleanup blob URL on unmount or close
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }, [isOpen, noteId, filePath])

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [isOpen, previewUrl])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col m-2 sm:m-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {previewType === 'pdf' && <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />}
            {previewType === 'image' && <ImageIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />}
            {previewType === 'text' && <File className="h-5 w-5 text-primary-600 flex-shrink-0" />}
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">{noteTitle}</h2>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base touch-target"
              title="Download"
              aria-label="Download note"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              title="Close"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">{error}</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Download Instead
                </button>
              </div>
            </div>
          ) : previewType === 'unsupported' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  Preview not available for this file type
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Please download the file to view it
                </p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Download File
                </button>
              </div>
            </div>
          ) : previewType === 'pdf' && previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[400px] sm:min-h-[600px] border-0 rounded"
              title={`Preview of ${noteTitle}`}
            />
          ) : previewType === 'image' && previewUrl ? (
            <div className="flex items-center justify-center h-full p-2 sm:p-4">
              <img
                src={previewUrl}
                alt={noteTitle}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          ) : previewType === 'text' && textContent !== null ? (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-6 h-full overflow-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800">
                {textContent}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

