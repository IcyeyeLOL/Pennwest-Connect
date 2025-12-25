'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LogOut, LayoutDashboard, Compass, Upload, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Navigation() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => setMobileMenuOpen(false)

  if (!user) {
    return (
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Pennwest Connect</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link 
                href="/login" 
                className="px-3 py-2 sm:px-4 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-3 py-2 sm:px-4 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
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
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 hidden min-[375px]:inline">Pennwest Connect</span>
            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 min-[375px]:hidden">Pennwest</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
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
              onClick={closeMobileMenu}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
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
              onClick={closeMobileMenu}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive('/upload')
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Link>
            
            <div className="h-6 w-px bg-gray-300 mx-2" />
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden lg:block">
                <span className="font-medium">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all ${
                  isActive('/dashboard')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
              
              <Link
                href="/explore"
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all ${
                  isActive('/explore')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Compass className="h-5 w-5 mr-3" />
                Explore
              </Link>
              
              <Link
                href="/upload"
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all ${
                  isActive('/upload')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Upload className="h-5 w-5 mr-3" />
                Upload
              </Link>
              
              <div className="border-t border-gray-200 my-2" />
              
              <div className="px-4 py-2">
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{user.username}</span>
                </span>
              </div>
              
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleLogout()
                }}
                className="flex items-center justify-center px-4 py-3 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors mx-4"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

