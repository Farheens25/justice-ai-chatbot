'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  LogOut,
  Menu,
  Search,
  Shield,
  X,
} from 'lucide-react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

type DashboardTab = 'new' | 'pending' | 'assigned'

type Complaint = {
  id: string
  title?: string
  description?: string
  crime_type?: string
  jurisdiction?: string
  status?: string
  created_at?: string
  name?: string
  email?: string
  phone?: string
  location?: string
  evidence?: string
  urgency_level?: string
}

type ComplaintListResponse = {
  data: Complaint[]
}

const tabFromStatus = (status?: string): DashboardTab => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'pending') return 'pending'
  if (normalized === 'assigned' || normalized === 'under_investigation' || normalized === 'investigating') {
    return 'assigned'
  }
  return 'new'
}

export default function PoliceDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadComplaints = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/complaints`)
      if (!response.ok) throw new Error('Failed to load complaints')
      const payload = (await response.json()) as ComplaintListResponse
      setComplaints(payload.data || [])
    } catch (error) {
      console.error('Failed to load complaints:', error)
      setComplaints([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadComplaints()
  }, [])

  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return complaints
      .filter((c) => tabFromStatus(c.status) === selectedTab)
      .filter((c) => {
        if (!q) return true
        return (
          (c.id || '').toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.crime_type || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
        )
      })
  }, [complaints, selectedTab, searchQuery])

  const stats = useMemo(
    () => [
      {
        label: 'New Cases',
        value: complaints.filter((c) => tabFromStatus(c.status) === 'new').length,
        color: 'bg-orange-100',
        textColor: 'text-orange-600',
      },
      {
        label: 'Pending Cases',
        value: complaints.filter((c) => tabFromStatus(c.status) === 'pending').length,
        color: 'bg-red-100',
        textColor: 'text-red-600',
      },
      {
        label: 'Assigned Cases',
        value: complaints.filter((c) => tabFromStatus(c.status) === 'assigned').length,
        color: 'bg-green-100',
        textColor: 'text-green-600',
      },
    ],
    [complaints]
  )

  const getCaseIcon = (status?: string) => {
    const tab = tabFromStatus(status)
    if (tab === 'new') return <AlertCircle className="w-5 h-5 text-orange-600" />
    if (tab === 'pending') return <Clock className="w-5 h-5 text-red-600" />
    return <CheckCircle className="w-5 h-5 text-green-600" />
  }

  const getPriorityClass = (urgency?: string) => {
    const normalized = (urgency || '').toLowerCase()
    if (normalized === 'high') return 'bg-red-100 text-red-800'
    if (normalized === 'medium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const updateStatus = async (complaintId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Update failed')
      await loadComplaints()
      setSelectedCase(null)
    } catch (error) {
      console.error('Failed to update complaint status:', error)
      alert('Unable to update case status.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">JusticeAI Police</h1>
                <p className="text-xs text-gray-500">Live Case Management</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={() => void loadComplaints()}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Refresh
              </button>
              <Link href="/login" className="p-2 text-gray-600 hover:text-red-600 transition">
                <LogOut className="w-6 h-6" />
              </Link>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <button type="button" onClick={() => void loadComplaints()} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition">
                Refresh
              </button>
              <Link href="/login" className="block px-4 py-2 hover:bg-gray-100 rounded transition text-red-600">Logout</Link>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-6 border border-gray-200`}>
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setSelectedTab('new')} className={`flex-1 px-6 py-4 font-semibold transition ${selectedTab === 'new' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>New</button>
            <button onClick={() => setSelectedTab('pending')} className={`flex-1 px-6 py-4 font-semibold transition ${selectedTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Pending</button>
            <button onClick={() => setSelectedTab('assigned')} className={`flex-1 px-6 py-4 font-semibold transition ${selectedTab === 'assigned' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Assigned</button>
          </div>

          <div className="p-6 border-b border-gray-200 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by id/title/category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition" type="button">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading complaints...</div>
            ) : filteredCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No complaints found.</div>
            ) : (
              filteredCases.map((caseItem) => (
                <button key={caseItem.id} type="button" onClick={() => setSelectedCase(caseItem)} className="w-full text-left p-6 hover:bg-gray-50 transition border-l-4 border-l-transparent hover:border-l-blue-600">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCaseIcon(caseItem.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{caseItem.title || caseItem.crime_type || 'Complaint'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityClass(caseItem.urgency_level)}`}>
                          {(caseItem.urgency_level || 'low').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{caseItem.description || 'No description'}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>ID: {caseItem.id}</span>
                        <span>Category: {caseItem.crime_type || 'N/A'}</span>
                        <span>Status: {caseItem.status || 'submitted'}</span>
                        <span>Filed: {caseItem.created_at ? new Date(caseItem.created_at).toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedCase.title || selectedCase.crime_type || 'Complaint'}</h2>
              <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-blue-500 rounded-lg transition" type="button">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Complaint ID</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.crime_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.status || 'submitted'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.location || selectedCase.jurisdiction || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed">{selectedCase.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => void updateStatus(selectedCase.id, 'assigned')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition" type="button">
                  Mark Assigned
                </button>
                <button onClick={() => void updateStatus(selectedCase.id, 'pending')} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition" type="button">
                  Mark Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
