// API utility functions
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Validate and fix API URL format
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  // If missing protocol, assume https in production, http in development
  // Check if we're in production by checking if URL doesn't contain localhost
  const isProd = API_URL !== 'localhost:8000' && !API_URL.includes('localhost') && !API_URL.includes('127.0.0.1')
  const protocol = isProd ? 'https://' : 'http://'
  const originalUrl = API_URL
  API_URL = `${protocol}${API_URL}`
  
  // Warn in console to help with debugging (client-side only)
  if (typeof window !== 'undefined') {
    console.warn(
      `⚠️ NEXT_PUBLIC_API_URL is missing protocol. ` +
      `Auto-adding ${protocol}. ` +
      `Please update your Vercel environment variable from "${originalUrl}" to "${API_URL}"`
    )
  }
}

// Remove trailing slash if present
API_URL = API_URL.replace(/\/$/, '')

// Helper to check if we're in production
export function isProduction(): boolean {
  return typeof window !== 'undefined' && 
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
}

export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_URL}${cleanEndpoint}`
}

export function getCurrentApiUrl(): string {
  return API_URL
}

export function getAuthHeaders(): HeadersInit {
  const token = typeof document !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export function getAuthHeadersFormData(): HeadersInit {
  const token = typeof document !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    : null
  
  const headers: HeadersInit = {}
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint)
  const headers = getAuthHeaders()
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}


