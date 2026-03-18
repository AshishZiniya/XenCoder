'use client'

import React from 'react'
import Sidebar from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar />
      <main className={cn('flex-1 flex flex-col overflow-hidden', className)}>
        {children}
      </main>
    </div>
  )
}

export default MainLayout
