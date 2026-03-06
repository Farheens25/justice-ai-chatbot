const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
if (!API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not defined – API calls will fail')
}
console.log('API helper initialized, API_URL =', API_URL)

interface LoginPayload {
  email: string
  password: string
}

interface ApiResponse<T> {
  status: string
  data: T
  [key: string]: any
}

export async function login(payload: LoginPayload) {
  if (!API_URL) throw new Error('API_URL not configured')
  const url = `${API_URL}/login-test`
  console.log('login() calling', url)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  let body: ApiResponse<any>
  try {
    body = JSON.parse(text)
  } catch {
    throw new Error('Non-JSON response from server: ' + text.slice(0,200))
  }
  if (!res.ok || body.status !== 'success') {
    throw new Error(body.detail || 'Login failed')
  }
  return body.data
}

export async function signup(payload: LoginPayload) {
  if (!API_URL) throw new Error('API_URL not configured')
  const url = `${API_URL}/signup-test`
  console.log('signup() calling', url)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body: ApiResponse<any> = await res.json()
  if (!res.ok || body.status !== 'success') {
    throw new Error(body.detail || 'Signup failed')
  }
  return body.data
}

export async function getMyComplaints(token: string) {
  if (!API_URL) throw new Error('API_URL not configured')
  const url = `${API_URL}/my-complaints`
  console.log('getMyComplaints() calling', url)
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch complaints')
  return res.json()
}
