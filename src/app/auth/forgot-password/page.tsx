"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send reset link')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-barlow p-6">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl">
        {submitted ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
            <p className="mt-2 text-white/50">
              We&apos;ll send you a link to reset your password if an account exists for that email.
            </p>
            <Link href="/auth/login" className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Forgot Password?</h1>
              <p className="mt-2 text-white/50">Enter your email and we&apos;ll send you a link to reset your password.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold bg-white text-black hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="font-medium hover:underline text-white/50 hover:text-white transition-colors">
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
