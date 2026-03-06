# 🚀 Quick Start Commands - Copy & Paste

All commands are for PowerShell on Windows.

---

## 1️⃣ Start Backend Server

Open PowerShell and copy-paste this:

```powershell
cd c:\justiceAi\backend
npm run dev
```

**Expected output:**
```
🚀 Justice AI Backend running on port 3001
📡 Supabase URL: https://gujtnhlfxzsxqkhtasks.supabase.co
```

---

## 2️⃣ Test Health Endpoint

Open NEW PowerShell window and copy-paste:

```powershell
curl http://localhost:3001/health
```

**Expected output:**
```json
{"status":"Backend is running","timestamp":"2026-03-06T..."}
```

---

## 3️⃣ Create First Admin User

Copy-paste in PowerShell:

```powershell
curl -X POST http://localhost:3001/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@justiceai.com",
    "password": "Password123!",
    "fullName": "Admin User",
    "userType": "admin"
  }'
```

**Expected output includes:**
```
"token": "eyJhbGcI..." (save this!)
"user": {...}
```

**⚠️ SAVE THE TOKEN FROM RESPONSE - You'll use it next!**

---

## 4️⃣ Invite Team Member (Lawyer)

Replace `YOUR_TOKEN_HERE` with the token from step 3, then copy-paste:

```powershell
curl -X POST http://localhost:3001/api/team/invite `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "lawyer@justiceai.com",
    "userType": "lawyer"
  }'
```

---

## 5️⃣ Invite Team Member (Police)

Replace `YOUR_TOKEN_HERE` with the admin token, then copy-paste:

```powershell
curl -X POST http://localhost:3001/api/team/invite `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "police@justiceai.com",
    "userType": "police"
  }'
```

---

## 6️⃣ Get All Users (Admin Only)

Replace `YOUR_TOKEN_HERE`, then copy-paste:

```powershell
curl http://localhost:3001/api/users `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 7️⃣ Get Current User Info

Replace `YOUR_TOKEN_HERE`, then copy-paste:

```powershell
curl http://localhost:3001/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 8️⃣ Get Users by Type (Lawyers Only)

Replace `YOUR_TOKEN_HERE`, then copy-paste:

```powershell
curl http://localhost:3001/api/users/type/lawyer `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9️⃣ Get Users by Type (Police Only)

Replace `YOUR_TOKEN_HERE`, then copy-paste:

```powershell
curl http://localhost:3001/api/users/type/police `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔟 Get All Team Members

Replace `YOUR_TOKEN_HERE`, then copy-paste:

```powershell
curl http://localhost:3001/api/team `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ❌ Stop Backend Server

Go to PowerShell window running the backend and press:

```
Ctrl + C
```

---

## 🔄 Restart Backend Server

```powershell
cd c:\justiceAi\backend
npm run dev
```

---

## 🧪 Full Testing Workflow

Execute these in order in NEW PowerShell window (keep backend running in another window):

### 1. Health Check
```powershell
curl http://localhost:3001/health
```

### 2. Create Admin
```powershell
$adminResponse = curl -X POST http://localhost:3001/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123!",
    "fullName": "Test Admin",
    "userType": "admin"
  }'
echo $adminResponse
```

### 3. Extract and Save Token (manual step)
```
Copy the "token" value from the response above
```

### 4. Use Token to Invite Lawyer
```powershell
# Replace YOUR_TOKEN with the copied value
curl -X POST http://localhost:3001/api/team/invite `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test-lawyer@test.com",
    "userType": "lawyer"
  }'
```

### 5. View All Users
```powershell
curl http://localhost:3001/api/users `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes for Commands

- All commands use `curl` (included in Windows PowerShell)
- Replace `YOUR_TOKEN_HERE` with actual token from signup response
- The backtick (`) is for line continuation in PowerShell
- Commands are case-sensitive
- JSON format must be exact
- This is development mode - not for production

---

## 🔓 Access Levels

| User Type | Can Do | Cannot Do |
|-----------|--------|-----------|
| Admin | Everything | (nothing) |
| Lawyer | View assigned cases | Invite users, manage system |
| Police | View assigned cases | Invite users, manage system |
| Guest | Nothing | (everything) |

---

## 🆘 Common Issues

**"Connection refused"**
- Backend not running or port 3001 not open
- Solution: Run `npm run dev` in backend folder first

**"Invalid credentials"**
- Email/password incorrect
- Solution: Re-check credentials or create new user

**"No token provided"**
- Missing Authorization header
- Solution: Add `-H "Authorization: Bearer TOKEN"` to command

**"Invalid token"**
- Token expired or incorrect
- Solution: Create new user to get new token

---

## 💾 Save Your Tokens

After creating admin user, the response includes:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**SAVE THE TOKEN!** You'll need it for other API calls.

---

## 📚 Useful References

- Backend API Docs: See `backend/README.md`
- Setup Guide: See `SETUP_GUIDE.md`
- Database Schema: See `backend/database/schema.sql`

---

## ✅ Checklist

Before testing:
- [ ] Database schema executed in Supabase
- [ ] Backend running (`npm run dev`)
- [ ] Health endpoint responds
- [ ] Create admin user works
- [ ] Token received and saved
- [ ] Can invite team members

---

**Happy Testing! 🎉**

If commands work correctly, your Justice AI backend is fully operational!
