import React from 'react'
import MaterialIcon from '@/components/MaterialIcon'

interface FormInputProps {
  id: string
  name: string
  type: 'text' | 'email' | 'password'
  label: string
  placeholder?: string
  required?: boolean
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
}

export default function FormInput({
  id,
  name,
  type,
  label,
  placeholder,
  required = false,
  value,
  defaultValue,
  onChange,
  error,
  disabled = false,
  readOnly = false,
  className = '',
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-white/70">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        className={`
          mt-1 block w-full px-4 py-3 bg-black border border-white/20 rounded-xl 
          text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 
          transition-all
          ${readOnly ? 'bg-white/1 border-white/5 text-white/30 cursor-not-allowed' : ''}
          ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <MaterialIcon name="error" className="text-sm" />
          {error}
        </p>
      )}
    </div>
  )
}
