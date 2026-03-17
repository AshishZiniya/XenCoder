import React from 'react'
import MaterialIcon from '../MaterialIcon'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-white text-black hover:bg-white/90 focus:ring-white',
    secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/50',
    outline: 'border border-white/20 text-white hover:bg-white/10 focus:ring-white/50',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5 focus:ring-white/20'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <MaterialIcon name="refresh" className="animate-spin mr-2" />
      )}
      {icon && !loading && (
        <MaterialIcon name={icon} className="mr-2" />
      )}
      {children}
    </button>
  )
}
