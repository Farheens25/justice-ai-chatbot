'use client'

import { useState, useEffect } from 'react'
import { 
  Scale, Menu, X, ArrowRight, FileText, Users, Award, 
  Phone, MessageSquare, AlertCircle, Shield, Briefcase,
  Heart, AlertTriangle, Lock, BarChart3, Zap, Eye, CheckCircle,
  Upload, Trash2, Brain, Copy
} from 'lucide-react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Animated Pie Chart Component
interface PieChartProps {
  solved: number
  unsolved: number
  registered: number
  label: string
}

const AnimatedPieChart = ({ solved, unsolved, registered, label }: PieChartProps) => {
  const [animatedSolved, setAnimatedSolved] = useState(0)
  const [animatedUnsolved, setAnimatedUnsolved] = useState(0)
  const [animatedRegistered, setAnimatedRegistered] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimatedSolved(solved), 100)
    const timer2 = setTimeout(() => setAnimatedUnsolved(unsolved), 200)
    const timer3 = setTimeout(() => setAnimatedRegistered(registered), 300)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [solved, unsolved, registered])

  const total = solved + unsolved + registered
  const solvedPercent = (solved / total) * 100
  const unsolvedPercent = (unsolved / total) * 100
  const registeredPercent = (registered / total) * 100

  const getCirclePath = (percentage: number, offset: number) => {
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (circumference * percentage) / 100
    return { circumference, strokeDashoffset }
  }

  const solvedPath = getCirclePath(solvedPercent, 0)
  const unsolvedPath = getCirclePath(unsolvedPercent, solvedPercent)
  const registeredPath = getCirclePath(registeredPercent, solvedPercent + unsolvedPercent)

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition">
      <div className="relative w-32 h-32 mb-4">
        <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          
          {/* Solved (Green/Blue) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1e40af"
            strokeWidth="8"
            strokeDasharray={solvedPath.circumference}
            strokeDashoffset={solvedPath.circumference}
            style={{
              animation: 'dash 2s ease-in-out forwards',
              '--dash-offset': `${solvedPath.strokeDashoffset}px`,
            } as React.CSSProperties & { '--dash-offset': string }}
            strokeLinecap="round"
          />

          {/* Unsolved (Gray) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="8"
            strokeDasharray={unsolvedPath.circumference}
            strokeDashoffset={unsolvedPath.circumference}
            style={{
              animation: 'dash 2s ease-in-out 0.2s forwards',
              '--dash-offset': `${unsolvedPath.strokeDashoffset}px`,
              transformOrigin: '50px 50px',
              transform: `rotate(${solvedPercent * 3.6}deg)`,
            } as React.CSSProperties & { '--dash-offset': string }}
            strokeLinecap="round"
          />

          {/* Registered (Light Blue) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="8"
            strokeDasharray={registeredPath.circumference}
            strokeDashoffset={registeredPath.circumference}
            style={{
              animation: 'dash 2s ease-in-out 0.4s forwards',
              '--dash-offset': `${registeredPath.strokeDashoffset}px`,
              transformOrigin: '50px 50px',
              transform: `rotate(${(solvedPercent + unsolvedPercent) * 3.6}deg)`,
            } as React.CSSProperties & { '--dash-offset': string }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Cases</div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-3">{label}</h3>
      
      <div className="space-y-2 w-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm text-gray-700">Solved: {animatedSolved}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-sm text-gray-700">Unsolved: {animatedUnsolved}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-sm text-gray-700">Registered: {animatedRegistered}</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFileComplaintOpen, setIsFileComplaintOpen] = useState(false)
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    evidence: '',
    location: '',
    incidentDate: '',
    incidentTime: '',
    accusedName: '',
    witnessDetails: '',
    urgencyLevel: 'medium',
    preferredLanguage: 'english',
    pincode: '',
    isProtectedCase: false,
  })
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [aiAnalysisInput, setAiAnalysisInput] = useState('')
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatbotMode, setChatbotMode] = useState<'legal' | 'chat'>('legal')
  const [chatbotMessages, setChatbotMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false)
  const [submittedTrackingId, setSubmittedTrackingId] = useState('')
  const [submittedCaseStrength, setSubmittedCaseStrength] = useState<number | null>(null)
  const [submittedSummary, setSubmittedSummary] = useState('')
  const [submittedCaseAnalysis, setSubmittedCaseAnalysis] = useState<any>(null)
  const [submittedEscalationDraft, setSubmittedEscalationDraft] = useState('')
  const [submittedProtectedId, setSubmittedProtectedId] = useState('')
  const [submittedNearestPoliceStation, setSubmittedNearestPoliceStation] = useState('')
  const [nearestPoliceStation, setNearestPoliceStation] = useState('')
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState('')
  const [trackingIdInput, setTrackingIdInput] = useState('')
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [isTrackingLoading, setIsTrackingLoading] = useState(false)

  const caseCategories = [
    { id: 'harassment', label: 'Harassment', icon: AlertTriangle },
    { id: 'cybercrime', label: 'Cyber Crime', icon: Lock },
    { id: 'theft', label: 'Theft', icon: Shield },
    { id: 'domestic', label: 'Domestic Violence', icon: Heart },
    { id: 'corruption', label: 'Corruption', icon: BarChart3 },
    { id: 'fraud', label: 'Fraud', icon: AlertCircle },
    { id: 'assault', label: 'Assault', icon: Zap },
    { id: 'property', label: 'Property Dispute', icon: FileText },
    { id: 'labor', label: 'Labor Rights', icon: Users },
    { id: 'sexual', label: 'Sexual Harassment', icon: Eye },
    { id: 'child', label: 'Child Abuse', icon: AlertTriangle },
    { id: 'environmental', label: 'Environmental', icon: Zap },
  ]

  const legalAwareness = [
    {
      title: 'Know Your Rights',
      description: 'Understand the fundamental rights granted to every citizen under the constitution.'
    },
    {
      title: 'Legal Procedures',
      description: 'Learn about the step-by-step legal procedures for filing cases and lawsuits.'
    },
    {
      title: 'Court System',
      description: 'Understand how the judicial system works and different types of courts.'
    },
    {
      title: 'Evidence Collection',
      description: 'Guidelines on properly collecting and preserving evidence for legal cases.'
    },
    {
      title: 'Legal Terminology',
      description: 'Common legal terms and their meanings explained in simple language.'
    },
    {
      title: 'Your Responsibilities',
      description: 'Know your duties and responsibilities as a responsible citizen.'
    },
  ]

  const helplines = [
    {
      title: 'Police Emergency',
      number: '100',
      description: 'Emergency police assistance',
      icon: Shield,
      actions: [
        { label: 'Call Now', icon: Phone },
        { label: 'WhatsApp', icon: MessageSquare }
      ]
    },
    {
      title: 'Women\'s Helpline',
      number: '1091',
      description: 'Support for women in distress',
      icon: Heart,
      actions: [
        { label: 'Call Now', icon: Phone },
        { label: 'WhatsApp', icon: MessageSquare }
      ]
    },
    {
      title: 'Child Helpline',
      number: '1098',
      description: 'Protection for children in need',
      icon: AlertTriangle,
      actions: [
        { label: 'Call Now', icon: Phone },
        { label: 'Chat', icon: MessageSquare }
      ]
    },
    {
      title: 'Cyber Crime Helpline',
      number: '1930',
      description: 'Report cyber crimes and frauds',
      icon: Lock,
      actions: [
        { label: 'Call Now', icon: Phone },
        { label: 'Report Online', icon: MessageSquare }
      ]
    },
    {
      title: 'Senior Citizen Helpline',
      number: '1090',
      description: 'Assistance for senior citizens',
      icon: Users,
      actions: [
        { label: 'Call Now', icon: Phone },
        { label: 'WhatsApp', icon: MessageSquare }
      ]
    },
    {
      title: 'Legal Aid Authority',
      number: '1050',
      description: 'Free legal aid and assistance',
      icon: Briefcase,
      actions: [
        { label: 'Call Now', icon: Phone },
        { label: 'Request Aid', icon: MessageSquare }
      ]
    },
  ]

  const caseTypeMapping: { [key: string]: string } = {
    'harassment': 'Harassment',
    'cybercrime': 'Cyber Crime',
    'theft': 'Theft',
    'domestic': 'Domestic Violence',
    'corruption': 'Corruption',
    'fraud': 'Fraud/Cheating',
    'assault': 'Assault/Battery',
    'property': 'Property Dispute',
    'labor': 'Labor Rights Violation',
    'sexual': 'Sexual Harassment',
    'child': 'Child Abuse',
    'environmental': 'Environmental Violation'
  }

  const handleAIAnalysis = async () => {
    if (!aiAnalysisInput.trim()) {
      alert('Please describe your case')
      return
    }

    setIsAnalyzing(true)
    try {
      if (chatbotMode === 'legal') {
        const response = await fetch(`${API_BASE_URL}/chatbot/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint: aiAnalysisInput }),
        })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to process complaint')
        }
        setAiAnalysisResult({
          mode: 'legal',
          category: data.category,
          section: data.response?.section,
          advice: data.response?.advice,
          escalation: data.response?.escalation,
          helpline: data.response?.helpline,
          disclaimer: data.disclaimer,
        })
      } else {
        const nextMessages = [...chatbotMessages, { role: 'user' as const, content: aiAnalysisInput }]
        const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages }),
        })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Chat request failed')
        }
        const updated = [...nextMessages, { role: 'assistant' as const, content: data.reply }]
        setChatbotMessages(updated)
      }
      setAiAnalysisInput('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chatbot request failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setUploadedImages([...uploadedImages, ...Array.from(files)])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  const saveComplaintDraft = () => {
    const draft = {
      selectedCategory,
      formData,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('justiceai_complaint_draft', JSON.stringify(draft))
    alert('Draft saved locally')
  }

  const loadComplaintDraft = () => {
    const raw = localStorage.getItem('justiceai_complaint_draft')
    if (!raw) {
      alert('No saved draft found')
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setSelectedCategory(parsed.selectedCategory || null)
      setFormData((prev) => ({ ...prev, ...(parsed.formData || {}) }))
      alert('Draft loaded')
    } catch {
      alert('Draft is invalid')
    }
  }

  const copyEscalationDraft = async (draft: string) => {
    try {
      await navigator.clipboard.writeText(draft)
      alert('Escalation draft copied')
    } catch {
      alert('Unable to copy escalation draft')
    }
  }

  const fetchNearestPoliceStation = async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) {
      setNearestPoliceStation('')
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cases/public/police-station/${pincode}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to fetch nearest police station')
      setNearestPoliceStation(data.nearestPoliceStation || '')
    } catch {
      setNearestPoliceStation('Nearest police station to be assigned')
    }
  }

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image as evidence')
      return
    }

    if (!selectedCategory) {
      alert('Please select a category')
      return
    }

    setIsSubmittingComplaint(true)
    try {
      const response = await fetch(`${API_BASE_URL}/cases/public/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          caseType: caseTypeMapping[selectedCategory] || selectedCategory,
          description: formData.description,
          evidence: formData.evidence,
          proofCount: uploadedImages.length,
          incidentDate: formData.incidentDate,
          incidentTime: formData.incidentTime,
          accusedName: formData.accusedName,
          witnessDetails: formData.witnessDetails,
          urgencyLevel: formData.urgencyLevel,
          preferredLanguage: formData.preferredLanguage,
          pincode: formData.pincode,
          isProtectedCase: formData.isProtectedCase,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to file complaint')
      }

      setSubmittedTrackingId(data.complaint?.trackingId || '')
      setSubmittedCaseStrength(data.complaint?.caseStrength ?? null)
      setSubmittedSummary(data.complaint?.complaintSummary || '')
      setSubmittedCaseAnalysis(data.complaint?.caseAnalysis || null)
      setSubmittedEscalationDraft(data.complaint?.escalationDraft || '')
      setSubmittedProtectedId(data.complaint?.protectedId || '')
      setSubmittedNearestPoliceStation(data.complaint?.nearestPoliceStation || '')
      setSubmitSuccessMessage(data.message || 'Complaint filed successfully')
      setFormData({
        name: '',
        email: '',
        phone: '',
        description: '',
        evidence: '',
        location: '',
        incidentDate: '',
        incidentTime: '',
        accusedName: '',
        witnessDetails: '',
        urgencyLevel: 'medium',
        preferredLanguage: 'english',
        pincode: '',
        isProtectedCase: false,
      })
      setUploadedImages([])
      setSelectedCategory(null)
      setNearestPoliceStation('')
      setIsFileComplaintOpen(false)
      alert(`Complaint filed. Your tracking ID is: ${data.complaint?.trackingId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Complaint submission failed')
    } finally {
      setIsSubmittingComplaint(false)
    }
  }

  const handleTrackCase = async () => {
    if (!trackingIdInput.trim()) {
      alert('Enter tracking ID')
      return
    }

    setIsTrackingLoading(true)
    setTrackingResult(null)
    try {
      const response = await fetch(`${API_BASE_URL}/cases/public/track/${trackingIdInput.trim()}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Tracking ID not found')
      }
      setTrackingResult(data)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to track case')
    } finally {
      setIsTrackingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">JusticeAI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition font-medium">Home</Link>
              <button 
                onClick={() => setIsFileComplaintOpen(true)}
                className="text-gray-700 hover:text-blue-600 transition font-medium">File Case</button>
              <Link
                href="/ai-case-analysis"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                AI Analysis
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('track-case-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Track Case
              </button>
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Login
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
            <div className="md:hidden pb-4 space-y-2 border-t border-gray-200">
              <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition">Home</Link>
              <button 
                onClick={() => {
                  setIsFileComplaintOpen(true)
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition">File Case</button>
              <Link
                href="/ai-case-analysis"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              >
                AI Analysis
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('track-case-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Track Case
              </button>
              <Link href="/login" className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">Login</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">
              AI-Powered Legal Complaint Assistant
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              File complaints and analyze legal cases instantly with our intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsFileComplaintOpen(true)}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition inline-flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                File Complaint
              </button>
              <Link
                href="/ai-case-analysis"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-400 transition inline-flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                AI Case Analysis
              </Link>
            </div>
          </div>

          {/* Animated Charts */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <AnimatedPieChart solved={1245} unsolved={312} registered={980} label="Harassment Cases" />
            <AnimatedPieChart solved={856} unsolved={234} registered={645} label="Cyber Crime Cases" />
            <AnimatedPieChart solved={923} unsolved={187} registered={512} label="Overall Statistics" />
          </div>

          <div id="track-case-section" className="mt-12 bg-white text-gray-900 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">Track Your Complaint</h3>
            <p className="text-sm text-gray-600 mb-4">Enter your tracking ID to view FIR and case progress.</p>
            {submitSuccessMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                {submitSuccessMessage}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                placeholder="Example: TRK-2026-ABC123"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTrackCase}
                disabled={isTrackingLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {isTrackingLoading ? 'Checking...' : 'Track'}
              </button>
            </div>

            {submittedTrackingId && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="font-semibold text-green-800">Last submitted complaint</p>
                <p className="text-sm text-green-700">Tracking ID: {submittedTrackingId}</p>
                {submittedCaseStrength !== null && (
                  <p className="text-sm text-green-700">Estimated case strength: {submittedCaseStrength}%</p>
                )}
                {submittedProtectedId && (
                  <p className="text-sm text-green-700">Protected ID: {submittedProtectedId}</p>
                )}
                {submittedNearestPoliceStation && (
                  <p className="text-sm text-green-700">Nearest Police Station: {submittedNearestPoliceStation}</p>
                )}
                {submittedSummary && (
                  <p className="text-sm text-green-700 mt-1"><span className="font-medium">Abstract:</span> {submittedSummary}</p>
                )}
                {submittedCaseAnalysis && (
                  <div className="mt-2 text-sm text-green-700">
                    <p><span className="font-medium">Analysis:</span> {submittedCaseAnalysis.likelyOutcome}</p>
                    <p>Completeness Score: {submittedCaseAnalysis.completenessScore}% | Risk: {submittedCaseAnalysis.riskLevel}</p>
                  </div>
                )}
                {submittedEscalationDraft && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        onClick={() => copyEscalationDraft(submittedEscalationDraft)}
                        className="px-3 py-1.5 rounded bg-green-700 text-white text-xs font-semibold"
                      >
                        Copy Escalation Draft
                      </button>
                      <a
                        href={`mailto:?subject=Case Escalation Request&body=${encodeURIComponent(submittedEscalationDraft)}`}
                        className="px-3 py-1.5 rounded bg-blue-700 text-white text-xs font-semibold"
                      >
                        Send Draft by Email
                      </a>
                    </div>
                    <textarea
                      readOnly
                      value={submittedEscalationDraft}
                      rows={8}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white text-xs text-gray-700"
                    />
                  </div>
                )}
              </div>
            )}

            {trackingResult?.tracking && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                <p><span className="font-semibold">Case:</span> {trackingResult.tracking.caseNumber}</p>
                <p><span className="font-semibold">Status:</span> {trackingResult.tracking.status}</p>
                <p><span className="font-semibold">Progress:</span> {trackingResult.tracking.progressPercent}%</p>
                <p><span className="font-semibold">FIR:</span> {trackingResult.tracking.firNumber || 'Not filed yet'}</p>
                <p><span className="font-semibold">Winning chance estimate:</span> {trackingResult.tracking.caseStrength}%</p>
                <p><span className="font-semibold">Latest note:</span> {trackingResult.tracking.progressNotes || 'No notes yet'}</p>
                {trackingResult.tracking.protectedId && (
                  <p><span className="font-semibold">Protected ID:</span> {trackingResult.tracking.protectedId}</p>
                )}
                {trackingResult.tracking.nearestPoliceStation && (
                  <p><span className="font-semibold">Nearest Station:</span> {trackingResult.tracking.nearestPoliceStation}</p>
                )}
                {trackingResult.tracking.complaintSummary && (
                  <p><span className="font-semibold">Abstract:</span> {trackingResult.tracking.complaintSummary}</p>
                )}
                {trackingResult.tracking.caseAnalysis?.likelyOutcome && (
                  <p><span className="font-semibold">Analysis:</span> {trackingResult.tracking.caseAnalysis.likelyOutcome}</p>
                )}
                {trackingResult.tracking.escalationDraft && (
                  <div className="pt-2">
                    <button
                      onClick={() => copyEscalationDraft(trackingResult.tracking.escalationDraft)}
                      className="px-3 py-1.5 rounded bg-blue-700 text-white text-xs font-semibold"
                    >
                      Copy Escalation Draft
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-Screen File Complaint Page */}
      {isFileComplaintOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center shadow-lg">
              <h1 className="text-3xl font-bold">File a Complaint</h1>
              <button 
                onClick={() => {
                  setIsFileComplaintOpen(false)
                  setSelectedCategory(null)
                  setUploadedImages([])
                }}
                className="p-2 hover:bg-blue-500 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-8">
              {!selectedCategory ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Select Case Category</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {caseCategories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition transform hover:scale-105 flex flex-col items-center gap-3"
                        >
                          <Icon className="w-8 h-8" />
                          <span className="font-semibold text-center text-sm">{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => {
                      setSelectedCategory(null)
                      setUploadedImages([])
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium mb-8 flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to Categories
                  </button>

                  <form onSubmit={handleSubmitComplaint} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {caseCategories.find(c => c.id === selectedCategory)?.label} - Case Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date</label>
                        <input
                          type="date"
                          value={formData.incidentDate}
                          onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Incident Time</label>
                        <input
                          type="time"
                          value={formData.incidentTime}
                          onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accused Name (if known)</label>
                        <input
                          type="text"
                          value={formData.accusedName}
                          onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="Name / identifier"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                        <select
                          value={formData.urgencyLevel}
                          onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                        <select
                          value={formData.preferredLanguage}
                          onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                          <option value="english">English</option>
                          <option value="hindi">Hindi</option>
                          <option value="marathi">Marathi</option>
                          <option value="tamil">Tamil</option>
                          <option value="telugu">Telugu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Witness Details</label>
                        <input
                          type="text"
                          value={formData.witnessDetails}
                          onChange={(e) => setFormData({ ...formData, witnessDetails: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          placeholder="Witness names/contacts"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => {
                            const nextValue = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setFormData({ ...formData, pincode: nextValue })
                            if (nextValue.length === 6) {
                              fetchNearestPoliceStation(nextValue)
                            } else {
                              setNearestPoliceStation('')
                            }
                          }}
                          placeholder="6-digit pincode"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nearest Police Station</label>
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 min-h-[48px] flex items-center">
                          {nearestPoliceStation || 'Enter pincode to auto-detect nearest station'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Protected Case Filing</p>
                          <p className="text-xs text-amber-800">
                            Enable this to hide complainant identity from police view. You will receive a Protected ID.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isProtectedCase: !formData.isProtectedCase })}
                          className={`px-4 py-2 rounded-lg text-xs font-bold ${formData.isProtectedCase ? 'bg-amber-700 text-white' : 'bg-white text-amber-800 border border-amber-300'}`}
                        >
                          {formData.isProtectedCase ? 'Protected ID ON' : 'Enable Protected ID'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incident Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Describe the incident in detail with dates, times, and people involved..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                      <textarea
                        value={formData.evidence}
                        onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Any additional details or witnesses..."
                      />
                    </div>

                    {/* Evidence Photo Upload */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="flex flex-col items-center gap-3 mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Upload Evidence Photos</h3>
                        <p className="text-sm text-gray-600">Minimum 1 photo required, select as many as needed</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Uploaded Images Display */}
                    {uploadedImages.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Uploaded Photos ({uploadedImages.length})</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {uploadedImages.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Evidence ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-6 sticky bottom-0 bg-white">
                      <button
                        type="button"
                        onClick={saveComplaintDraft}
                        className="bg-gray-100 text-gray-800 px-4 py-4 rounded-lg font-bold hover:bg-gray-200 transition"
                      >
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={loadComplaintDraft}
                        className="bg-gray-100 text-gray-800 px-4 py-4 rounded-lg font-bold hover:bg-gray-200 transition"
                      >
                        Load Draft
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingComplaint}
                        className="flex-1 bg-blue-600 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        {isSubmittingComplaint ? 'Submitting...' : 'File Complaint'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFileComplaintOpen(false)
                          setSelectedCategory(null)
                          setUploadedImages([])
                        }}
                        className="flex-1 bg-gray-200 text-gray-900 px-6 py-4 rounded-lg font-bold hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Case Analysis Modal */}
      {isAIAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-8 h-8 text-blue-600" />
                AI Case Analysis
              </h2>
              <button 
                onClick={() => {
                  setIsAIAnalysisOpen(false)
                  setAiAnalysisInput('')
                  setAiAnalysisResult(null)
                  setChatbotMessages([])
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!aiAnalysisResult ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChatbotMode('legal')
                        setAiAnalysisResult(null)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${chatbotMode === 'legal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Legal Guidance
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChatbotMode('chat')
                        setAiAnalysisResult(null)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${chatbotMode === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      General Chat
                    </button>
                  </div>
                  <p className="text-gray-600">
                    {chatbotMode === 'legal'
                      ? 'Describe your legal issue to get category, legal sections, advice, escalation path, and helpline.'
                      : 'Ask legal questions and continue conversation with Justice AI chatbot.'}
                  </p>
                  {chatbotMode === 'chat' && chatbotMessages.length > 0 && (
                    <div className="max-h-56 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                      {chatbotMessages.map((msg, idx) => (
                        <p key={idx} className="text-sm">
                          <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Bot'}:</span> {msg.content}
                        </p>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={aiAnalysisInput}
                    onChange={(e) => setAiAnalysisInput(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder={chatbotMode === 'legal'
                      ? 'Example: I was scammed online through a fake e-commerce website...'
                      : 'Type your question for Justice AI chatbot...'}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                      <Brain className="w-5 h-5" />
                      {isAnalyzing ? 'Processing...' : chatbotMode === 'legal' ? 'Get Legal Guidance' : 'Send'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAIAnalysisOpen(false)
                        setAiAnalysisInput('')
                        setAiAnalysisResult(null)
                        setChatbotMessages([])
                      }}
                      className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiAnalysisResult.mode === 'legal' ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-2xl font-bold text-blue-900 mb-2">Category:</h3>
                        <p className="text-4xl font-bold text-blue-600">{aiAnalysisResult.category}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Applicable Legal Section</h4>
                        <p className="text-gray-700 leading-relaxed">{aiAnalysisResult.section}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Legal Advice</h4>
                        <p className="text-gray-700 leading-relaxed">{aiAnalysisResult.advice}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Escalation Path</h4>
                        <p className="text-gray-700 leading-relaxed">{aiAnalysisResult.escalation}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Emergency Helpline</h4>
                        <p className="text-gray-700 leading-relaxed">{aiAnalysisResult.helpline}</p>
                      </div>
                      {aiAnalysisResult.disclaimer && (
                        <p className="text-xs text-gray-500">{aiAnalysisResult.disclaimer}</p>
                      )}
                    </>
                  ) : (
                    <div className="max-h-72 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                      {chatbotMessages.map((msg, idx) => (
                        <p key={idx} className="text-sm">
                          <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Bot'}:</span> {msg.content}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setAiAnalysisResult(null)
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                      <Brain className="w-5 h-5" />
                      Ask Another
                    </button>
                    <button
                      onClick={() => {
                        setIsAIAnalysisOpen(false)
                        setAiAnalysisInput('')
                        setAiAnalysisResult(null)
                        setChatbotMessages([])
                      }}
                      className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legal Awareness Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Legal Awareness</h2>
            <p className="text-xl text-gray-600">Educate yourself on your rights and legal processes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {legalAwareness.map((item, idx) => (
              <div 
                key={idx}
                className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition transform hover:scale-105"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Helplines Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Government Helplines</h2>
            <p className="text-xl text-gray-600">Emergency support and assistance services available 24/7</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helplines.map((helpline, idx) => {
              const Icon = helpline.icon
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{helpline.title}</h3>
                      <p className="text-sm text-gray-600">{helpline.description}</p>
                    </div>
                  </div>

                  <div className="text-center py-4 border-t border-b border-gray-200 my-4">
                    <div className="text-4xl font-bold text-blue-600">{helpline.number}</div>
                  </div>

                  <div className="space-y-2">
                    {helpline.actions.map((action, actionIdx) => {
                      const ActionIcon = action.icon
                      return (
                        <button
                          key={actionIdx}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
                        >
                          <ActionIcon className="w-4 h-4" />
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">When to Call:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Life-threatening situations</li>
                  <li>• Active crimes in progress</li>
                  <li>• Child or elder abuse</li>
                  <li>• Cyber fraud activities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Information to Provide:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Your current location</li>
                  <li>• Type of emergency</li>
                  <li>• Number of people involved</li>
                  <li>• Your contact information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-8 h-8 text-white" />
                <span className="font-bold text-xl">JusticeAI</span>
              </div>
              <p className="text-blue-100">Empowering justice through AI and technology.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Services</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white transition">Legal Guide</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-blue-100">Email: support@justiceai.com</p>
              <p className="text-blue-100">Phone: 1-800-JUSTICE</p>
              <p className="text-blue-100">Emergency: 100</p>
            </div>
          </div>

          <div className="border-t border-blue-800 pt-8">
            <p className="text-center text-blue-100">© 2024 JusticeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
