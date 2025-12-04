// API utility functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function getApiUrl(endpoint: string): string {
  return `${API_URL}${endpoint}`
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


