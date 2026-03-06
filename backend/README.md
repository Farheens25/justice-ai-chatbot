# Justice AI Backend

A Node.js/Express backend for the Justice AI application with Supabase integration.

## Features

- **User Authentication**: Signup, login, and profile management
- **Role-Based Access**: Admin, Lawyer, and Police user types
- **Team Management**: Invite and manage team members
- **Case Management**: Create, track, and manage legal cases
- **Document Management**: Upload and organize case documents
- **Audit Logging**: Track all user activities
- **Row-Level Security**: Supabase RLS policies for data protection

## Prerequisites

- Node.js >= 16
- npm or pnpm
- Supabase account and project
- Supabase API keys (Anon Key and Service Role Key)

## Installation

1. **Install dependencies**:
```bash
npm install
# or
pnpm install
```

2. **Configure environment variables**:
   - Copy `.env` and update with your Supabase credentials
   - Update `JWT_SECRET` for production

3. **Set up database schema**:
   - Go to Supabase SQL Editor
   - Run the SQL script from `database/schema.sql`
   - This creates all tables, indexes, and RLS policies

## Running the Server

### Development
```bash
npm run dev
# Runs with nodemon (auto-reloads on changes)
```

### Production
```bash
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/type/:userType` - Get users by type

### Team Management
- `POST /api/team/invite` - Invite team member (admin only)
- `GET /api/team` - Get all team members (admin only)
- `DELETE /api/team/:userId` - Remove team member (admin only)
- `PUT /api/team/:userId/role` - Update team member role (admin only)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Example:
```bash
curl -H "Authorization: Bearer eyJ..." http://localhost:3001/api/users
```

## User Types

- **Admin**: Full access, can manage team members and all cases
- **Lawyer**: Can view assigned cases, upload documents
- **Police**: Can view assigned cases, upload evidence

## Supabase Setup Instructions

### 1. Create Supabase Tables
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Paste the content from `database/schema.sql`
- Execute the SQL

### 2. Set Environment Variables
Update your `.env` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Add Team Members (From Backend)
```bash
curl -X POST http://localhost:3001/api/team/invite \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "team@example.com",
    "userType": "lawyer"
  }'
```

## Security Notes

- **Never commit `.env` file** to version control
- **Service Role Key** should ONLY be used on the backend
- **Anon Key** is safe for frontend use
- Enable **Row Level Security (RLS)** on all tables (included in schema.sql)
- Update `JWT_SECRET` in production with a secure random string

## Database Schema

### Tables
- `users` - User profiles and metadata
- `cases` - Legal cases
- `case_documents` - Uploaded case files
- `case_activities` - Case activity log
- `audit_logs` - System audit trail

See `database/schema.sql` for details.

## Troubleshooting

### Connection Issues
- Verify Supabase URL is correct
- Check API keys are valid
- Ensure CORS is properly configured

### Authentication Errors
- Verify JWT_SECRET matches frontend
- Check token expiration time
- Ensure user exists in database

### Database Errors
- Run schema.sql to initialize tables
- Check RLS policies are enabled
- Verify user has appropriate permissions

## Development

### Project Structure
```
backend/
├── server.js           # Main app entry point
├── .env               # Environment variables
├── routes/
│   ├── auth.js        # Authentication routes
│   ├── users.js       # User management routes
│   └── team.js        # Team management routes
├── middleware/
│   └── auth.js        # JWT authentication middleware
├── utils/
│   └── supabase.js    # Supabase helper functions
├── database/
│   └── schema.sql     # Database schema
└── package.json
```

## Next Steps

- [ ] Set up email notifications for team invites
- [ ] Implement case management endpoints
- [ ] Add file upload to cloud storage
- [ ] Set up background jobs for automation
- [ ] Add comprehensive error handling and logging
- [ ] Implement rate limiting and security headers

## License

ISC

## Support

For issues or questions, contact the development team.
