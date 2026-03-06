'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shield, LogOut, Bell, Menu, X, Eye, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface PoliceCase {
  id: string
  case_number: string
  tracking_id: string | null
  title: string
  case_type: string | null
  status: 'open' | 'pending' | 'resolved' | 'closed'
  description: string | null
  created_at: string
  assigned_police_id: string | null
  fir_number: string | null
  progress_percent: number | null
  progress_notes: string | null
  complainant_name: string | null
  complainant_phone: string | null
  complainant_location: string | null
  is_protected_case?: boolean | null
  protected_reference_id?: string | null
  nearest_police_station?: string | null
}

export default function PoliceDashboard() {
  const router = useRouter()
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'new' | 'pending' | 'assigned'>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<PoliceCase | null>(null)
  const [cases, setCases] = useState<PoliceCase[]>([])
  const [isLoadingCases, setIsLoadingCases] = useState(false)
  const [firNumber, setFirNumber] = useState('')
  const [progressPercent, setProgressPercent] = useState(25)
  const [progressNotes, setProgressNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const loadCases = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setIsLoadingCases(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/cases/police/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cases')
      }
      setCases(data.cases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch cases')
    } finally {
      setIsLoadingCases(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const rawUser = localStorage.getItem('user')

    if (!token || !rawUser) {
      router.replace('/login')
      return
    }

    try {
      const user = JSON.parse(rawUser)
      if (user?.userType !== 'police') {
        router.replace('/login')
        return
      }
      setIsAuthChecked(true)
      loadCases()
    } catch {
      router.replace('/login')
    }
  }, [router])

  const filteredCases = useMemo(() => {
    const base = cases.filter((c) => {
      if (selectedTab === 'new') return !c.assigned_police_id
      if (selectedTab === 'pending') return !!c.assigned_police_id && c.status !== 'resolved' && c.status !== 'closed'
      return c.status === 'resolved' || c.status === 'closed'
    })

    return base.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tracking_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [cases, searchQuery, selectedTab])

  const stats = {
    new: cases.filter((c) => !c.assigned_police_id).length,
    pending: cases.filter((c) => !!c.assigned_police_id && c.status !== 'resolved' && c.status !== 'closed').length,
    assigned: cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const openCase = (caseItem: PoliceCase) => {
    setSelectedCase(caseItem)
    setFirNumber(caseItem.fir_number || '')
    setProgressPercent(caseItem.progress_percent || 25)
    setProgressNotes(caseItem.progress_notes || '')
  }

  const handleUpdateCase = async () => {
    if (!selectedCase) return
    const token = localStorage.getItem('token')
    if (!token) return

    setIsUpdating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${selectedCase.id}/fir`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firNumber: firNumber.trim() || undefined,
          progressPercent,
          progressNotes,
          status: progressPercent >= 100 ? 'resolved' : 'pending',
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update case')
      }
      await loadCases()
      setSelectedCase(data.case)
      alert('Case updated successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsUpdating(false)
    }
  }

  const applyQuickProgress = (value: number) => {
    setProgressPercent(value)
    if (value >= 100) {
      setProgressNotes((prev) => prev || 'Investigation completed. Case marked resolved.')
    }
  }

  if (!isAuthChecked) {
    return null
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
                <p className="text-xs text-gray-500">FIR and Case Tracking</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 transition">
                <LogOut className="w-6 h-6" />
              </button>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200 space-y-2">
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition flex items-center gap-2 text-red-600">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-orange-100 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">New Complaints</p>
            <p className="text-4xl font-bold text-orange-600">{stats.new}</p>
          </div>
          <div className="bg-red-100 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">In Progress</p>
            <p className="text-4xl font-bold text-red-600">{stats.pending}</p>
          </div>
          <div className="bg-green-100 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Resolved</p>
            <p className="text-4xl font-bold text-green-600">{stats.assigned}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setSelectedTab('new')} className={`flex-1 px-6 py-4 font-semibold transition ${selectedTab === 'new' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              New ({stats.new})
            </button>
            <button onClick={() => setSelectedTab('pending')} className={`flex-1 px-6 py-4 font-semibold transition ${selectedTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Pending ({stats.pending})
            </button>
            <button onClick={() => setSelectedTab('assigned')} className={`flex-1 px-6 py-4 font-semibold transition ${selectedTab === 'assigned' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Resolved ({stats.assigned})
            </button>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by case number, title or tracking ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {error && <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>}

          <div className="divide-y divide-gray-200">
            {isLoadingCases ? (
              <div className="p-6 text-center text-gray-500">Loading cases...</div>
            ) : filteredCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No cases found in this category.</div>
            ) : (
              filteredCases.map((caseItem) => (
                <div key={caseItem.id} onClick={() => openCase(caseItem)} className="p-6 hover:bg-gray-50 transition cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-600">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {caseItem.status === 'resolved' || caseItem.status === 'closed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : caseItem.assigned_police_id ? (
                          <Clock className="w-5 h-5 text-red-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                        {caseItem.is_protected_case && (
                          <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-semibold">Protected</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{caseItem.description || 'No description'}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Case: {caseItem.case_number}</span>
                        <span>Tracking: {caseItem.tracking_id || 'N/A'}</span>
                        <span>Type: {caseItem.case_type || 'N/A'}</span>
                        <span>Progress: {caseItem.progress_percent || 0}%</span>
                        {caseItem.nearest_police_station && <span>Station: {caseItem.nearest_police_station}</span>}
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
              <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-blue-500 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Case Number</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.case_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tracking ID</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.tracking_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Complainant</p>
                  <p className="text-gray-900">{selectedCase.complainant_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-900">{selectedCase.complainant_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Protected ID</p>
                  <p className="text-gray-900">{selectedCase.protected_reference_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nearest Station</p>
                  <p className="text-gray-900">{selectedCase.nearest_police_station || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Complaint Details</p>
                <p className="text-gray-700 leading-relaxed">{selectedCase.description || 'No details provided'}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">File FIR / Update Progress</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button type="button" onClick={() => applyQuickProgress(25)} className="px-3 py-1.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">25%</button>
                  <button type="button" onClick={() => applyQuickProgress(50)} className="px-3 py-1.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">50%</button>
                  <button type="button" onClick={() => applyQuickProgress(75)} className="px-3 py-1.5 rounded bg-orange-100 text-orange-800 text-xs font-semibold">75%</button>
                  <button type="button" onClick={() => applyQuickProgress(100)} className="px-3 py-1.5 rounded bg-green-100 text-green-800 text-xs font-semibold">Mark Completed</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">FIR Number</label>
                    <input
                      type="text"
                      value={firNumber}
                      onChange={(e) => setFirNumber(e.target.value)}
                      placeholder="FIR-2026-0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressPercent}
                      onChange={(e) => setProgressPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Progress Note</label>
                    <textarea
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Investigation update for complainant..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateCase} disabled={isUpdating} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition">
                  {isUpdating ? 'Saving...' : 'Save FIR/Progress'}
                </button>
                <button
                  onClick={() => {
                    setProgressPercent(100)
                    setProgressNotes((prev) => prev || 'Investigation completed. Case marked resolved.')
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Complete
                </button>
                <button onClick={() => setSelectedCase(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
