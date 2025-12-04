'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LogOut, LayoutDashboard, Compass, Upload } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Navigation() {
  const { user } = useAuth()
  const pathname = usePathname()

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  if (!user) {
    return (
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Pennwest Connect</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Pennwest Connect</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive('/dashboard')
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            
            <Link
              href="/explore"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive('/explore')
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Compass className="h-4 w-4 mr-2" />
              Explore
            </Link>
            
            <Link
              href="/upload"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive('/upload')
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Link>
            
            <div className="h-6 w-px bg-gray-300 mx-2" />
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                <span className="font-medium">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

