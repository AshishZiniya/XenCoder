'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions, className }) => {
  return (
    <header className={cn('p-8 pb-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
    </header>
  )
}

export default Header
