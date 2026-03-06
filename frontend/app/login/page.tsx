'use client'

import { useState } from 'react'
import { Scale, Shield, Briefcase, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'police' | 'lawyer' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      if (selectedRole === 'police') {
        router.push('/police-dashboard')
      } else if (selectedRole === 'lawyer') {
        router.push('/lawyer-dashboard')
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">JusticeAI</h1>
          </div>
          <p className="text-gray-600">Your trusted legal assistant</p>
        </div>

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Select Your Role</h2>
            <p className="text-center text-gray-600 text-sm">Choose your role to get started with JusticeAI</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Police Officer Role */}
              <button
                onClick={() => setSelectedRole('police')}
                className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-50 to-blue-100 p-6 transition-all hover:border-blue-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <Shield className="w-10 h-10 text-blue-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Police Officer</h3>
                  <p className="text-sm text-gray-600 mt-2">File and manage cases</p>
                </div>
              </button>

              {/* Lawyer Role */}
              <button
                onClick={() => setSelectedRole('lawyer')}
                className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 transition-all hover:border-indigo-500 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <Briefcase className="w-10 h-10 text-indigo-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Lawyer</h3>
                  <p className="text-sm text-gray-600 mt-2">Manage your cases</p>
                </div>
              </button>
            </div>

            {/* Admin Login Link */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-center text-gray-600 text-sm mb-3">Are you an administrator?</p>
              <Link
                href="/admin-login"
                className="w-full border-2 border-gray-300 hover:border-blue-600 text-gray-900 font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedRole(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowRight className="w-5 h-5 rotate-180 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRole === 'police' ? 'Police Officer' : 'Lawyer'} Login
                </h2>
                <p className="text-sm text-gray-600">Sign in to your account</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                href={selectedRole === 'police' ? '/police-signup' : '/lawyer-signup'}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign up here
              </Link>
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          © 2024 JusticeAI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
