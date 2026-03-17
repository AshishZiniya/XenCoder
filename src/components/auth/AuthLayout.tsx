import React from 'react'
import MaterialIcon from '../MaterialIcon'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footer?: React.ReactNode
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-barlow p-6">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-white/50">{subtitle}</p>
        </div>
        
        {children}
        
        {footer && (
          <div className="text-center text-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
