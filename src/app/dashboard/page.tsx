import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Header from '@/components/ui/header'
import Link from 'next/link'

const tools = [
  {
    title: 'API Tester',
    description: 'Test and debug REST APIs with custom requests',
    href: '/api-tester',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: 'text-blue-500'
  },
  {
    title: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL color formats',
    href: '/color-converter',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
      </svg>
    ),
    color: 'text-pink-500'
  },
  {
    title: 'Cron Parser',
    description: 'Parse and visualize cron expressions',
    href: '/cron-parser',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-green-500'
  },
  {
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    href: '/hash-generator',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: 'text-orange-500'
  },
  {
    title: 'JWT Debugger',
    description: 'Decode and verify JWT tokens',
    href: '/jwt-debugger',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'text-teal-500'
  },
  {
    title: 'Team Management',
    description: 'Manage team members and permissions',
    href: '/team-management',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'text-purple-500'
  }
]

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex-1 overflow-y-auto bg-[#0f172a]">
        <Header 
          title="Xencoder Dashboard" 
          subtitle="The Ultimate Developer Toolkit"
        />
        
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.title} className="hover:shadow-2xl transition-shadow duration-300">
                <div className="p-6">
                  <div className={`${tool.color} mb-4`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{tool.title}</h3>
                  <p className="text-slate-400 mb-6">{tool.description}</p>
                  <Link href={tool.href}>
                    <Button className="w-full">
                      Open Tool
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600/50">
              <div className="p-6">
                <h4 className="text-3xl font-bold text-white mb-2">6</h4>
                <p className="text-blue-300">Available Tools</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600/50">
              <div className="p-6">
                <h4 className="text-3xl font-bold text-white mb-2">100%</h4>
                <p className="text-green-300">Free to Use</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-600/50">
              <div className="p-6">
                <h4 className="text-3xl font-bold text-white mb-2">24/7</h4>
                <p className="text-purple-300">Always Available</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
