# Frontend Routes

## Public Routes
- `/` - Landing page with product overview and CTA buttons
- `/login` - User login page
- `/register` - User registration page

## Protected Routes (require authentication)
- `/dashboard` - User dashboard with quick actions
- `/analysis/new` - Create new competitive analysis

## Route Protection
Protected routes use the `ProtectedRoute` component which:
- Checks authentication status via Zustand store
- Redirects to `/login` if not authenticated
- Allows access if authenticated

## Navigation Flow
1. User lands on `/` (landing page)
2. Clicks "Get Started" → `/register` or "Sign In" → `/login`
3. After successful auth → redirected to `/dashboard`
4. From dashboard → can navigate to `/analysis/new`
5. Invalid routes → redirect to `/`
