import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: boolean
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  border = true,
  shadow = true
}: CardProps) {
  const baseClasses = 'rounded-xl transition-all'
  
  const variantClasses = {
    default: 'bg-[#1e293b]',
    glass: 'bg-[#1e293b]/80 backdrop-blur-sm',
    elevated: 'bg-[#1e293b] shadow-xl'
  }

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      border && 'border border-slate-700',
      shadow && 'shadow-xl',
      className
    )}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('mt-6 pt-6 border-t border-slate-700', className)}>
      {children}
    </div>
  )
}
