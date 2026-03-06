'use client'

import { useState } from 'react'
import { Shield, LogOut, Bell, Menu, X, Eye, CheckCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface Case {
  id: string
  caseNumber: string
  title: string
  category: string
  status: 'pending' | 'assigned' | 'new'
  date: string
  officer: string
  details: string
  priority: 'high' | 'medium' | 'low'
}

export default function PoliceDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'new' | 'pending' | 'assigned'>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  const cases: Case[] = [
    {
      id: '1',
      caseNumber: 'PC-2024-001',
      title: 'Online Harassment Case',
      category: 'Cyber Crime',
      status: 'new',
      date: '2024-03-04',
      officer: 'Officer John Smith',
      details: 'Victim reported repeated harassing messages on social media from unknown account.',
      priority: 'high'
    },
    {
      id: '2',
      caseNumber: 'PC-2024-002',
      title: 'Property Theft',
      category: 'Theft',
      status: 'pending',
      date: '2024-03-03',
      officer: 'Officer Sarah Johnson',
      details: 'Residential burglary reported in downtown area. Suspect description available.',
      priority: 'high'
    },
    {
      id: '3',
      caseNumber: 'PC-2024-003',
      title: 'Fraud Investigation',
      category: 'Fraud',
      status: 'assigned',
      date: '2024-03-02',
      officer: 'Officer Mike Chen',
      details: 'Bank fraud investigation involving fake online shopping transactions.',
      priority: 'medium'
    },
    {
      id: '4',
      caseNumber: 'PC-2024-004',
      title: 'Domestic Disturbance',
      category: 'Domestic Violence',
      status: 'pending',
      date: '2024-03-01',
      officer: 'Officer Emma Wilson',
      details: 'Family dispute with allegations of verbal harassment and intimidation.',
      priority: 'high'
    },
    {
      id: '5',
      caseNumber: 'PC-2024-005',
      title: 'Traffic Violation',
      category: 'Other',
      status: 'assigned',
      date: '2024-02-28',
      officer: 'Officer David Brown',
      details: 'Reckless driving complaint with multiple witness statements collected.',
      priority: 'low'
    }
  ]

  const filteredCases = cases
    .filter(c => c.status === selectedTab)
    .filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const getCaseIcon = (status: string) => {
    switch(status) {
      case 'new':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-red-600" />
      case 'assigned':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    { label: 'New Cases', value: cases.filter(c => c.status === 'new').length, color: 'bg-orange-100', textColor: 'text-orange-600' },
    { label: 'Pending Cases', value: cases.filter(c => c.status === 'pending').length, color: 'bg-red-100', textColor: 'text-red-600' },
    { label: 'Assigned Cases', value: cases.filter(c => c.status === 'assigned').length, color: 'bg-green-100', textColor: 'text-green-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">JusticeAI Police</h1>
                <p className="text-xs text-gray-500">Case Management System</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Officer John Doe</p>
                  <p className="text-xs text-gray-500">Police ID: PO-12345</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
              </div>
              <Link href="/login" className="p-2 text-gray-600 hover:text-red-600 transition">
                <LogOut className="w-6 h-6" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200 space-y-2">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              <Link href="/login" className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition flex items-center gap-2 text-red-600">
                <LogOut className="w-5 h-5" />
                Logout
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-lg p-6 border border-gray-200`}>
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Cases Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('new')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                selectedTab === 'new'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              New Cases ({cases.filter(c => c.status === 'new').length})
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                selectedTab === 'pending'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Cases ({cases.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedTab('assigned')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                selectedTab === 'assigned'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assigned Cases ({cases.filter(c => c.status === 'assigned').length})
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by case number or title..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Cases List */}
          <div className="divide-y divide-gray-200">
            {filteredCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No cases found in this category.
              </div>
            ) : (
              filteredCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem)}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCaseIcon(caseItem.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(caseItem.priority)}`}>
                          {caseItem.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{caseItem.details}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Case: {caseItem.caseNumber}</span>
                        <span>Category: {caseItem.category}</span>
                        <span>Officer: {caseItem.officer}</span>
                        <span>Filed: {new Date(caseItem.date).toLocaleDateString()}</span>
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

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
              <button
               onClick={() => setSelectedCase(null)}
                className="p-2 hover:bg-blue-500 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Case Number</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.caseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCase.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{selectedCase.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(selectedCase.priority)}`}>
                    {selectedCase.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Details</p>
                <p className="text-gray-700 leading-relaxed">{selectedCase.details}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Assigned Officer</p>
                  <p className="text-gray-900">{selectedCase.officer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Filed</p>
                  <p className="text-gray-900">{new Date(selectedCase.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                  Assign to Lawyer
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
