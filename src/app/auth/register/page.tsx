"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import AuthLayout from '@/components/auth/AuthLayout'
import FormInput from '@/components/ui/FormInput'
import Button from '@/components/ui/Button'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Automatically sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start your journey today"
      footer={
        <p className="text-white/50">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium hover:underline text-white hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <FormInput
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            required
          />
          
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            required
          />
          
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
