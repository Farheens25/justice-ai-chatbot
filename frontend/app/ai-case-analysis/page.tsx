'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scale } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export default function AICaseAnalysisPage() {
  const [mode, setMode] = useState<'legal' | 'chat'>('legal')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'You are a helpful legal assistant.' },
  ])
  const [result, setResult] = useState<{
    category: string
    response: { section: string; advice: string; escalation: string; helpline: string }
    disclaimer?: string
  } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const complaint = input.trim()
    if (!complaint) {
      setError('Please describe your issue or ask a question')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      if (mode === 'legal') {
        const response = await fetch(`${API_BASE_URL}/v1/chatbot/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint }),
        })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to process complaint')
        }
        setResult({
          category: data.category,
          response: data.response,
          disclaimer: data.disclaimer,
        })
      } else {
        const nextMessages = [...messages, { role: 'user' as const, content: complaint }]
        const response = await fetch(`${API_BASE_URL}/v1/chatbot/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages }),
        })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Chat request failed')
        }
        setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
      }
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to chatbot backend')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setError('')
    setResult(null)
    setMessages([{ role: 'system', content: 'You are a helpful legal assistant.' }])
  }

  return (
    <div
      className="min-h-screen px-4 py-8 md:py-14"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div
          className="px-6 py-8 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <Scale className="h-7 w-7" />
            <h1 className="text-3xl font-bold">Justice AI</h1>
          </div>
          <p className="text-sm text-indigo-100">AI-Powered Legal Guidance for Indian Justice System</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-[#667eea] hover:text-[#4e63d3]">
              Back to Home
            </Link>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-600 px-4 py-3 text-sm text-white">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">Mode</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'legal'}
                    onChange={() => setMode('legal')}
                  />
                  Legal Guidance
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'chat'}
                    onChange={() => setMode('chat')}
                  />
                  General Chat
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="chatbot-input">
                Describe Your Legal Issue / Ask a Question
              </label>
              <textarea
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: I was scammed online through a fake e-commerce website..."
                rows={6}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg px-4 py-3 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {loading ? 'Processing...' : mode === 'legal' ? 'Get Legal Guidance' : 'Send'}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </form>

          {mode === 'chat' && messages.filter((m) => m.role !== 'system').length > 0 && (
            <div className="mt-6 max-h-80 space-y-2 overflow-y-auto rounded-lg bg-gray-100 p-4">
              {messages
                .filter((m) => m.role !== 'system')
                .map((message, idx) => (
                  <p key={idx} className="text-sm text-gray-800">
                    <span className="font-semibold">{message.role === 'user' ? 'You' : 'Bot'}:</span> {message.content}
                  </p>
                ))}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4 rounded-lg border-l-4 bg-gray-50 p-5" style={{ borderLeftColor: '#667eea' }}>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#667eea]">Category</p>
                <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: '#667eea' }}>
                  {result.category}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#667eea]">Applicable Legal Section</p>
                <div className="rounded bg-white p-3 text-sm text-gray-800">{result.response.section}</div>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#667eea]">Legal Advice</p>
                <div className="rounded bg-white p-3 text-sm text-gray-800">{result.response.advice}</div>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#667eea]">Escalation Path</p>
                <div className="rounded bg-white p-3 text-sm text-gray-800">{result.response.escalation}</div>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#667eea]">Emergency Helpline</p>
                <div className="rounded border border-amber-300 bg-amber-100 p-3 text-sm font-semibold text-amber-700">
                  {result.response.helpline}
                </div>
              </div>
              {result.disclaimer && <p className="text-xs text-gray-500">{result.disclaimer}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
