# Supabase Database Setup Instructions

## Quick Steps to Set Up Your Database

### 1. Access Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project: **gujtnhlfxzsxqkhtasks**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### 2. Copy and Run Database Schema

Copy the entire SQL code below and paste it into the SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('admin', 'lawyer', 'police')),
  phone VARCHAR(20),
  address TEXT,
  avatar_url VARCHAR(512),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending', 'resolved')),
  case_type VARCHAR(100),
  assigned_lawyer_id UUID REFERENCES auth.users(id),
  assigned_police_id UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_documents table
CREATE TABLE IF NOT EXISTS public.case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(512),
  document_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_activities table for tracking case updates
CREATE TABLE IF NOT EXISTS public.case_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.users WHERE user_type = 'admin')
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.users WHERE user_type = 'admin')
  );

-- Create policies for cases table
CREATE POLICY "Cases are viewable by assigned users and admins" ON public.cases
  FOR SELECT USING (
    auth.uid() = assigned_lawyer_id OR 
    auth.uid() = assigned_police_id OR 
    auth.uid() IN (SELECT id FROM public.users WHERE user_type = 'admin')
  );

CREATE POLICY "Authorized users can insert cases" ON public.cases
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_lawyer ON public.cases(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_police ON public.cases(assigned_police_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON public.case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_activities_case_id ON public.case_activities(case_id);
```

Then click **RUN** button.

### 3. Verify Tables Were Created

After running the SQL:

1. Click **Table Editor** (left sidebar)
2. You should see these tables:
   - `users`
   - `cases`
   - `case_documents`
   - `case_activities`
   - `audit_logs`

### 4. Check Row Level Security is Enabled

1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. RLS should be shown as **Enabled** for each table

## What Was Created

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles with roles (admin, lawyer, police) |
| `cases` | Legal cases |
| `case_documents` | Documents attached to cases |
| `case_activities` | Activity log for each case |
| `audit_logs` | System-wide audit trail |

### Security Policies (RLS)

- Users can only see their own profile
- Admins can see all users
- Users can only access cases assigned to them
- Admins can see all cases

### Indexes

Optimized queries for:
- Filtering by user type
- Filtering by case status
- Finding assigned cases

## Connection Status

✅ **Frontend**: Connected to Supabase (environment variables configured)
✅ **Backend**: Configured with Service Role Key
⏳ **Database**: Waiting for schema to be executed

## Next Step

After running the SQL schema:
1. Start the backend server: `cd backend && npm run dev`
2. Test the health endpoint: `curl http://localhost:3001/health`
3. Create your first admin user (see SETUP_GUIDE.md)

## Troubleshooting

### SQL Execution Failed
- Ensure you're in the SQL Editor
- Check for any error messages at the bottom
- Verify you have permission to create tables
- Copy-paste the entire script carefully

### Tables Not Showing
- Refresh the page
- Check the SQL Query result at the bottom
- Look for error messages

### RLS Policies Missing
- Scroll down in the SQL Editor log
- Check that all CREATE POLICY statements executed
- Go to Authentication → Policies to verify

## Support

If you have issues:
1. Check Supabase status page
2. Verify your API keys are correct
3. Review the error messages in SQL Editor
4. Check the backend logs for connection issues

---

**Database setup is the final piece before your application is fully operational!**
