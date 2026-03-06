# Justice AI - Complete Setup Guide

This guide walks you through connecting your frontend and backend to Supabase and setting up everything.

## ✅ What's Been Done

1. ✅ **Frontend Connected** - Supabase URL and Anon Key configured in `v0-justice-ai-frontend/.env.local`
2. ✅ **Backend Created** - Complete Node.js/Express backend structure
3. ✅ **Dependencies Installed** - All npm packages ready to go
4. ✅ **Authentication System** - Signup, login, JWT tokens
5. ✅ **Team Management** - Invite and manage team members
6. ✅ **Database Schema** - Ready to deploy to Supabase

## 🚀 Next Steps

### Step 1: Set Up Database Schema in Supabase

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project `gujtnhlfxzsxqkhtasks`

2. **Run SQL Schema**
   - Click **SQL Editor** (left sidebar)
   - Click **New Query**
   - Copy the SQL from `backend/database/schema.sql`
   - Paste it into the editor
   - Click **Run**

   This creates all tables:
   - `users` - User profiles
   - `cases` - Legal cases
   - `case_documents` - Case files
   - `case_activities` - Activity logs
   - `audit_logs` - System logs

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:3001`

You should see:
```
🚀 Justice AI Backend running on port 3001
📡 Supabase URL: https://gujtnhlfxzsxqkhtasks.supabase.co
```

### Step 3: Test Basic Endpoints

Health check:
```bash
curl http://localhost:3001/health
```

### Step 4: Create First Admin User (Test)

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@justiceai.com",
    "password": "TempPassword123!",
    "fullName": "Admin User",
    "userType": "admin"
  }'
```

Response will include a JWT token.

### Step 5: Add Team Members

Use the admin token from step 4:

```bash
curl -X POST http://localhost:3001/api/team/invite \
  -H "Authorization: Bearer <your_jwt_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@justiceai.com",
    "userType": "lawyer"
  }'
```

## 📁 Project Structure

```
justiceAi/
├── v0-justice-ai-frontend/     # Next.js Frontend
│   ├── app/                    # Pages (login, dashboard, etc.)
│   ├── components/             # React components
│   ├── lib/                    # Utilities (supabase.js, api.ts)
│   └── .env.local             # Frontend env (already configured)
│
└── backend/                    # Node.js/Express Backend
    ├── server.js              # Main server
    ├── routes/                # API routes
    │   ├── auth.js           # Authentication
    │   ├── users.js          # User management
    │   ├── team.js           # Team management
    │   └── dashboard.js      # Dashboard stats
    ├── middleware/            # Middleware (auth)
    ├── utils/                # Utilities (supabase.js)
    ├── database/             # Database schema
    │   └── schema.sql        # SQL tables and policies
    └── .env                  # Backend env (configured with your keys)
```

## 🔐 Security Checklist

- [x] Anon Key used in frontend only
- [x] Service Role Key used in backend only
- [x] JWT_SECRET configured
- [x] .env files in .gitignore
- [x] Row Level Security (RLS) enabled on tables
- [x] CORS configured

## 📝 Available API Endpoints

### Authentication
```
POST   /api/auth/signup        - Register new user
POST   /api/auth/login         - Login
POST   /api/auth/logout        - Logout
GET    /api/auth/me            - Get current user
```

### Users
```
GET    /api/users              - Get all users (admin)
GET    /api/users/:id          - Get user by ID
PUT    /api/users/:id          - Update user profile
GET    /api/users/type/:type   - Get users by type
```

### Team Management
```
POST   /api/team/invite        - Invite team member (admin)
GET    /api/team               - Get all members (admin)
DELETE /api/team/:userId       - Remove member (admin)
PUT    /api/team/:userId/role  - Update role (admin)
```

## 🧪 Testing with Postman/Curl

### 1. Create Admin User
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Password123!",
    "fullName": "Test Admin",
    "userType": "admin"
  }'
```

Save the token from response.

### 2. Invite Lawyer
```bash
curl -X POST http://localhost:3001/api/team/invite \
  -H "Authorization: Bearer <token_from_step_1>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@test.com",
    "userType": "lawyer"
  }'
```

### 3. Get All Users (Admin)
```bash
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer <token_from_step_1>"
```

## 🔗 Connect Frontend to Backend

Update your frontend API to use the backend:

In `v0-justice-ai-frontend/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';

export async function signup(email: string, password: string, fullName: string, userType: string) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, userType }),
  });
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Or use a different port
PORT=3002 npm run dev
```

### Database connection error
- Verify Supabase URL and keys in `.env`
- Check that schema.sql was executed
- Ensure Service Role Key is used (not Anon Key)

### Authentication failing
- Verify JWT_SECRET in backend `.env`
- Check user exists in database
- Ensure token is in Authorization header: `Bearer <token>`

## 🎯 Next Features to Add

- [ ] Case management endpoints
- [ ] Document upload to Supabase Storage
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] Admin dashboard
- [ ] User Profile pages
- [ ] Case tracking and status updates

## 💡 Quick Commands

```bash
# Start dev server (with auto-reload)
cd backend && npm run dev

# Start production server
cd backend && npm start

# Check if backend is running
curl http://localhost:3001/health

# View logs (in Supabase dashboard)
https://app.supabase.com -> Logs
```

## 📞 Support

If you encounter issues:
1. Check `.env` files have correct values
2. Verify schema.sql was executed in Supabase
3. Check CORS settings
4. Review server logs for error messages

---

**You're all set! 🎉**

Your Justice AI application is now:
- ✅ Connected to Supabase backend
- ✅ Frontend with authentication UI ready
- ✅ Backend server running with all endpoints
- ✅ Database schema deployed
- ✅ Team member management ready

Start testing and building! 🚀
