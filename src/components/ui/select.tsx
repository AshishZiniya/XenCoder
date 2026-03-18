'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  className?: string
}

const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-400" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            'w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Select
