import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md'
}: CardProps) {
  const baseClasses = 'rounded-xl border transition-all'
  
  const variantClasses = {
    default: 'bg-white/5 border-white/10',
    glass: 'bg-white/5 backdrop-blur-sm border-white/10',
    elevated: 'bg-white/5 border-white/10 shadow-lg'
  }
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}
