# Authentication Setup Guide

This guide explains how to set up and use authentication in the Task Reminder application.

## Overview

The application uses **Supabase Authentication** to provide secure user login and registration. Each task is associated with a specific user, ensuring data privacy and security.

## Features

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Protected Routes**: Task management pages require authentication
- **User-specific Tasks**: Each user can only view and manage their own tasks
- **Row Level Security (RLS)**: Database-level security ensures data isolation
- **Automatic User Association**: Tasks are automatically linked to the authenticated user

## Setup Instructions

### 1. Database Migration

After setting up your Supabase project, run the authentication migration to add user support:

**Using Supabase MCP** (if available):
```
Ask Claude: "Using Supabase MCP, please execute the SQL in supabase/auth-migration.sql"
```

**Using Supabase Dashboard**:
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New query"
4. Copy the contents of `supabase/auth-migration.sql`
5. Click "Run" to execute

This migration will:
- Add `user_id` column to the `tasks` table
- Create indexes for performance
- Update RLS policies to restrict access by user
- Add triggers to automatically set `user_id` on task creation

### 2. Configure Email Settings (Optional but Recommended)

For production, configure email settings in Supabase:

1. Go to **Authentication** > **Email Templates**
2. Customize confirmation and password reset emails
3. Go to **Settings** > **Auth**
4. Configure:
   - Site URL (your app URL)
   - Redirect URLs
   - Email confirmations (enable/disable)

### 3. Verify Authentication Setup

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:3000
3. You should be redirected to the login page
4. Create a new account to test sign-up
5. Check your email for verification (if enabled)
6. Sign in with your credentials

## User Flow

### Sign Up
1. User visits the app
2. Clicks "Don't have an account? Sign up"
3. Enters email and password (min 6 characters)
4. Submits the form
5. Receives confirmation email (if email confirmation is enabled)
6. Verifies email and signs in

### Sign In
1. User enters email and password
2. Submits the form
3. Redirected to the main task management page
4. Can now create and manage tasks

### Sign Out
1. User clicks the sign-out button in the header
2. Session is terminated
3. Redirected to login page

## Architecture

### Components

**AuthContext** (`contexts/AuthContext.tsx`):
- Manages authentication state
- Provides `user`, `session`, `loading` state
- Exposes `signUp`, `signIn`, `signOut` methods

**ProtectedRoute** (`components/ProtectedRoute.tsx`):
- Wrapper component for protected pages
- Redirects to login if user is not authenticated
- Shows loading state while checking auth

**Login Page** (`app/login/page.tsx`):
- Handles both sign-in and sign-up
- Form validation
- Error handling

### Database Security

**Row Level Security (RLS)** policies ensure that:
- Users can only SELECT their own tasks
- Users can only INSERT tasks for themselves
- Users can only UPDATE their own tasks
- Users can only DELETE their own tasks

**Automatic User Association**:
A database trigger automatically sets the `user_id` when creating a task:
```sql
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();
```

## Testing Authentication

### Test User Creation
```javascript
// In browser console (on login page)
// This is for testing only
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123'
});
console.log(data, error);
```

### Test Session Check
```javascript
// In browser console (when logged in)
const { data } = await supabase.auth.getSession();
console.log('Current session:', data);
```

### Test Task Access
1. Sign in as User A
2. Create some tasks
3. Sign out
4. Sign in as User B
5. Verify you can't see User A's tasks

## Email Configuration

### Development
By default, Supabase sends email confirmations. For development:

**Option 1: Disable email confirmation**
1. Go to Supabase Dashboard > **Authentication** > **Providers**
2. Click on **Email**
3. Disable "Confirm email"

**Option 2: Use the test email inbox**
1. Check your email for the confirmation link
2. Click to confirm
3. Return to app and sign in

### Production
For production, you should:
1. **Enable email confirmation** for security
2. **Configure custom SMTP** in Supabase settings
3. **Customize email templates** with your branding
4. **Set proper redirect URLs** for your domain

## Security Best Practices

### Password Requirements
Current minimum: 6 characters (enforced by Supabase)

To increase security, you can add client-side validation:
```typescript
if (password.length < 8) {
  setError('Password must be at least 8 characters');
  return;
}
if (!/[A-Z]/.test(password)) {
  setError('Password must contain an uppercase letter');
  return;
}
```

### Session Management
- Sessions are stored in localStorage by default
- Tokens are automatically refreshed by Supabase
- Sign-out clears all session data

### RLS Policies
Always keep RLS enabled in production:
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

Never disable RLS policies in production!

## Troubleshooting

### "Email not confirmed" error
- Check your email inbox for the confirmation link
- Or disable email confirmation in Supabase settings for development

### "Invalid login credentials" error
- Verify email and password are correct
- If you just signed up, confirm your email first
- Check Supabase Dashboard > Authentication > Users to see if user exists

### Infinite redirect loop
- Clear browser localStorage
- Check that `.env.local` has correct Supabase credentials
- Verify RLS policies are set up correctly

### Can't see any tasks
- Verify you're signed in (check user email in header)
- Check browser console for errors
- Verify RLS policies allow access for authenticated users
- Run the auth migration script if you haven't already

### Tasks from before auth migration
If you had tasks before adding authentication:
- They will have `user_id = NULL`
- They won't be visible to any user (due to RLS)
- To fix, update them manually in Supabase:
  ```sql
  UPDATE tasks
  SET user_id = 'your-user-id'
  WHERE user_id IS NULL;
  ```

## Migration Path

If you're upgrading from the localStorage version:

1. **Run the auth migration** to add `user_id` column
2. **Sign up** for an account
3. **Migrate localStorage data** using the MigrationHelper
   - The helper will create tasks for the current user
   - Old tasks will be associated with your user ID

## Advanced: Custom Auth Flows

### Social Login (Google, GitHub, etc.)
Supabase supports social login providers:

1. Configure in Supabase Dashboard > **Authentication** > **Providers**
2. Add provider buttons to login page:
```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
};
```

### Password Reset
Add password reset functionality:
```typescript
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/reset-password',
  });
};
```

### Multi-factor Authentication (MFA)
Enable MFA in Supabase for enhanced security.

## API Reference

### AuthContext

```typescript
const { user, session, loading, signUp, signIn, signOut } = useAuth();

// user: User | null - Current authenticated user
// session: Session | null - Current session
// loading: boolean - Auth state loading
// signUp: (email, password) => Promise - Register new user
// signIn: (email, password) => Promise - Sign in existing user
// signOut: () => Promise - Sign out current user
```

### ProtectedRoute

```typescript
<ProtectedRoute>
  {/* Your protected content */}
</ProtectedRoute>
```

Automatically redirects to `/login` if user is not authenticated.

## Support

For authentication issues:
- Check [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- Review your RLS policies in Supabase Dashboard
- Check browser console for errors
- Verify environment variables are set correctly
