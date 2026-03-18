'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AppNavigation: React.FC = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    {
      category: 'Create',
      items: [
        { href: '/canvas', label: 'New Canvas', icon: '➕', description: 'Start fresh workspace' }
      ]
    },
    {
      category: 'Tools',
      items: [
        { href: '/dashboard', label: 'All Tools', icon: '🔧', description: 'Browse all tools' },
        { href: '/api-tester', label: 'API Tester', icon: '🌐', description: 'Test REST APIs' },
        { href: '/color-converter', label: 'Colors', icon: '🎨', description: 'Convert formats' },
        { href: '/cron-parser', label: 'Cron', icon: '⏰', description: 'Schedule jobs' },
        { href: '/diff-checker', label: 'Diff', icon: '📊', description: 'Compare code' },
        { href: '/hash-generator', label: 'Hash', icon: '🔐', description: 'Generate hashes' },
        { href: '/jwt-debugger', label: 'JWT', icon: '🔑', description: 'Debug tokens' },
        { href: '/sql-formatter', label: 'SQL', icon: '🗃️', description: 'Format queries' },
        { href: '/team-management', label: 'Team', icon: '👥', description: 'Manage users' },
        { href: '/url-encoder', label: 'URL', icon: '🔗', description: 'Encode/decode' }
      ]
    }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link href="/canvas" className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">XenCoder</h1>
                <p className="text-xs text-gray-500">Development Platform</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((section) => (
              <div key={section.category} className="flex items-center space-x-6">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.category}</span>
                <div className="flex items-center space-x-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative group flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={item.description}
                    >
                      <span className="text-lg mr-2">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive(item.href) && (
                        <div className="absolute inset-0 bg-blue-600 rounded-lg -z-10"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-white">
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navigation.map((section) => (
              <div key={section.category} className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{section.category}</h3>
                </div>
                <div className="px-4 py-2 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </nav>
  )
}

export default AppNavigation
