'use client'

import { useState } from 'react'
import { Briefcase, LogOut, Bell, Menu, X, Eye, CheckCircle, Clock, AlertCircle, Search, Filter, Star, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface LawyerCase {
  id: string
  caseNumber: string
  title: string
  category: string
  status: 'available' | 'hired' | 'completed'
  date: string
  client: string
  details: string
  priority: 'high' | 'medium' | 'low'
  fee: number
  rating?: number
}

export default function LawyerDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'available' | 'hired' | 'completed'>('available')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<LawyerCase | null>(null)

  const cases: LawyerCase[] = [
    {
      id: '1',
      caseNumber: 'LC-2024-001',
      title: 'Online Harassment Case',
      category: 'Cyber Crime',
      status: 'available',
      date: '2024-03-04',
      client: 'Victim - Not Assigned',
      details: 'Victim reported repeated harassing messages on social media from unknown account. Requires expertise in cyber harassment and evidence collection.',
      priority: 'high',
      fee: 5000
    },
    {
      id: '2',
      caseNumber: 'LC-2024-002',
      title: 'Property Theft Defense',
      category: 'Theft',
      status: 'hired',
      date: '2024-03-03',
      client: 'John Smith',
      details: 'Defending client in residential burglary case. Strong alibi evidence available.',
      priority: 'high',
      fee: 7500,
      rating: 4.8
    },
    {
      id: '3',
      caseNumber: 'LC-2024-003',
      title: 'Fraud Investigation Defense',
      category: 'Fraud',
      status: 'hired',
      date: '2024-03-02',
      client: 'Sarah Johnson',
      details: 'Bank fraud case defense. Client claims mistaken identity. Requires financial document analysis.',
      priority: 'medium',
      fee: 6000,
      rating: 4.5
    },
    {
      id: '4',
      caseNumber: 'LC-2024-004',
      title: 'Domestic Violence Protection',
      category: 'Domestic Violence',
      status: 'available',
      date: '2024-03-01',
      client: 'Victim - Not Assigned',
      details: 'Family dispute case with allegations requiring protective order. Victim support needed.',
      priority: 'high',
      fee: 4500
    },
    {
      id: '5',
      caseNumber: 'LC-2024-005',
      title: 'Property Dispute Settlement',
      category: 'Property',
      status: 'completed',
      date: '2024-02-28',
      client: 'Michael Chen',
      details: 'Successfully resolved property boundary dispute between neighbors.',
      priority: 'low',
      fee: 3000,
      rating: 5
    },
    {
      id: '6',
      caseNumber: 'LC-2024-006',
      title: 'Labor Rights Case',
      category: 'Labor Rights',
      status: 'available',
      date: '2024-02-27',
      client: 'Worker - Not Assigned',
      details: 'Wage theft and unfair dismissal case. Employee seeking compensation for unpaid wages.',
      priority: 'medium',
      fee: 4000
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
      case 'available':
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      case 'hired':
        return <Clock className="w-5 h-5 text-purple-600" />
      case 'completed':
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
    { label: 'Available Cases', value: cases.filter(c => c.status === 'available').length, color: 'bg-blue-100', textColor: 'text-blue-600' },
    { label: 'Hired Cases', value: cases.filter(c => c.status === 'hired').length, color: 'bg-purple-100', textColor: 'text-purple-600' },
    { label: 'Completed Cases', value: cases.filter(c => c.status === 'completed').length, color: 'bg-green-100', textColor: 'text-green-600' }
  ]

  const earnedAmount = cases
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.fee, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">JusticeAI Lawyer</h1>
                <p className="text-xs text-gray-500">Case Management Portal</p>
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
                  <p className="text-sm font-medium text-gray-900">Advocate Sarah Lee</p>
                  <p className="text-xs text-gray-500">License: BL-98765</p>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full"></div>
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-lg p-6 border border-gray-200`}>
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
          <div className="bg-green-100 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Earned This Month
            </p>
            <p className="text-4xl font-bold text-green-600">₹{earnedAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Cases Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('available')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                selectedTab === 'available'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Cases ({cases.filter(c => c.status === 'available').length})
            </button>
            <button
              onClick={() => setSelectedTab('hired')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                selectedTab === 'hired'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Cases ({cases.filter(c => c.status === 'hired').length})
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                selectedTab === 'completed'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({cases.filter(c => c.status === 'completed').length})
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
                      <p className="text-sm text-gray-600 mb-3">{caseItem.details}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Case: {caseItem.caseNumber}</span>
                        <span>Category: {caseItem.category}</span>
                        <span>Client: {caseItem.client}</span>
                        <span>Fee: ₹{caseItem.fee.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Eye className="w-5 h-5 text-gray-400 mt-1" />
                      {caseItem.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{caseItem.rating}</span>
                        </div>
                      )}
                    </div>
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
                <p className="text-sm text-gray-500 mb-2">Case Details</p>
                <p className="text-gray-700 leading-relaxed">{selectedCase.details}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-gray-900">{selectedCase.client}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Professional Fee</p>
                  <p className="text-lg font-semibold text-gray-900">₹{selectedCase.fee.toLocaleString()}</p>
                </div>
              </div>

              {selectedCase.rating && (
                <div>
                  <p className="text-sm text-gray-500">Client Rating</p>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(selectedCase.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm font-semibold ml-2">{selectedCase.rating}/5</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedCase.status === 'available' && (
                  <>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                      Accept Case
                    </button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition">
                      View More
                    </button>
                  </>
                )}
                {selectedCase.status === 'hired' && (
                  <>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                      View Documents
                    </button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition">
                      Contact Client
                    </button>
                  </>
                )}
                {selectedCase.status === 'completed' && (
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                    View Summary
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
