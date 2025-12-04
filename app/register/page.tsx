'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import Cookies from 'js-cookie'
import { getApiUrl, isProduction, getCurrentApiUrl } from '@/lib/api'
import { validateRegistrationForm } from '@/lib/validation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Frontend validation
    const validation = validateRegistrationForm(username, email, password)
    if (!validation.isValid) {
      setError(validation.errors.join('. '))
      return
    }
    
    setLoading(true)

    try {
      const apiUrl = getApiUrl('/api/auth/register')
      console.log('Attempting registration to:', apiUrl)
      console.log('Request payload:', { email, username, password: '***' })
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        // Try to get error details from response
        let errorData: any
        const contentType = response.headers.get('content-type')
        
        try {
          if (contentType?.includes('application/json')) {
            errorData = await response.json()
          } else {
            // If not JSON, try to get text
            const text = await response.text()
            errorData = { detail: `Server error (${response.status}): ${text.substring(0, 200)}` }
          }
        } catch (parseError) {
          // If we can't parse the response at all
          errorData = { 
            detail: `Registration failed with status ${response.status}. Please check your backend is running and accessible.` 
          }
        }
        
        // Handle FastAPI validation errors which can be an array
        if (Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'field'
            return `${field}: ${err.msg}`
          })
          setError(errorMessages.join('. '))
        } else if (typeof errorData.detail === 'string') {
          setError(errorData.detail)
        } else {
          // Show more debugging info
          const apiUrl = getCurrentApiUrl()
          setError(`Registration failed (Status: ${response.status}). API URL: ${apiUrl}. Please check backend logs for details.`)
        }
        return
      }

      const data = await response.json()
      if (data.access_token) {
        // Set cookie with proper settings for cross-origin
        Cookies.set('token', data.access_token, { 
          expires: 7,
          sameSite: 'lax', // Allows cross-site requests
          secure: window.location.protocol === 'https:' // Secure in production
        })
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        setError('Registration successful but no token received. Please try logging in.')
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('Network')) {
        const apiUrl = getCurrentApiUrl()
        if (isProduction()) {
          setError(`Cannot connect to backend server. Current API URL: ${apiUrl}. Please set NEXT_PUBLIC_API_URL environment variable in Vercel.`)
        } else {
          setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8000')
        }
      } else {
        setError(err.message || 'Network error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4 cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Join Pennwest Connect</h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-semibold mb-1">Error:</p>
            <p>{error}</p>
            {error.includes('Cannot connect') && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-semibold text-yellow-800 mb-1">
                  {isProduction() ? 'Production Fix:' : 'Quick Fix:'}
                </p>
                {isProduction() ? (
                  <div className="space-y-2 text-yellow-700">
                    <p className="font-semibold">Missing Environment Variable!</p>
                    <p>Your frontend is trying to connect to: <code className="bg-yellow-100 px-1 rounded">{getCurrentApiUrl()}</code></p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to your Vercel dashboard</li>
                      <li>Select your project → Settings → Environment Variables</li>
                      <li>Add: <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_API_URL</code></li>
                      <li>Value: Your backend URL (e.g., <code className="bg-yellow-100 px-1 rounded">https://your-backend.railway.app</code>)</li>
                      <li>Redeploy your frontend</li>
                    </ol>
                    <p className="text-xs mt-2">See <strong>ENV_VARIABLES.md</strong> for full instructions.</p>
                  </div>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                    <li>Open a new terminal/PowerShell</li>
                    <li>Run: <code className="bg-yellow-100 px-1 rounded">cd backend</code></li>
                    <li>Run: <code className="bg-yellow-100 px-1 rounded">python main.py</code></li>
                    <li>Wait for &quot;Uvicorn running on http://0.0.0.0:8000&quot;</li>
                    <li>Then try registering again</li>
                  </ol>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="johndoe"
            />
            <p className="mt-1 text-xs text-gray-500">3-30 characters, letters, numbers, underscores, and hyphens only</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


